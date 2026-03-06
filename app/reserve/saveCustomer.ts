'use server'

import { PostHog } from 'posthog-node';
import { encrypt } from '@/lib/encrypt';

interface SaveCustomerInput {
    sessionId: string;
    distinctId: string;
    name: string;
    email: string;
};

export async function saveCustomer({ distinctId, sessionId, name, email }: SaveCustomerInput) {
    const postHog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        flushInterval: 0,
        flushAt: 1,
    })

    await postHog.captureImmediate({
        event: 'reserve_signup',
        distinctId,
        properties: {
            sessionId,
            name: encrypt(name),
            email: encrypt(email),
        },
    });
    await postHog.shutdown();
}
