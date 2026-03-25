"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

/**
 * Physical layout of GPIO sensors on the pad.
 * Adjust this to match the actual sensor placement.
 */
const PAD_LAYOUT: GpioKey[][] = [
    ["gpio14", "gpio25"],
    ["gpio26", "gpio27"],
    ["gpio32", "gpio33"],
    ["gpio34", "gpio35"],
    ["gpio36", "gpio39"],
];

const POLL_INTERVAL_MS = 2000;

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

function postureLabel(label: string): string {
    switch (label) {
        case 'mega_slouching':
            return 'Mega Slouching';
        case 'good':
            return 'Good';
        case 'no_seated':
            return 'Not Seated'
        default:
            return label;
    }
}

export function LiveHeatMap() {
    const [devices, setDevices] = useState<string[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [reading, setReading] = useState<PostureRow | null>(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const STALE_THRESHOLD_MS = 10_000;

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

    useEffect(() => {
        if (!selectedDevice) return;

        const poll = () => {
            fetchLatestReading(selectedDevice).then((row) => {
                if (row) setReading(row as PostureRow);
            });
        };

        // Always fetch once so we know the current state
        poll();

        // Only keep polling while seated
        if (isLive) {
            intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [selectedDevice, isLive]);

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
    const normalize = (v: number | null) => (v != null ? (v - min) / range : null);

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg">Live Pressure Map</CardTitle>
                        {reading && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Reading #{reading.id}
                                {reading.label && (
                                    <>
                                        {" "}&middot;{" "}
                                        <Badge variant="secondary" className="ml-1">
                                            {postureLabel(reading.label)}
                                        </Badge>
                                    </>
                                )}
                                {" "}&middot; {new Date(reading.createdAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Device selector */}
                        <select
                            className="rounded border bg-background px-2 py-1 text-sm"
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
                        {/* Seated status indicator */}
                        <span
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                isLive
                                    ? "bg-green-500/15 text-green-600 dark:text-green-400"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            <span
                                className={`inline-block h-2 w-2 rounded-full ${
                                    isLive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                                }`}
                            />
                            {isLive ? "Live" : "Not Seated"}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!reading ? (
                    <Skeleton className="h-[340px] w-full" />
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        {/* Heat map grid */}
                        <div className="flex flex-col gap-2">
                            {PAD_LAYOUT.map((pinsInRow, ri) => (
                                <div key={ri} className="flex gap-2 justify-center">
                                    {pinsInRow.map((pin) => {
                                        const raw = reading[pin];
                                        const norm = normalize(raw);
                                        const bg = norm != null ? valueToColor(norm) : undefined;
                                        return (
                                            <div
                                                key={pin}
                                                className="relative w-24 h-20 rounded-xl flex flex-col items-center justify-center transition-colors duration-500"
                                                style={{
                                                    backgroundColor: bg ?? "hsl(var(--muted))",
                                                }}
                                            >
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Low</span>
                            <div
                                className="h-3 w-40 rounded-full"
                                style={{
                                    background:
                                        "linear-gradient(to right, rgb(59,130,246), rgb(34,197,194), rgb(250,204,21), rgb(239,68,68))",
                                }}
                            />
                            <span>High</span>
                            <span className="ml-2 tabular-nums">
                                ({min} – {max})
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}