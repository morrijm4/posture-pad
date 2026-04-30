import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import mqtt from "mqtt";

function loadRootEnv() {
    const rootDir = path.resolve(import.meta.dirname, "../../..");
    const envFiles = [
        path.join(rootDir, ".env"),
        path.join(rootDir, ".env.local"),
    ];

    for (const filePath of envFiles) {
        if (!fs.existsSync(filePath)) {
            continue;
        }

        const raw = fs.readFileSync(filePath, "utf8");
        for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) {
                continue;
            }

            const separator = trimmed.indexOf("=");
            if (separator === -1) {
                continue;
            }

            const key = trimmed.slice(0, separator);
            const value = trimmed.slice(separator + 1);
            if (!(key in process.env)) {
                process.env[key] = value;
            }
        }
    }
}

function postureDisplayLabel(label) {
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
        default:
            return label ?? "Unknown";
    }
}

function postureIntensity(label) {
    switch (label) {
        case "good":
            return 0.15;
        case "leaning_left":
        case "leaning_right":
            return 0.55;
        case "slouching":
            return 0.82;
        case "mega_slouching":
            return 1;
        case "no_seated":
            return 0;
        default:
            return 0.35;
    }
}

function average(values) {
    const present = values.filter((value) => Number.isFinite(value));
    if (present.length === 0) {
        return 0;
    }
    return present.reduce((sum, value) => sum + value, 0) / present.length;
}

function normalizeSensorValues(sensorValues) {
    const values = Object.values(sensorValues).filter((value) => Number.isFinite(value));
    if (values.length === 0) {
        return Object.fromEntries(Object.keys(sensorValues).map((key) => [key, 0]));
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return Object.fromEntries(
        Object.entries(sensorValues).map(([key, value]) => [
            key,
            Number.isFinite(value) ? (value - min) / range : 0,
        ])
    );
}

function resolveStateFilePath() {
    if (process.env.POSTUREPAD_WIDGET_STATE_PATH) {
        return process.env.POSTUREPAD_WIDGET_STATE_PATH;
    }

    return path.join(os.homedir(), ".posturepad", "widget-state.json");
}

function writeStateFile(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    fs.renameSync(tempPath, filePath);
}

function extractDeviceId(topic) {
    const match = topic.match(/^devices\/([^/]+)\/posture$/);
    return match ? match[1] : null;
}

loadRootEnv();

const explicitDeviceId = process.argv[2] || process.env.POSTUREPAD_WIDGET_DEVICE_ID || null;
const mqttUrl = process.env.NEXT_PUBLIC_MQTT_WS_URL;
const topicTemplate = process.env.NEXT_PUBLIC_MQTT_TOPIC_TEMPLATE ?? "devices/{deviceId}/posture";
const mqttUsername = process.env.NEXT_PUBLIC_MQTT_USERNAME ?? "mqtt-listener";
const mqttPassword = process.env.NEXT_PUBLIC_MQTT_PASSWORD ?? process.env.MQTT_PWD;
const stateFilePath = resolveStateFilePath();
const subscribedTopic = explicitDeviceId
    ? topicTemplate.replace("{deviceId}", explicitDeviceId)
    : topicTemplate.replace("{deviceId}", "+");

if (!mqttUrl) {
    console.error("Missing NEXT_PUBLIC_MQTT_WS_URL in env.");
    process.exit(1);
}

if (!mqttPassword) {
    console.error("Missing NEXT_PUBLIC_MQTT_PASSWORD or MQTT_PWD in env.");
    process.exit(1);
}

console.log(`PosturePad widget bridge listening on ${subscribedTopic}`);
console.log(`Writing widget state to ${stateFilePath}`);

const client = mqtt.connect(mqttUrl, {
    username: mqttUsername,
    password: mqttPassword,
    reconnectPeriod: 5_000,
});

client.on("connect", () => {
    client.subscribe(subscribedTopic, (error) => {
        if (error) {
            console.error("Failed to subscribe:", error.message);
        }
    });
});

client.on("message", (topic, payload) => {
    const deviceId = extractDeviceId(topic);
    if (!deviceId) {
        return;
    }

    let message;
    try {
        message = JSON.parse(payload.toString("utf8"));
    } catch {
        return;
    }

    const sensors = message?.sensors ?? {};
    const sensorValues = {
        gpio32: Number(sensors.GPIO32 ?? 0),
        gpio33: Number(sensors.GPIO33 ?? 0),
        gpio34: Number(sensors.GPIO34 ?? 0),
        gpio35: Number(sensors.GPIO35 ?? 0),
        gpio36: Number(sensors.GPIO36 ?? 0),
        gpio39: Number(sensors.GPIO39 ?? 0),
    };

    const normalized = normalizeSensorValues(sensorValues);

    const payloadToWrite = {
        deviceId,
        label: typeof message?.posture === "string" ? message.posture : "unknown",
        displayLabel: postureDisplayLabel(message?.posture),
        isLive: message?.posture !== "no_seated",
        updatedAt: new Date().toISOString(),
        intensity: postureIntensity(message?.posture),
        edges: {
            top: average([normalized.gpio33, normalized.gpio36]),
            bottom: average([normalized.gpio32, normalized.gpio35]),
            left: average([normalized.gpio33, normalized.gpio34, normalized.gpio32]),
            right: average([normalized.gpio36, normalized.gpio39, normalized.gpio35]),
        },
        sensors: normalized,
    };

    writeStateFile(stateFilePath, payloadToWrite);
});

client.on("error", (error) => {
    console.error("MQTT bridge error:", error.message);
});
