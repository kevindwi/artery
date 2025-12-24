import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./organization";
import { user } from "./user";
import { datastream } from "./datastream";
import { device } from "./device";

export const template = pgTable("template", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  hardwarePlatform: text("hardware_platform"),
  connectionType: text("connection_type"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "cascade",
  }),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "cascade",
  }),
});

export const templateRelations = relations(template, ({ one, many }) => ({
  organization: one(organization, {
    fields: [template.organizationId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [template.createdBy],
    references: [user.id],
    relationName: "createdTemplates",
  }),
  updatedBy: one(user, {
    fields: [template.updatedBy],
    references: [user.id],
    relationName: "updatedTemplates",
  }),
  datastreams: many(datastream),
  devices: many(device),
}));
