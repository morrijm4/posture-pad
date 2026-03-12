import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

export const newsletterTable = pgTable("newsletter", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull(),
    email: varchar().notNull(),
})
