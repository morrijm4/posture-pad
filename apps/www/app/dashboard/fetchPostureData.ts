'use server'

import { Repository } from '@pp/db/repo';
import { loadenv } from '@pp/loadenv/api';

if (process.env.NODE_ENV === 'development') {
    loadenv();
}

export async function fetchPostureData(page: number = 1, perPage: number = 25, deviceId?: string) {
    const repo = new Repository();
    try {
        return await repo.getPostureData({ page, perPage, deviceId });
    } finally {
        await repo.close();
    }
}

export async function fetchDeviceIds() {
    const repo = new Repository();
    try {
        return await repo.getDeviceIds();
    } finally {
        await repo.close();
    }
}

export async function fetchLatestReading(deviceId: string) {
    const repo = new Repository();
    try {
        return await repo.getLatestReading(deviceId);
    } finally {
        await repo.close();
    }
}

export async function fetchPostureLabelCounts(deviceId?: string) {
    const repo = new Repository();
    try {
        return await repo.getPostureLabelCounts(deviceId);
    } finally {
        await repo.close();
    }
}
