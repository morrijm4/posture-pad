"use client";

import mqtt, { type MqttClient } from 'mqtt';
import { useState, useEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { Button } from "@/components/ui/button";

const MQTT_WS_URL = process.env.NEXT_PUBLIC_MQTT_WS_URL;
const MQTT_USERNAME = "dumb";
const MQTT_PASSWORD = "nsbafNTiAdGOw1nnidRRXarZ9G9WVKVltVZB2Pim1yc=";
const MQTT_TOPIC = "devices/a37b86a1b4df2f130bc71abd1a4b0452b98132b6b61eed547b2d582147db69dd/posture";
const DATA_COLLECTION_THRESHOLD = 2;

type Label = "good" | "slouching" | "right" | "left" | "mega";

type StageProps = {
    next: () => void;
}

type PostureData = { label: Label, from: number, to: number };

type PostureStageProps = {
    message: string;
    label: Label;
    clientRef: RefObject<MqttClient | null>;
    setData: Dispatch<SetStateAction<PostureData[]>>;
};

type PostureStageStates = "start" | "countdown" | "collect" | "standup"

interface CountdownProps {
    seconds: number;
}


const POSTURE_STAGES: Array<{ message: string, label: Label }> = [
    {
        message: "Sit in good posture",
        label: "good",
    },
    {
        message: "Sit with a slouch",
        label: "slouching",
    },
    {
        message: "Lean to the right",
        label: "right",
    },
    {
        message: "Lean to the left",
        label: "left",
    },
    {
        message: "Sit in a MEGA SLOUCH",
        label: "mega",
    },
];

export default function Page() {
    if (typeof MQTT_WS_URL !== 'string') throw new Error("NO WS URL");

    const [i, setIndex] = useState(0);
    const [data, setData] = useState<PostureData[]>([]);
    useEffect(() => console.log("Posture data", data), [data]);


    const client = useRef<MqttClient>(null);
    const [connecting, setConnecting] = useState(true);
    useEffect(() => {
        if (client.current != null) return;

        client.current = mqtt.connect(MQTT_WS_URL, {
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
            reconnectPeriod: 5_000,
        });

        client.current.on("connect", (packet) => {
            setConnecting(false)
            client.current?.subscribe(MQTT_TOPIC);
        })
        client.current.on("error", (err) => console.error("Error!", err));
        client.current.on("message", (topic, buf, _packet) => {
            const data = JSON.parse(buf.toString());
            console.log(data);
        })

        return () => {
            if (client.current == null) return;
            client.current.unsubscribe(MQTT_TOPIC);
            client.current = null;
        }
    }, []);

    if (connecting) return;

    const stages = [
        <StartStage next={next} />,
        ...POSTURE_STAGES.map(s => <PostureStage key={s.message} next={next} setData={setData} clientRef={client} {...s} />),
        <EndStage next={next} />
    ];

    function next() {
        setIndex(i => i < stages.length ? ++i : i);
    }
    return (
        <div className="flex flex-col gap-8 max-w-lg mx-auto my-36">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Calibration</h1>
            </div>
            {stages[i]}
        </div>
    );
}

function StartStage(props: StageProps) {
    return (
        <div className="flex flex-1">
            <Button onClick={props.next}>Begin</Button>
        </div>
    );
}

function EndStage(props: StageProps) {
    return "All set!"
}

function PostureStage(props: PostureStageProps & StageProps) {
    return (
        <div className='flex flex-col gap-4'>
            <h2>{props.message}</h2>
            <div>
                <PostureStageSwitch standups={1} {...props} />
            </div>
        </div>
    );
}

function PostureStageSwitch(props: { standups: number } & PostureStageProps & StageProps) {
    const [state, setState] = useState<PostureStageStates>("start");
    const [standups, setStandups] = useState(props.standups);

    function standupNext() {
        if (standups > 0) setState("countdown");
        else props.next();
        setStandups(s => s - 1);
    }

    switch (state) {
        case "start":
            return <Button onClick={() => setState("countdown")}>Start</Button>
        case "countdown":
            return <Countdown seconds={1} next={() => setState("collect")} back={() => { }} />
        case "collect":
            return <Collect {...props} next={() => setState("standup")} />;
        case "standup":
            return <Standup standups={standups} next={standupNext} back={() => { }} />
    }
}

function Countdown({ seconds, next }: CountdownProps & StageProps) {
    const [time, setTime] = useState(seconds);

    useEffect(() => {
        if (time <= 0) next();
        const timerId = setTimeout(() => setTime(t => Math.max(0, t - 1)), 1000);
        return () => clearTimeout(timerId);
    }, [time]);

    return <div>Starting in... {time}</div>
}

function Collect({ clientRef, next, label, setData }: PostureStageProps & StageProps) {
    const count = useRef(0);
    const [collecting, setCollecting] = useState(true);

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

    useEffect(() => {
        if (!collecting) return next();
        clientRef.current?.on("message", handleMessage);
        return () => void clientRef.current?.removeListener("message", handleMessage);
    }, [collecting]);

    return "Collecting data"
}

function Standup(props: { standups: number } & StageProps) {
    if (props.standups == 0) {
        return (
            <div>
                <h2>Awesome! Now lets move on to the next one.</h2>
                <Button onClick={props.next}>Start</Button>
            </div>
        );
    }

    return (
        <div>
            <h2>Great! Now stand up and stretch and sit back down. Then click the start button when you are ready to go.</h2>
            <Button onClick={props.next}>Start</Button>
        </div>
    );
}

