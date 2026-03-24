import mqtt from 'mqtt';
import { Repository } from '@pp/db/repo';

async function main() {
    const url = process.env.BROKER_URL;

    if (typeof url !== 'string') {
        throw new Error("BROKER_URL not set!");
    }

    const repo = new Repository();
    const client = mqtt.connect(url);

    // client.subscribe("devices/+/posture");
    client.subscribe("#");

    console.log("Connected to broker");

    client.on("message", async (topic, buf) => {
        console.log(topic, buf.toString());
        const [d, deviceId, p] = topic.split("/");

        if (d !== 'devices' && typeof deviceId !== 'string' && p !== 'posture') {
            return;
        }

        const data = json(buf);
        if (data == null) return;

        const {
            timestamp,
            posture,
            sensors,
        } = data;

        if (!isObject(sensors)) return;

        const {
            GPIO14,
            GPIO25,
            GPIO26,
            GPIO27,
            GPIO32,
            GPIO33,
            GPIO34,
            GPIO35,
            GPIO36,
            GPIO39,
        } = sensors;

        const insert = {
            deviceId,
            deviceTimestamp: int(timestamp),
            label: str(posture),
            gpio14: int(GPIO14),
            gpio25: int(GPIO25),
            gpio26: int(GPIO26),
            gpio27: int(GPIO27),
            gpio32: int(GPIO32),
            gpio33: int(GPIO33),
            gpio34: int(GPIO34),
            gpio35: int(GPIO35),
            gpio36: int(GPIO36),
            gpio39: int(GPIO39),
        };

        await repo.insertPosture(insert)
    });
}

function json(buf: Buffer): Record<string, unknown> | undefined {
    try {
        return JSON.parse(buf.toString());
    } catch (e) {
        console.error("Error parsing data");
        console.error(e);
    }
}

function isObject(x: unknown): x is Record<string, unknown> {
    return x != null && typeof x === 'object' && !Array.isArray(x)
}

function str(x: unknown): string | undefined {
    if (typeof x === 'string') return x;
}


function int(x: unknown): number | undefined {
    if (typeof x === 'number') return x;
}

main();
