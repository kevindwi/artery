import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  doublePrecision,
  bigint,
} from "drizzle-orm/pg-core";
import { device } from "./device";
import { datastream } from "./datastream";

export const deviceState = pgTable(
  "device_state",
  {
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
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    reportedAt: timestamp("reported_at"),
  },
  (table) => ({
    pk: { columns: [table.deviceId, table.datastreamId], primaryKey: true },
  }),
);

export const deviceStateRelations = relations(deviceState, ({ one }) => ({
  device: one(device, {
    fields: [deviceState.deviceId],
    references: [device.id],
  }),
  datastream: one(datastream, {
    fields: [deviceState.datastreamId],
    references: [datastream.id],
  }),
}));
