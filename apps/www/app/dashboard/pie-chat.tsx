"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export type LabelCountRow = {
    label: string | null;
    count: number;
};

type ChartSlice = {
    label: string;
    count: number;
    color: string;
    ratio: number;
};

const LABEL_COLORS: Record<string, string> = {
    Good: "#22c55e",
    "Leaning Left": "#f59e0b",
    "Leaning Right": "#3b82f6",
    "Mega Slouching": "#ef4444",
    "Not Seated": "#94a3b8",
    Slouching: "#f97316",
    Unlabeled: "#a855f7",
};

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

export function PosturePieChart({
    counts,
    loading,
}: {
    counts: LabelCountRow[];
    loading: boolean;
}) {
    const slices = useMemo<ChartSlice[]>(() => {
        const total = counts.reduce((sum, row) => sum + Number(row.count), 0);

        return counts
            .map((row) => {
                const label = postureLabel(row.label);
                return {
                    label,
                    count: Number(row.count),
                    color: LABEL_COLORS[label] ?? "#64748b",
                    ratio: total === 0 ? 0 : Number(row.count) / total,
                };
            })
            .filter((slice) => slice.count > 0);
    }, [counts]);

    const totalReadings = slices.reduce((sum, slice) => sum + slice.count, 0);
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <Card>
            <CardHeader className="pb-4">
                <div>
                    <CardTitle className="text-lg">Posture Distribution</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Historical posture labels for the selected device
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[340px] w-full" />
                ) : totalReadings === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No posture data available for this device.
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-center">
                        <div className="mx-auto flex w-full max-w-[22rem] items-center justify-center">
                            <svg viewBox="0 0 200 200" className="h-[18rem] w-[18rem]">
                                <g transform="rotate(-90 100 100)">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r={radius}
                                        fill="none"
                                        stroke="hsl(var(--muted))"
                                        strokeWidth="24"
                                    />
                                    {slices.map((slice) => {
                                        const dash = slice.ratio * circumference;
                                        const segment = (
                                            <circle
                                                key={slice.label}
                                                cx="100"
                                                cy="100"
                                                r={radius}
                                                fill="none"
                                                stroke={slice.color}
                                                strokeWidth="24"
                                                strokeDasharray={`${dash} ${circumference - dash}`}
                                                strokeDashoffset={-offset}
                                                strokeLinecap="butt"
                                            />
                                        );
                                        offset += dash;
                                        return segment;
                                    })}
                                </g>
                            </svg>
                        </div>

                        <div className="grid gap-3">
                            {slices.map((slice) => (
                                <div
                                    key={slice.label}
                                    className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: slice.color }}
                                        />
                                        <span className="text-sm font-medium">{slice.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">{slice.count}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {(slice.ratio * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
