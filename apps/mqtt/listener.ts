import mqtt from 'mqtt';
import { Repository } from '@pp/db/repo';
import { postureTable } from '@pp/db/tables/posture-data';

async function main() {
    const pwd = process.env.MQTT_PWD;

    if (typeof pwd !== 'string')
        throw new Error("MQTT_PWD not set!");

    const repo = new Repository();
    const client = mqtt.connect("mqtts://pp.mattymo.dev", {
        username: 'mqtt-listener',
        password: pwd,
        port: 8883,
        rejectUnauthorized: true,
    });

    // client.subscribe("devices/+/posture");
    client.subscribe("#");

    client.on("connect", () => console.log("Connected to broker. Swag!"));
    client.on("error", (error) => console.error("Error connecting: ", error))

    client.on("message", async (topic, buf) => {
        console.log(topic, buf.toString());

        const [d, deviceId, p] = topic.split("/");

        if (d !== 'devices' || typeof deviceId !== 'string' || p !== 'posture') {
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
            GPIO2,
            GPIO3,
            GPIO4,
            GPIO5,
            GPIO6,
            GPIO7,
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
            gpio2: str(GPIO2),
            gpio3: str(GPIO3),
            gpio4: str(GPIO4),
            gpio5: str(GPIO5),
            gpio6: str(GPIO6),
            gpio7: str(GPIO7),
            gpio32: str(GPIO32),
            gpio33: str(GPIO33),
            gpio34: str(GPIO34),
            gpio35: str(GPIO35),
            gpio36: str(GPIO36),
            gpio39: str(GPIO39),
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
    if (typeof x === 'number') return x.toString();
}


function int(x: unknown): number | undefined {
    if (typeof x === 'number') return x;
}

main();
