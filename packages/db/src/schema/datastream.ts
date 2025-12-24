import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  pgEnum,
  uniqueIndex,
  varchar,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { template } from "./template";
import { deviceState } from "./deviceState";
import { telemetry } from "./telemetry";

export const dataTypes = ["INT", "DOUBLE", "BOOL", "STRING"] as const;
export const dataTypeEnum = pgEnum("data_type", dataTypes);

export const datastream = pgTable(
  "datastream",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => template.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    pin: varchar("pin", { length: 50 }).notNull(),
    dataType: dataTypeEnum("data_type").notNull(),
    min: doublePrecision("min"),
    max: doublePrecision("max"),
    defaultValue: text("default_value"),
  },
  (table) => [
    uniqueIndex("datastream_template_pin_idx").on(table.templateId, table.pin),
  ],
);

export const datastreamRelations = relations(datastream, ({ one, many }) => ({
  template: one(template, {
    fields: [datastream.templateId],
    references: [template.id],
  }),
  deviceStates: many(deviceState),
  telemetries: many(telemetry),
}));
