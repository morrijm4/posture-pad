import { pgTable, integer, decimal, varchar, timestamp, index } from "drizzle-orm/pg-core";

export const postureTable = pgTable("posture", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    deviceId: varchar('device_id'),
    deviceTimestamp: integer("device_timestamp"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    label: varchar(),
    gpio2: decimal(),
    gpio3: decimal(),
    gpio4: decimal(),
    gpio5: decimal(),
    gpio6: decimal(),
    gpio7: decimal(),
    gpio32: decimal(),
    gpio33: decimal(),
    gpio34: decimal(),
    gpio35: decimal(),
    gpio36: decimal(),
    gpio39: decimal(),
}, (table) => [
    index("device_id_created_at_idx").on(table.deviceId, table.createdAt),
])
