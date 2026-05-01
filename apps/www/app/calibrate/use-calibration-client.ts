import mqtt, { type MqttClient } from 'mqtt';
import { useRef, useEffect, useState } from 'react';

const MQTT_USERNAME = "dumb";
const MQTT_PASSWORD = "nsbafNTiAdGOw1nnidRRXarZ9G9WVKVltVZB2Pim1yc=";
const MQTT_TOPIC = "devices/a37b86a1b4df2f130bc71abd1a4b0452b98132b6b61eed547b2d582147db69dd/posture";

export function useCalibrationClient(mqttWsUrl: string) {
    const client = useRef<MqttClient>(null);
    const [connecting, setConnecting] = useState(true);

    useEffect(() => {
        if (client.current != null) return;

        client.current = mqtt.connect(mqttWsUrl, {
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
            reconnectPeriod: 5_000,
        });

        function handleConnect() {
            client.current?.subscribe(MQTT_TOPIC);
        }

        function handleError(err: Error | mqtt.ErrorWithReasonCode) {
            console.error("MQTT Error:", err);
        }

        function handleMessage(topic: string, buf: Buffer<ArrayBufferLike>) {
            if (connecting) setConnecting(false);
            const data = JSON.parse(buf.toString());
            console.log(data);
        }

        client.current.on("connect", handleConnect);
        client.current.on("error", handleError);
        client.current.on("message", handleMessage);

        return () => {
            if (client.current == null) return;
            client.current.removeListener("connect", handleConnect);
            client.current.removeListener("error", handleError);
            client.current.removeListener("message", handleMessage);
            client.current.unsubscribe(MQTT_TOPIC);
            client.current = null;
        };
    }, []);

    return { client, connecting };
}

