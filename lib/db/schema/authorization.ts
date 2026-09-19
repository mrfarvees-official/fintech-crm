import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
  boolean,
  mysqlEnum,
  int,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";
import { users } from "./users";

export const roles = mysqlTable(
  "roles",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    name: varchar("name", { length: 100 }).notNull(),

    code: varchar("code", { length: 100 }).notNull(),

    description: varchar("description", {
      length: 255,
    }),

    isSystem: boolean("is_system").notNull().default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("roles_org_code_unique").on(table.organizationId, table.code),
  ],
);

export const permissions = mysqlTable("permissions", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  code: varchar("code", { length: 150 }).notNull().unique(),

  module: varchar("module", {
    length: 100,
  }).notNull(),

  description: varchar("description", {
    length: 255,
  }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
      }),

    permissionId: bigint("permission_id", {
      mode: "number",
    })
      .notNull()
      .references(() => permissions.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.permissionId],
    }),
  ],
);

export const userRoles = mysqlTable(
  "user_roles",
  {
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId],
    }),
  ],
);