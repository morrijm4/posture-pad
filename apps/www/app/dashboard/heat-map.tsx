"use client";

import { useEffect, useRef, useState } from "react";
import mqtt, { type MqttClient } from "mqtt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDeviceIds, fetchLatestReading } from "./fetchPostureData";

const GPIO_PINS = ["gpio14", "gpio25", "gpio26", "gpio27", "gpio32", "gpio33", "gpio34", "gpio35", "gpio36", "gpio39"] as const;
type GpioKey = (typeof GPIO_PINS)[number];

type PostureRow = {
    id: number;
    deviceId: string | null;
    deviceTimestamp: number | null;
    createdAt: Date;
    label: string | null;
} & Record<GpioKey, number | null>;

type SensorPosition = {
    pin: GpioKey;
    top: string;
    left: string;
};

type ViewportSize = "mobile" | "tablet" | "desktop";

/**
 * Explicit sensor positions are more reliable than flex row spacing here,
 * especially for the top pairs that were being clipped off the map.
 */
const SENSOR_POSITIONS: Record<ViewportSize, SensorPosition[]> = {
    mobile: [
        { pin: "gpio14", top: "35%", left: "41%" },
        { pin: "gpio25", top: "35%", left: "59%" },
        { pin: "gpio26", top: "49%", left: "38%" },
        { pin: "gpio27", top: "49%", left: "62%" },
        { pin: "gpio32", top: "58%", left: "34%" },
        { pin: "gpio33", top: "58%", left: "66%" },
        { pin: "gpio34", top: "65%", left: "38%" },
        { pin: "gpio35", top: "65%", left: "62%" },
        { pin: "gpio36", top: "65%", left: "46%" },
        { pin: "gpio39", top: "65%", left: "54%" },
    ],
    tablet: [
        { pin: "gpio14", top: "35%", left: "40%" },
        { pin: "gpio25", top: "35%", left: "60%" },
        { pin: "gpio26", top: "50%", left: "37%" },
        { pin: "gpio27", top: "50%", left: "63%" },
        { pin: "gpio32", top: "59%", left: "33%" },
        { pin: "gpio33", top: "59%", left: "67%" },
        { pin: "gpio34", top: "66%", left: "37%" },
        { pin: "gpio35", top: "66%", left: "63%" },
        { pin: "gpio36", top: "66%", left: "46%" },
        { pin: "gpio39", top: "66%", left: "54%" },
    ],
    desktop: [
        { pin: "gpio14", top: "35%", left: "38%" },
        { pin: "gpio25", top: "35%", left: "62%" },
        { pin: "gpio26", top: "50%", left: "35%" },
        { pin: "gpio27", top: "50%", left: "65%" },
        { pin: "gpio32", top: "59%", left: "30%" },
        { pin: "gpio33", top: "59%", left: "70%" },
        { pin: "gpio34", top: "66%", left: "35%" },
        { pin: "gpio35", top: "66%", left: "65%" },
        { pin: "gpio36", top: "66%", left: "45%" },
        { pin: "gpio39", top: "66%", left: "55%" },
    ],
};

const MQTT_WS_URL = process.env.NEXT_PUBLIC_MQTT_WS_URL;
const MQTT_USERNAME = process.env.NEXT_PUBLIC_MQTT_USERNAME;
const MQTT_TOPIC_TEMPLATE = process.env.NEXT_PUBLIC_MQTT_TOPIC_TEMPLATE ?? "devices/{deviceId}/posture";
const STALE_THRESHOLD_MS = 10_000;

function valueToColor(normalized: number): string {
    const clamped = Math.max(0, Math.min(1, normalized));
    const stops = [
        { pos: 0, r: 59, g: 130, b: 246 },
        { pos: 0.33, r: 34, g: 197, b: 194 },
        { pos: 0.66, r: 250, g: 204, b: 21 },
        { pos: 1, r: 239, g: 68, b: 68 },
    ];
    let lower = stops[0];
    let upper = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
        if (clamped >= stops[i].pos && clamped <= stops[i + 1].pos) {
            lower = stops[i];
            upper = stops[i + 1];
            break;
        }
    }
    const range = upper.pos - lower.pos || 1;
    const t = (clamped - lower.pos) / range;
    const r = Math.round(lower.r + (upper.r - lower.r) * t);
    const g = Math.round(lower.g + (upper.g - lower.g) * t);
    const b = Math.round(lower.b + (upper.b - lower.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
}

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

export function LiveHeatMap() {
    const [devices, setDevices] = useState<string[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [reading, setReading] = useState<PostureRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
    const [mqttPassword, setMqttPassword] = useState("");
    const [realtimeEnabled, setRealtimeEnabled] = useState(false);
    const mqttClientRef = useRef<MqttClient | null>(null);
    const activeTopicRef = useRef<string | null>(null);

    const isLive =
        reading != null &&
        reading.label !== "no_seated" &&
        Date.now() - new Date(reading.createdAt).getTime() < STALE_THRESHOLD_MS;

    // Load device list on mount
    useEffect(() => {
        fetchDeviceIds().then((ids) => {
            setDevices(ids);
            if (ids.length > 0) setSelectedDevice(ids[0]);
            setLoading(false);
        });
    }, []);

    const refreshLatestReading = async (deviceId: string, opts?: { quiet?: boolean }) => {
        if (!opts?.quiet) {
            setRefreshing(true);
        }

        try {
            const row = await fetchLatestReading(deviceId);
            if (row) {
                setReading(row as PostureRow);
            }
        } finally {
            if (!opts?.quiet) {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        if (!selectedDevice) {
            if (activeTopicRef.current && mqttClientRef.current) {
                mqttClientRef.current.unsubscribe(activeTopicRef.current);
                activeTopicRef.current = null;
            }
            return;
        }

        let cancelled = false;

        const hydrateLatestReading = async () => {
            if (!cancelled) {
                await refreshLatestReading(selectedDevice, { quiet: true });
            }
        };

        void hydrateLatestReading();

        return () => {
            cancelled = true;
        };
    }, [selectedDevice]);

    useEffect(() => {
        if (!realtimeEnabled) {
            mqttClientRef.current?.end(true);
            mqttClientRef.current = null;
            activeTopicRef.current = null;
            return;
        }

        if (!selectedDevice) {
            if (activeTopicRef.current && mqttClientRef.current) {
                mqttClientRef.current.unsubscribe(activeTopicRef.current);
                activeTopicRef.current = null;
            }
            return;
        }

        const topic = topicForDevice(selectedDevice);

        if (!MQTT_WS_URL) {
            return;
        }

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

            setReading((previous) => buildLiveReadingUpdate(message, selectedDevice, previous));
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
    }, [mqttPassword, realtimeEnabled, selectedDevice]);

    useEffect(() => {
        return () => {
            mqttClientRef.current?.end(true);
            mqttClientRef.current = null;
            activeTopicRef.current = null;
        };
    }, []);

    useEffect(() => {
        const updateViewportSize = () => {
            if (window.innerWidth < 640) {
                setViewportSize("mobile");
                return;
            }
            if (window.innerWidth < 1024) {
                setViewportSize("tablet");
                return;
            }
            setViewportSize("desktop");
        };

        updateViewportSize();
        window.addEventListener("resize", updateViewportSize);

        return () => {
            window.removeEventListener("resize", updateViewportSize);
        };
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader><CardTitle className="text-lg">Live Pressure Map</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-[340px] w-full" /></CardContent>
            </Card>
        );
    }

    if (devices.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle className="text-lg">Live Pressure Map</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-center py-8 text-muted-foreground">No devices found.</p>
                </CardContent>
            </Card>
        );
    }

    let min = Infinity;
    let max = -Infinity;
    if (reading) {
        for (const pin of GPIO_PINS) {
            const v = reading[pin];
            if (v != null) {
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }
    }
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 1;
    const range = max - min || 1;
    const normalize = (v: number | null) => ((v ?? 0) - min) / range;
    const sensorPositions = SENSOR_POSITIONS[viewportSize];
    const glowBlur = viewportSize === "mobile" ? "4px" : viewportSize === "tablet" ? "6px" : "10px";

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg">Live Pressure Map</CardTitle>
                        {reading && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span
                                    className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${isLive
                                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                                        : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-2 w-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                                            }`}
                                    />
                                    {isLive ? "Live" : "Not Seated"}
                                </span>
                                {reading.id > 0 && <span>Reading #{reading.id}</span>}
                                {reading.label && (
                                    <Badge variant="secondary">
                                        {postureLabel(reading.label)}
                                    </Badge>
                                )}
                                <span>{new Date(reading.createdAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                    <form
                        className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3"
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
                        {/* Device selector */}
                        <select
                            className="w-full min-w-0 max-w-full rounded border bg-background px-2 py-1 text-sm sm:w-[22rem] sm:max-w-[22rem]"
                            value={selectedDevice ?? ""}
                            onChange={(e) => {
                                setSelectedDevice(e.target.value);
                                setReading(null);
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
                            className="w-full sm:w-48"
                            value={mqttPassword}
                            onChange={(e) => setMqttPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant={realtimeEnabled ? "secondary" : "default"}
                            className="w-full sm:w-auto"
                            disabled={!realtimeEnabled && (!MQTT_WS_URL || mqttPassword.trim().length === 0)}
                        >
                            {realtimeEnabled ? "Disable Realtime" : "Enable Realtime"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            isLoading={refreshing}
                            disabled={!selectedDevice}
                            onClick={() => {
                                if (!selectedDevice) return;
                                void refreshLatestReading(selectedDevice);
                            }}
                        >
                            Refresh
                        </Button>
                    </form>
                </div>
            </CardHeader>
            <CardContent>
                {!reading ? (
                    <Skeleton className="h-[340px] w-full" />
                ) : (
                    <div
                        className="relative mx-auto aspect-[4/3.2] w-full max-w-[54rem] overflow-visible rounded-2xl isolate"
                    >
                        <div
                            className="absolute inset-0 rounded-2xl bg-center bg-no-repeat -scale-y-100 -z-0"
                            style={{
                                backgroundImage: "url('/Top_Drawing.png')",
                                backgroundSize: viewportSize === "mobile" ? "96% auto" : viewportSize === "tablet" ? "98% auto" : "112% auto",
                            }}
                        />
                        <div className="absolute inset-0 z-10">
                            {sensorPositions.map(({ pin, top, left }) => {
                                const raw = reading[pin];
                                const norm = normalize(raw);
                                const color = valueToColor(norm);

                                return (
                                    <div
                                        key={pin}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                                        style={{
                                            top,
                                            left,
                                        }}
                                    >
                                        <div
                                            className="absolute left-1/2 top-1/2 h-16 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-20 sm:w-24 lg:h-24 lg:w-28"
                                            style={{
                                                background: `radial-gradient(circle, ${color} 0%, transparent 50%)`,
                                                filter: `blur(${glowBlur})`,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="absolute bottom-2 left-1/2 z-10 flex w-[calc(100%-1.5rem)] max-w-max -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-background/80 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-sm sm:bottom-3 sm:w-auto sm:text-xs">
                            <span>Low</span>
                            <div
                                className="h-3 w-24 rounded-full sm:w-32 lg:w-40"
                                style={{
                                    background:
                                        "linear-gradient(to right, rgb(59,130,246), rgb(34,197,194), rgb(250,204,21), rgb(239,68,68))",
                                }}
                            />
                            <span>High</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
