import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  json,
  index,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";
import { users } from "./users";

export type AuditValues = Record<string, unknown>;

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    actorId: bigint("actor_id", {
      mode: "number",
    }).references(() => users.id),

    action: varchar("action", {
      length: 150,
    }).notNull(),

    resourceType: varchar("resource_type", {
      length: 100,
    }).notNull(),

    resourceId: bigint("resource_id", {
      mode: "number",
    }),

    oldValues: json("old_values").$type<AuditValues>(),

    newValues: json("new_values").$type<AuditValues>(),

    ipAddress: varchar("ip_address", {
      length: 45,
    }),

    userAgent: varchar("user_agent", {
      length: 500,
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_org_idx").on(table.organizationId),

    index("audit_actor_idx").on(table.actorId),

    index("audit_resource_idx").on(table.resourceType, table.resourceId),

    index("audit_action_idx").on(table.action),
  ],
);
