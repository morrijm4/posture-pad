import mqtt from 'mqtt';
import { NewsletterRepository } from '@pp/db/repos/newsletter';

async function main() {
    const repo = new NewsletterRepository();
    const users = await repo.get({ perPage: 1 });

    for (const { id, name } of users) {
        console.log(id, name);
    }

    const url = process.env.BROKER_URL;
    if (typeof url !== 'string') {
        throw new Error("BROKER_URL not set!");
    }

    const client = mqtt.connect(url);
    const topic = "foo"
    client.subscribe(topic);
    console.log(`Subscribed to ${topic}! worrrrrrrd`);

    client.on("message", (topic, buf) => {
        console.log(topic, buf.toString());
    });
}

main();
