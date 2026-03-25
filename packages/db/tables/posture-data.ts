import { pgTable, integer, varchar, timestamp, index } from "drizzle-orm/pg-core";

export const postureTable = pgTable("posture", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    deviceId: varchar('device_id'),
    deviceTimestamp: integer("device_timestamp"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    label: varchar(),
    gpio14: integer(),
    gpio25: integer(),
    gpio26: integer(),
    gpio27: integer(),
    gpio32: integer(),
    gpio33: integer(),
    gpio34: integer(),
    gpio35: integer(),
    gpio36: integer(),
    gpio39: integer(),
}, (table) => [
    index("device_id_created_at_idx").on(table.deviceId, table.createdAt),
])
