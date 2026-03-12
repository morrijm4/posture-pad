'use server'

import { PostHog } from 'posthog-node';
import { encrypt } from '@/lib/encrypt';
import { NewsletterRepository } from '@pp/db/repos/newsletter';
import { loadenv } from '@pp/loadenv/api';

interface SaveCustomerInput {
    sessionId: string;
    distinctId: string;
    name: string;
    email: string;
};

if (process.env.NODE_ENV === 'development') {
    loadenv();
}

export async function saveCustomer({ distinctId, sessionId, name, email }: SaveCustomerInput) {
    name = encrypt(name);
    email = encrypt(email);

    const [_, db] = await Promise.allSettled([
        savePostHog({ distinctId, sessionId, name, email }),
        saveDb(name, email),
    ]);

    if (db.status === 'rejected') {
        throw new Error("Failed to save to db")
    }
}

async function savePostHog({ distinctId, sessionId, name, email }: SaveCustomerInput) {
    const postHog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        flushInterval: 0,
        flushAt: 1,
    })

    try {
        await postHog.captureImmediate({
            event: 'reserve_signup',
            distinctId,
            properties: {
                sessionId,
                name,
                email,
            },
        });
    } catch (e) {
        console.error(e);
    } finally {
        await postHog.shutdown();
    }


}

async function saveDb(name: string, email: string) {
    const repo = new NewsletterRepository()
    await repo.insert({ name, email })
    await repo.close()
}
