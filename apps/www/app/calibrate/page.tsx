"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, TimerReset, Waves } from "lucide-react";
import { type MqttClient } from 'mqtt';
import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { useCalibrationClient } from './use-calibration-client';

const MQTT_WS_URL = process.env.NEXT_PUBLIC_MQTT_WS_URL;
const DATA_COLLECTION_COUNTDOWN_SECONDS = 3;
const DATA_COLLECTION_THRESHOLD = 10;
const DATA_COLLECTION_STANDUPS = 0;

type Label = "good" | "slouch" | "right" | "left" | "mega";

type StageProps = {
    next: () => void
};

type StageControlsProps = StageProps & {
    back?: () => void
};

type PostureData = { label: Label; from: number; to: number };

type PostureStageProps = {
    message: string;
    label: Label;
    clientRef: RefObject<MqttClient | null>;
    setData: Dispatch<SetStateAction<PostureData[]>>;
};

type PostureStageState = "start" | "countdown" | "collect" | "standup";

type CountdownProps = {
    seconds: number;
}

type PostureStageConfig = {
    message: string;
    label: Label;
};

type PostureStageSwitchProps = { standups: number } & PostureStageProps & StageProps;

const POSTURE_STAGES: PostureStageConfig[] = [
    {
        message: "Sit in a MEGA SLOUCH",
        label: "mega",
    },
    {
        message: "Sit in good posture",
        label: "good",
    },
    {
        message: "Sit with a slouch",
        label: "slouch",
    },
    {
        message: "Lean to the right",
        label: "right",
    },
    {
        message: "Lean to the left",
        label: "left",
    },
];

function createStages(
    next: () => void,
    client: RefObject<MqttClient | null>,
    setData: Dispatch<SetStateAction<PostureData[]>>,
) {
    return [
        <StartStage key="start" next={next} />,
        ...POSTURE_STAGES.map((stage) => (
            <PostureStage key={stage.message} next={next} setData={setData} clientRef={client} {...stage} />
        )),
        <EndStage key="end" next={next} />,
    ];
}

function labelToTitle(label: Label) {
    switch (label) {
        case "good":
            return "Good";
        case "slouch":
            return "Slouch";
        case "right":
            return "Right";
        case "left":
            return "Left";
        case "mega":
            return "Mega slouch";
    }
}

export default function Page() {
    if (typeof MQTT_WS_URL !== 'string') throw new Error("NO WS URL");

    let [i, setIndex] = useState(0);
    const [data, setData] = useState<PostureData[]>([]);
    useEffect(() => console.log("Posture data", data), [data]);

    const { client, connecting } = useCalibrationClient(MQTT_WS_URL);

    async function next() {
        if (i < stages.length) setIndex(++i);

        if (i === stages.length - 1) {
            // try {
            //     const res = await fetch("https://pp.mattymo.dev/train", {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json"
            //         },
            //         body: JSON.stringify({
            //             device_id: "a37b86a1b4df2f130bc71abd1a4b0452b98132b6b61eed547b2d582147db69dd",
            //             num_samples: DATA_COLLECTION_THRESHOLD,
            //             data,
            //         }),
            //     });

            //     console.log(res.status, res.statusText, await res.text());
            // } catch (err) {
            //     console.error("Error sending training data");
            //     console.error(err);
            // }
        }
    }

    const stages = createStages(next, client, setData);
    const totalStages = POSTURE_STAGES.length + 2;
    const currentStep = Math.min(i + 1, totalStages);
    const postureStageIndex = i - 1;

    return (
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
                <section className="text-center">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary/80">Calibration</p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tighter sm:text-5xl">Teach PosturePad how you sit</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                        Follow each posture prompt for a quick guided setup. This only changes the presentation of the flow, not how calibration works.
                    </p>
                </section>

                <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
                    <CardHeader className="gap-5 border-b bg-card/80 pb-5 backdrop-blur-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl tracking-tight">Sensor training</CardTitle>
                                <CardDescription className="max-w-xl text-sm md:text-base">
                                    Stay steady during each reading, then reset your posture before moving to the next prompt.
                                </CardDescription>
                            </div>
                            <div className="rounded-full border bg-background px-4 py-2 text-sm font-medium text-muted-foreground">
                                Step {currentStep} of {totalStages}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${(currentStep / totalStages) * 100}%` }}
                                />
                            </div>
                            <div className="grid gap-2 sm:grid-cols-5">
                                {POSTURE_STAGES.map((stage, index) => {
                                    const isActive = postureStageIndex === index;
                                    const isComplete = postureStageIndex > index || i === stages.length - 1;

                                    return (
                                        <div
                                            key={stage.label}
                                            className={[
                                                "flex items-center rounded-xl border px-3 py-2 text-left transition-colors",
                                                isActive ? "border-primary bg-primary/5" : "border-border/60 bg-background/70",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isComplete ? (
                                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <CircleDashed className={isActive ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
                                                )}
                                                <span className={isActive ? "text-sm font-semibold text-foreground" : "text-sm font-medium text-muted-foreground"}>
                                                    {labelToTitle(stage.label)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8">
                        {connecting ? (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 text-center">
                                <Waves className="h-8 w-8 text-primary" />
                                <div className="space-y-2">
                                    <p className="text-lg font-semibold">Connecting to your device</p>
                                    <p className="text-sm text-muted-foreground">
                                        Waiting for the calibration session to come online.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            stages[i]
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

function StartStage(props: StageProps) {
    return (
        <div className="flex min-h-72 flex-col justify-between gap-8 rounded-2xl border bg-gradient-to-br from-background to-primary/5 p-6 md:p-8">
            <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TimerReset className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Start calibration</h2>
                    <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                        You&apos;ll move through five short posture examples. Hold each position while data is captured, then continue when prompted.
                    </p>
                </div>
            </div>

            <div className="flex justify-start">
                <Button size="lg" onClick={props.next}>Begin</Button>
            </div>
        </div>
    );
}

function EndStage(props: StageProps) {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border bg-gradient-to-br from-primary/5 to-background px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">All set</h2>
                <p className="max-w-md text-sm text-muted-foreground md:text-base">
                    Calibration is complete. Your posture samples have been collected.
                </p>
            </div>
        </div>
    );
}

function PostureStage(props: PostureStageProps & StageProps) {
    return (
        <div className='flex flex-col gap-6 rounded-2xl border bg-background p-6 shadow-sm md:p-8'>
            <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">Current posture</p>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{props.message}</h2>
                <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                    Hold this position steadily when the collection step begins. You&apos;ll get a prompt before moving on.
                </p>
            </div>
            <div>
                <PostureStageSwitch standups={DATA_COLLECTION_STANDUPS} {...props} />
            </div>
        </div>
    );
}

function PostureStageSwitch(props: PostureStageSwitchProps) {
    const [state, setState] = useState<PostureStageState>("start");
    const [standups, setStandups] = useState(props.standups);

    function standupNext() {
        if (standups > 0) setState("countdown");
        else props.next();
        setStandups(s => s - 1);
    }

    switch (state) {
        case "start":
            return (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-base font-medium">Ready when you are</p>
                            <p className="text-sm text-muted-foreground">Begin the countdown once you&apos;re settled into position.</p>
                        </div>
                        <Button onClick={() => setState("countdown")}>Start</Button>
                    </div>
                </div>
            );
        case "countdown":
            return <Countdown seconds={DATA_COLLECTION_COUNTDOWN_SECONDS} next={() => setState("collect")} />
        case "collect":
            return <Collect {...props} next={() => setState("standup")} />;
        case "standup":
            return <Standup standups={standups} next={standupNext} />
    }
}

function Countdown({ seconds, next }: CountdownProps & StageControlsProps) {
    const [time, setTime] = useState(seconds);

    useEffect(() => {
        if (time <= 0) next();
        const timerId = setTimeout(() => setTime(t => Math.max(0, t - 1)), 1000);
        return () => clearTimeout(timerId);
    }, [time]);

    return (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border bg-primary/5 px-6 py-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">Get ready</p>
            <div className="mt-3 text-5xl font-bold tracking-tighter text-foreground">{time}</div>
            <p className="mt-3 text-sm text-muted-foreground">Starting in... hold your posture steady.</p>
        </div>
    );
}

function Collect({ clientRef, next, label, setData }: PostureStageProps & StageProps) {
    const count = useRef(0);
    const [collecting, setCollecting] = useState(true);


    useEffect(() => {
        if (!collecting) return next();

        function handleMessage(_topic: string, buf: Buffer<ArrayBufferLike>) {
            const msg: { timestamp: number } = JSON.parse(buf.toString());

            count.current++;

            if (count.current === 1) {
                setData((prev) => [{ label, from: msg.timestamp, to: 0 }, ...prev])
            } else if (count.current === DATA_COLLECTION_THRESHOLD) {
                setData((prev) => [{ ...prev[0], to: msg.timestamp }, ...prev.slice(1)])
                setCollecting(false);
            }
        }

        clientRef.current?.on("message", handleMessage);
        return () => void clientRef.current?.removeListener("message", handleMessage);
    }, [collecting]);

    return (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border bg-muted/20 px-6 py-8 text-center">
            <Waves className="h-8 w-8 animate-pulse text-primary" />
            <p className="mt-4 text-lg font-semibold">Collecting data</p>
            <p className="mt-2 text-sm text-muted-foreground">Keep still for a brief moment while the reading is recorded.</p>
        </div>
    );
}

function Standup(props: { standups: number } & StageControlsProps) {
    if (props.standups == 0) {
        return (
            <div className="rounded-2xl border bg-primary/5 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">Nice. Let&apos;s move to the next posture.</h2>
                        <p className="text-sm text-muted-foreground">When you&apos;re ready, continue to the next guided sample.</p>
                    </div>
                    <Button onClick={props.next}>Continue</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border bg-muted/20 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">Reset before the next sample</h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Stand up, stretch, and sit back down. Start again once you&apos;re comfortable and ready to continue.
                    </p>
                </div>
                <Button onClick={props.next}>Start</Button>
            </div>
        </div>
    );
}
