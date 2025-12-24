import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";
import { template } from "./template";
import { user } from "./user";
import { deviceState } from "./deviceState";
import { telemetry } from "./telemetry";

export const deviceStatus = ["ONLINE", "OFFLINE"] as const;
export const deviceStatusEnum = pgEnum("device_status", deviceStatus);

export const device = pgTable(
  "device",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => template.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    authToken: text("auth_token").notNull().unique(),
    tokenRevoked: boolean("token_revoked").default(false).notNull(),
    tokenRevokedAt: timestamp("token_revoked_at"),
    status: deviceStatusEnum("status").default("OFFLINE"),
    lastSeen: timestamp("last_seen"),
    ipAddress: text("ip_address"),
    firmwareVersion: text("firmware_version"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("device_auth_token_idx").on(table.authToken),
    index("device_organization_idx").on(table.organizationId),
    index("device_org_template_idx").on(table.organizationId, table.templateId),
  ],
);

export const deviceRelations = relations(device, ({ one, many }) => ({
  organization: one(organization, {
    fields: [device.organizationId],
    references: [organization.id],
  }),
  template: one(template, {
    fields: [device.templateId],
    references: [template.id],
  }),
  createdBy: one(user, {
    fields: [device.createdBy],
    references: [user.id],
    relationName: "createdDevices",
  }),
  deviceStates: many(deviceState),
  telemetries: many(telemetry),
}));
