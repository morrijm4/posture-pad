import 'loadenv';
import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;

if (typeof url !== 'string') {
    throw new Error("DATABASE_URL environment variable not set");
}

export default defineConfig({
    out: './drizzle',
    schema: './tables/**',
    dialect: 'postgresql',
    dbCredentials: {
        url,
    }
})
