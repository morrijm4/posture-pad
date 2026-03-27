"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const GPIO_PINS = [
    "gpio32",
    "gpio33",
    "gpio34",
    "gpio35",
    "gpio36",
    "gpio39"
] as const;
export type GpioKey = (typeof GPIO_PINS)[number];

export type PostureRow = {
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

const STALE_THRESHOLD_MS = 10_000;
const HEAT_MAP_TRANSITION_MS = 450;

const SENSOR_POSITIONS: Record<ViewportSize, SensorPosition[]> = {
    mobile: [
        { pin: "gpio35", top: "72%", left: "54%" },
        { pin: "gpio36", top: "58%", left: "61%" },
        { pin: "gpio34", top: "65%", left: "38%" },
        { pin: "gpio39", top: "65%", left: "62%" },
        { pin: "gpio32", top: "72%", left: "46%" },
        { pin: "gpio33", top: "58%", left: "39%" },
    ],
    tablet: [
        { pin: "gpio35", top: "75%", left: "54%" },
        { pin: "gpio36", top: "55%", left: "62%" },
        { pin: "gpio34", top: "66%", left: "37%" },
        { pin: "gpio39", top: "66%", left: "63%" },
        { pin: "gpio32", top: "75%", left: "46%" },
        { pin: "gpio33", top: "55%", left: "38%" },
    ],
    desktop: [
        { pin: "gpio35", top: "75%", left: "55%" },
        { pin: "gpio36", top: "55%", left: "65%" },
        { pin: "gpio34", top: "66%", left: "35%" },
        { pin: "gpio39", top: "66%", left: "65%" },
        { pin: "gpio32", top: "75%", left: "45%" },
        { pin: "gpio33", top: "55%", left: "35%" },
    ],
};

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

export function LiveHeatMap({
    reading,
    loading,
}: {
    reading: PostureRow | null;
    loading: boolean;
}) {
    const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
    const [animatedValues, setAnimatedValues] = useState<Record<GpioKey, number>>(() =>
        Object.fromEntries(GPIO_PINS.map((pin) => [pin, 0])) as Record<GpioKey, number>
    );
    const animatedValuesRef = useRef(animatedValues);

    const isLive =
        reading != null &&
        reading.label !== "no_seated" &&
        Date.now() - new Date(reading.createdAt).getTime() < STALE_THRESHOLD_MS;

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

    useEffect(() => {
        animatedValuesRef.current = animatedValues;
    }, [animatedValues]);

    useEffect(() => {
        const targetValues = Object.fromEntries(
            GPIO_PINS.map((pin) => [pin, Number(reading?.[pin] ?? 0)])
        ) as Record<GpioKey, number>;

        const startValues = animatedValuesRef.current;

        if (GPIO_PINS.every((pin) => startValues[pin] === targetValues[pin])) {
            return;
        }

        let frameId = 0;
        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / HEAT_MAP_TRANSITION_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const nextValues = Object.fromEntries(
                GPIO_PINS.map((pin) => [
                    pin,
                    startValues[pin] + (targetValues[pin] - startValues[pin]) * eased,
                ])
            ) as Record<GpioKey, number>;

            animatedValuesRef.current = nextValues;
            setAnimatedValues(nextValues);

            if (progress < 1) {
                frameId = window.requestAnimationFrame(animate);
            }
        };

        frameId = window.requestAnimationFrame(animate);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [reading]);

    if (loading) {
        return (
            <Card>
                <CardHeader><CardTitle className="text-lg">Live Pressure Map</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-[340px] w-full" /></CardContent>
            </Card>
        );
    }

    let min = Infinity;
    let max = -Infinity;
    if (reading) {
        for (const pin of GPIO_PINS) {
            const v = animatedValues[pin];
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
            </CardHeader>
            <CardContent>
                {!reading ? (
                    <Skeleton className="h-[340px] w-full" />
                ) : (
                    <div className="relative mx-auto aspect-[4/3.2] w-full max-w-[54rem] overflow-visible rounded-2xl isolate">
                        <div
                            className="absolute inset-0 -z-0 rounded-2xl bg-center bg-no-repeat -scale-y-100"
                            style={{
                                backgroundImage: "url('/Top_Drawing.png')",
                                backgroundSize: viewportSize === "mobile" ? "96% auto" : viewportSize === "tablet" ? "98% auto" : "112% auto",
                            }}
                        />
                        <div className="absolute inset-0 z-10">
                            {sensorPositions.map(({ pin, top, left }) => {
                                const raw = animatedValues[pin];
                                const norm = normalize(raw);
                                const color = valueToColor(norm);

                                return (
                                    <div
                                        key={pin}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                                        style={{ top, left }}
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
