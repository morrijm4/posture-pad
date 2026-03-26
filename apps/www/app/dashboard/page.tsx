"use client";

import { useEffect, useState } from "react";
import { fetchPostureData } from "./fetchPostureData";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Activity, Cpu, Clock, Hash } from "lucide-react";
import { LiveHeatMap } from "./heat-map";
import { PosturePieChart } from "./pie-chat";

const GPIO_PINS = ["gpio14", "gpio25", "gpio26", "gpio27", "gpio32", "gpio33", "gpio34", "gpio35", "gpio36", "gpio39"] as const;
type GpioKey = typeof GPIO_PINS[number];

type PostureRow = {
    id: number;
    deviceId: string | null;
    deviceTimestamp: number | null;
    createdAt: Date;
    label: string | null;
} & Record<GpioKey, number | null>;

const PER_PAGE = 25;

export default function DashboardPage() {
    const [data, setData] = useState<PostureRow[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetchPostureData(page, PER_PAGE)
            .then((rows) => setData(rows as PostureRow[]))
            .finally(() => setLoading(false));
    }, [page]);

    const totalReadings = data.length;
    const uniqueDevices = new Set(data.map((r) => r.deviceId).filter(Boolean)).size;
    const latestTimestamp = data.length
        ? new Date(Math.max(...data.map((r) => new Date(r.createdAt).getTime()))).toLocaleString()
        : "—";
    const uniqueLabels = new Set(data.map((r) => r.label).filter(Boolean)).size;

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Posture Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Sensor readings from PosturePad devices
                </p>
            </div>

            {/* Summary Cards */}
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

            {/* Live Heat Map */}
            <LiveHeatMap />

            {/* Pie Chart */}
            <PosturePieChart />

            {/* Data Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">Sensor Readings</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Prev
                        </Button>
                        <span className="text-sm text-muted-foreground">Page {page}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={data.length < PER_PAGE || loading}
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
                        <div className="text-center py-12 text-muted-foreground">
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
                                    {data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-mono text-xs">
                                                {row.id}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.deviceId ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                {row.label ? (
                                                    <Badge variant="secondary">{row.label}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap">
                                                {new Date(row.createdAt).toLocaleString()}
                                            </TableCell>
                                            {GPIO_PINS.map((pin) => (
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
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}