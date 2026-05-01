import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from 'postgres';
import { desc, eq, sql } from "drizzle-orm";
import { newsletterTable } from './tables/newsletter';
import { postureTable } from "./tables/posture-data";

interface GetOptions {
    page?: number;
    perPage?: number;
    deviceId?: string;
};

export class Repository {
    db: PostgresJsDatabase;
    client: ReturnType<typeof postgres>

    constructor() {
        const url = process.env.DATABASE_URL;

        if (typeof url !== 'string') {
            throw new Error("DATABASE_URL not set for Repository")
        }

        this.client = postgres(url, { prepare: false })
        this.db = drizzle({ client: this.client });
    }

    async insertNewsletterRecipient(row: typeof newsletterTable.$inferInsert) {
        await this.db.insert(newsletterTable).values(row);
    }

    async getNewsletterRecipient({ page = 1, perPage = 10 }: GetOptions = {}) {
        return this.db
            .select()
            .from(newsletterTable)
            .orderBy(newsletterTable.id)
            .limit(perPage)
            .offset((page - 1) * perPage)
    }

    async insertPosture(row: typeof postureTable.$inferInsert) {
        return this.db.insert(postureTable).values(row).returning();
    }

    async close() {
        await this.client.end();
    }

    async [Symbol.asyncDispose]() {
        await this.close();
    }

    async getPostureData({ page = 1, perPage = 10, deviceId }: GetOptions = {}) {
        const baseQuery = this.db.select().from(postureTable);

        if (typeof deviceId === "string") {
            return baseQuery
                .where(eq(postureTable.deviceId, deviceId))
                .orderBy(desc(postureTable.id))
                .limit(perPage)
                .offset((page - 1) * perPage);
        }

        return baseQuery
            .orderBy(desc(postureTable.id))
            .limit(perPage)
            .offset((page - 1) * perPage)
    }

    async getDeviceIds() {
        const rows = await this.db
            .selectDistinct({ deviceId: postureTable.deviceId })
            .from(postureTable);
        return rows.map((r) => r.deviceId).filter((id): id is string => id != null);
    }

    async getLatestReading(deviceId: string) {
        const rows = await this.db
            .select()
            .from(postureTable)
            .where(eq(postureTable.deviceId, deviceId))
            .orderBy(desc(postureTable.id))
            .limit(1);
        return rows[0] ?? null;
    }

    async getPostureLabelCounts(deviceId?: string) {
        const countExpr = sql<number>`count(*)`;
        const query = this.db
            .select({
                label: postureTable.label,
                count: countExpr,
            })
            .from(postureTable)
            .groupBy(postureTable.label)
            .orderBy(desc(countExpr));

        if (deviceId) {
            return query.where(eq(postureTable.deviceId, deviceId));
        }

        return query;
    }
}
