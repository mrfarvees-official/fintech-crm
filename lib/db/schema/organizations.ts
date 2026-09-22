import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  mysqlEnum,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const organizationStatusEnum = mysqlEnum("organization_status", [
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
]);

export const organizations = mysqlTable(
  "organizations",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    ownerId: bigint("owner_id", { mode: "number" }),

    // Bare bigint (no .references()) — same pattern as ownerId, to avoid a
    // circular import with users.ts (users.ts already imports organizations.ts).
    // Nullable + single column, so "at most one tenant admin per org" is a
    // structural guarantee, not an app-level check that can be forgotten.
    tenantAdminUserId: bigint("tenant_admin_user_id", { mode: "number" }),

    name: varchar("name", { length: 150 }).notNull(),

    code: varchar("code", { length: 50 }).notNull(),

    status: organizationStatusEnum.notNull().default("ACTIVE"),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [uniqueIndex("organizations_code_unique").on(table.code)],
);
