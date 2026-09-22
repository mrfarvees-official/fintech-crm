import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";

export const userStatusEnum = mysqlEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
]);

export const userDepartmentEnum = mysqlEnum("user_department", [
  "RELATIONSHIP",
  "KYC",
  "COMPLIANCE",
  "MANAGEMENT",
  "ADMIN",
  // Distinct from ADMIN on purpose. ADMIN is a normal department that still
  // goes through PBAC like everyone else (see the open "should ADMIN be a
  // superuser" decision — this is NOT that). TENANT_ADMIN never needs a
  // single PBAC policy: it bypasses evaluation entirely, and only for
  // whichever one user organizations.tenantAdminUserId points at.
  "TENANT_ADMIN",
]);

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    name: varchar("name", { length: 150 }).notNull(),

    email: varchar("email", { length: 191 }).notNull(),

    passwordHash: varchar("password_hash", {
      length: 255,
    }).notNull(),

    department: userDepartmentEnum.notNull(),

    status: userStatusEnum.notNull().default("ACTIVE"),

    lastLoginAt: timestamp("last_login_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("users_org_email_unique").on(table.organizationId, table.email),

    index("users_organization_idx").on(table.organizationId),

    index("users_department_idx").on(table.department),
  ],
);
