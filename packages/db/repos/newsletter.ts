import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { newsletterTable } from '../tables/newsletter';
import postgres from 'postgres';

export class NewsletterRepository {
    db: PostgresJsDatabase;
    client: ReturnType<typeof postgres>

    constructor() {
        const url = process.env.DATABASE_URL;

        if (typeof url !== 'string') {
            throw new Error("DATABASE_URL not set for NewsletterRepository")
        }

        this.client = postgres(url, { prepare: false })
        this.db = drizzle({ client: this.client });
    }

    async insert(row: typeof newsletterTable.$inferInsert) {
        await this.db.insert(newsletterTable).values(row);
    }

    async get(page: number = 1, pageSize: number = 10) {
        return this.db
            .select()
            .from(newsletterTable)
            .orderBy(newsletterTable.id)
            .limit(pageSize)
            .offset((page - 1) * pageSize)
    }

    async close() {
        await this.client.end();
    }

    async [Symbol.asyncDispose]() {
        await this.close();
    }
}
