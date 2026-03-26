"use client";

import { useEffect, useRef, useState } from "react";
import mqtt, { type MqttClient } from "mqtt";
import { fetchDeviceIds, fetchLatestReading, fetchPostureData, fetchPostureLabelCounts } from "./fetchPostureData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Activity, Cpu, Clock, Hash } from "lucide-react";
import { LiveHeatMap, type PostureRow } from "./heat-map";
import { PosturePieChart, type LabelCountRow } from "./pie-chat";

const GPIO_PINS = ["gpio14", "gpio25", "gpio26", "gpio27", "gpio32", "gpio33", "gpio34", "gpio35", "gpio36", "gpio39"] as const;
type GpioKey = typeof GPIO_PINS[number];

const PER_PAGE = 25;
const MQTT_WS_URL = process.env.NEXT_PUBLIC_MQTT_WS_URL;
const MQTT_USERNAME = process.env.NEXT_PUBLIC_MQTT_USERNAME;
const MQTT_TOPIC_TEMPLATE = process.env.NEXT_PUBLIC_MQTT_TOPIC_TEMPLATE ?? "devices/{deviceId}/posture";

function postureLabel(label: string | null): string {
    switch (label) {
        case "mega_slouching":
            return "Mega Slouching";
        case "slouching":
            return "Slouching";
        case "good":
            return "Good";
        case "no_seated":
            return "Not Seated";
        case "leaning_left":
            return "Leaning Left";
        case "leaning_right":
            return "Leaning Right";
        case null:
            return "Unlabeled";
        default:
            return label;
    }
}

function topicForDevice(deviceId: string): string {
    return MQTT_TOPIC_TEMPLATE.replace("{deviceId}", deviceId);
}

function parseJsonMessage(buf: Uint8Array): Record<string, unknown> | null {
    try {
        return JSON.parse(new TextDecoder().decode(buf)) as Record<string, unknown>;
    } catch {
        return null;
    }
}

function asObject(value: unknown): Record<string, unknown> | null {
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return null;
}

function asNumber(value: unknown): number | null {
    return typeof value === "number" ? value : null;
}

function asString(value: unknown): string | null {
    return typeof value === "string" ? value : null;
}

function buildLiveReadingUpdate(
    message: Record<string, unknown>,
    deviceId: string,
    previous: PostureRow | null,
): PostureRow {
    const sensors = asObject(message.sensors);
    const next: PostureRow = {
        id: previous?.id ?? 0,
        deviceId,
        deviceTimestamp: asNumber(message.timestamp) ?? previous?.deviceTimestamp ?? null,
        createdAt: new Date(),
        label: asString(message.posture) ?? previous?.label ?? null,
        gpio14: previous?.gpio14 ?? null,
        gpio25: previous?.gpio25 ?? null,
        gpio26: previous?.gpio26 ?? null,
        gpio27: previous?.gpio27 ?? null,
        gpio32: previous?.gpio32 ?? null,
        gpio33: previous?.gpio33 ?? null,
        gpio34: previous?.gpio34 ?? null,
        gpio35: previous?.gpio35 ?? null,
        gpio36: previous?.gpio36 ?? null,
        gpio39: previous?.gpio39 ?? null,
    };

    for (const pin of GPIO_PINS) {
        const mqttKey = pin.toUpperCase();
        const nextValue = asNumber(sensors?.[mqttKey]);
        if (nextValue != null) {
            next[pin] = nextValue;
        }
    }

    return next;
}

export default function DashboardPage() {
    const [devices, setDevices] = useState<string[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [reading, setReading] = useState<PostureRow | null>(null);
    const [counts, setCounts] = useState<LabelCountRow[]>([]);
    const [data, setData] = useState<PostureRow[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [mqttPassword, setMqttPassword] = useState("");
    const [realtimeEnabled, setRealtimeEnabled] = useState(false);
    const mqttClientRef = useRef<MqttClient | null>(null);
    const activeTopicRef = useRef<string | null>(null);

    useEffect(() => {
        let active = true;

        fetchDeviceIds().then((ids) => {
            if (!active) return;
            setDevices(ids);
            setSelectedDevice(ids[0] ?? null);
            if (ids.length === 0) {
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    const loadDashboardData = async (opts?: { quiet?: boolean }) => {
        if (!selectedDevice) {
            setReading(null);
            setCounts([]);
            setData([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (opts?.quiet) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const [latestRow, rows, nextCounts] = await Promise.all([
                fetchLatestReading(selectedDevice),
                fetchPostureData(page, PER_PAGE, selectedDevice),
                fetchPostureLabelCounts(selectedDevice),
            ]);
            const nextData = rows as PostureRow[];
            setData(nextData);
            setReading((latestRow as PostureRow | null) ?? null);
            setCounts(nextCounts as LabelCountRow[]);
        } finally {
            if (opts?.quiet) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        void loadDashboardData({ quiet: true });
    }, [page, selectedDevice]);

    useEffect(() => {
        if (!realtimeEnabled) {
            mqttClientRef.current?.end(true);
            mqttClientRef.current = null;
            activeTopicRef.current = null;
            return;
        }

        if (!selectedDevice || !MQTT_WS_URL) {
            return;
        }

        const topic = topicForDevice(selectedDevice);
        const client =
            mqttClientRef.current ??
            mqtt.connect(MQTT_WS_URL, {
                username: MQTT_USERNAME,
                password: mqttPassword,
                reconnectPeriod: 5_000,
            });
        mqttClientRef.current = client;

        const subscribeToTopic = () => {
            if (activeTopicRef.current && activeTopicRef.current !== topic) {
                client.unsubscribe(activeTopicRef.current);
            }
            activeTopicRef.current = topic;
            client.subscribe(topic);
        };

        const handleConnect = () => {
            subscribeToTopic();
        };

        const handleMessage = (messageTopic: string, payload: Uint8Array) => {
            if (messageTopic !== topic) return;

            const message = parseJsonMessage(payload);
            if (message == null) return;

            setReading((previous) => {
                const next = buildLiveReadingUpdate(message, selectedDevice, previous);

                setCounts((previousCounts) => {
                    const index = previousCounts.findIndex((entry) => entry.label === next.label);
                    if (index === -1) {
                        return [...previousCounts, { label: next.label, count: 1 }];
                    }

                    const updated = [...previousCounts];
                    updated[index] = {
                        ...updated[index],
                        count: Number(updated[index].count) + 1,
                    };
                    return updated;
                });

                if (page === 1) {
                    setData((previousData) => [next, ...previousData].slice(0, PER_PAGE));
                }

                return next;
            });
        };

        client.on("connect", handleConnect);
        client.on("reconnect", subscribeToTopic);
        client.on("message", handleMessage);

        if (client.connected) {
            handleConnect();
        } else {
            subscribeToTopic();
        }

        return () => {
            client.off("connect", handleConnect);
            client.off("reconnect", subscribeToTopic);
            client.off("message", handleMessage);
            if (activeTopicRef.current === topic) {
                client.unsubscribe(topic);
                activeTopicRef.current = null;
            }
        };
    }, [mqttPassword, page, realtimeEnabled, selectedDevice]);

    useEffect(() => {
        return () => {
            mqttClientRef.current?.end(true);
            mqttClientRef.current = null;
            activeTopicRef.current = null;
        };
    }, []);

    const totalReadings = data.length;
    const uniqueDevices = new Set(data.map((r) => r.deviceId).filter(Boolean)).size;
    const latestTimestamp = data.length
        ? new Date(Math.max(...data.map((r) => new Date(r.createdAt).getTime()))).toLocaleString()
        : "—";
    const uniqueLabels = new Set(data.map((r) => r.label).filter(Boolean)).size;

    return (
        <div className="container mx-auto space-y-8 px-4 py-8">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Posture Dashboard</h1>
                <p className="mt-1 text-muted-foreground">
                    Sensor readings from PosturePad devices
                </p>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-lg">Dashboard Controls</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Device selection, manual refresh, and realtime updates for the full dashboard
                            </p>
                        </div>
                        <form
                            className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-3"
                            autoComplete="on"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!realtimeEnabled && MQTT_WS_URL && mqttPassword.trim().length > 0) {
                                    setRealtimeEnabled(true);
                                    return;
                                }
                                if (realtimeEnabled) {
                                    setRealtimeEnabled(false);
                                }
                            }}
                        >
                            <select
                                className="w-full min-w-0 max-w-full rounded border bg-background px-2 py-1 text-sm lg:w-[22rem] lg:max-w-[22rem]"
                                value={selectedDevice ?? ""}
                                onChange={(e) => {
                                    setSelectedDevice(e.target.value || null);
                                    setPage(1);
                                }}
                            >
                                {devices.map((id) => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </select>
                            <Input
                                type="password"
                                name="password"
                                placeholder="MQTT password"
                                autoComplete="current-password"
                                className="w-full lg:w-48"
                                value={mqttPassword}
                                onChange={(e) => setMqttPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                variant={realtimeEnabled ? "secondary" : "default"}
                                className="w-full lg:w-auto"
                                disabled={!realtimeEnabled && (!MQTT_WS_URL || mqttPassword.trim().length === 0)}
                            >
                                {realtimeEnabled ? "Disable Realtime" : "Enable Realtime"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full lg:w-auto"
                                isLoading={refreshing}
                                disabled={!selectedDevice}
                                onClick={() => {
                                    void loadDashboardData();
                                }}
                            >
                                Refresh
                            </Button>
                        </form>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Readings"
                    value={loading ? null : totalReadings.toString()}
                    icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                    description="on this page"
                />
                <SummaryCard
                    title="Devices"
                    value={loading ? null : uniqueDevices.toString()}
                    icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
                    description="unique devices"
                />
                <SummaryCard
                    title="Latest Reading"
                    value={loading ? null : latestTimestamp}
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    description="most recent entry"
                    valueClassName="text-sm"
                />
                <SummaryCard
                    title="Labels"
                    value={loading ? null : uniqueLabels.toString()}
                    icon={<Hash className="h-4 w-4 text-muted-foreground" />}
                    description="distinct labels"
                />
            </div>

            <LiveHeatMap reading={reading} loading={loading} />

            <PosturePieChart counts={counts} loading={loading} />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">Sensor Readings</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || loading || refreshing}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Prev
                        </Button>
                        <span className="text-sm text-muted-foreground">Page {page}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={data.length < PER_PAGE || loading || refreshing}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            No posture data found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Label</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        {GPIO_PINS.map((pin) => (
                                            <TableHead key={pin} className="text-center">
                                                {pin.replace("gpio", "GPIO ")}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow key={`${row.id}-${row.createdAt.toString()}-${index}`}>
                                            <TableCell className="font-mono text-xs">
                                                {row.id > 0 ? row.id : "live"}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.deviceId ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                {row.label ? (
                                                    <Badge variant="secondary">{postureLabel(row.label)}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-xs">
                                                {new Date(row.createdAt).toLocaleString()}
                                            </TableCell>
                                            {GPIO_PINS.map((pin: GpioKey) => (
                                                <TableCell
                                                    key={pin}
                                                    className="text-center font-mono text-xs"
                                                >
                                                    {row[pin] ?? "—"}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    description,
    valueClassName,
}: {
    title: string;
    value: string | null;
    icon: React.ReactNode;
    description: string;
    valueClassName?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {value === null ? (
                    <Skeleton className="h-7 w-24" />
                ) : (
                    <div className={valueClassName ?? "text-2xl font-bold"}>{value}</div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
