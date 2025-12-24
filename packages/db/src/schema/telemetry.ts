import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  doublePrecision,
  bigint,
  index,
} from "drizzle-orm/pg-core";
import { device } from "./device";
import { datastream } from "./datastream";

export const telemetry = pgTable(
  "telemetry",
  {
    id: text("id").primaryKey(),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id, { onDelete: "cascade" }),
    datastreamId: text("datastream_id")
      .notNull()
      .references(() => datastream.id, { onDelete: "cascade" }),
    valueLong: bigint("value_long", { mode: "bigint" }),
    valueDouble: doublePrecision("value_double"),
    valueBoolean: boolean("value_boolean"),
    valueString: varchar("value_string"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    reportedAt: timestamp("reported_at"),
  },
  (table) => [
    index("telemetry_device_time_idx").on(table.deviceId, table.timestamp),
    index("telemetry_datastream_time_idx").on(
      table.datastreamId,
      table.timestamp,
    ),
  ],
);

export const telemetryRelations = relations(telemetry, ({ one }) => ({
  device: one(device, {
    fields: [telemetry.deviceId],
    references: [device.id],
  }),
  datastream: one(datastream, {
    fields: [telemetry.datastreamId],
    references: [datastream.id],
  }),
}));
