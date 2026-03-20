import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { newsletterTable } from '../tables/newsletter';
import postgres from 'postgres';

interface GetOptions {
    page?: number;
    perPage?: number;
};

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

    async get({ page = 1, perPage = 10 }: GetOptions = {}) {
        return this.db
            .select()
            .from(newsletterTable)
            .orderBy(newsletterTable.id)
            .limit(perPage)
            .offset((page - 1) * perPage)
    }

    async close() {
        await this.client.end();
    }

    async [Symbol.asyncDispose]() {
        await this.close();
    }
}
