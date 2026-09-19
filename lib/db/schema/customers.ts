import {
  mysqlTable,
  bigint,
  varchar,
  decimal,
  date,
  timestamp,
  mysqlEnum,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";
import { users } from "./users";

export const customerStatusEnum = mysqlEnum("customer_status", [
  "LEAD",
  "ACTIVE",
  "KYC_PENDING",
  "KYC_REVIEW",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
]);

export const employmentStatusEnum = mysqlEnum("employment_status", [
  "EMPLOYED",
  "SELF_EMPLOYED",
  "UNEMPLOYED",
  "STUDENT",
  "RETIRED",
  "OTHER",
]);

export const customers = mysqlTable(
  "customers",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    customerNumber: varchar("customer_number", {
      length: 50,
    }).notNull(),

    firstName: varchar("first_name", {
      length: 100,
    }).notNull(),

    lastName: varchar("last_name", {
      length: 100,
    }).notNull(),

    email: varchar("email", {
      length: 191,
    }),

    phone: varchar("phone", {
      length: 30,
    }),

    nicPassport: varchar("nic_passport", {
      length: 100,
    }),

    dateOfBirth: date("date_of_birth"),

    employmentStatus: employmentStatusEnum,

    employer: varchar("employer", {
      length: 150,
    }),

    monthlyIncome: decimal("monthly_income", {
      precision: 15,
      scale: 2,
    }),

    assignedUserId: bigint("assigned_user_id", {
      mode: "number",
    }).references(() => users.id),

    status: customerStatusEnum.notNull().default("LEAD"),

    createdBy: bigint("created_by", {
      mode: "number",
    })
      .notNull()
      .references(() => users.id),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("customers_org_number_unique").on(
      table.organizationId,
      table.customerNumber,
    ),

    index("customers_org_idx").on(table.organizationId),

    index("customers_status_idx").on(table.status),

    index("customers_assigned_user_idx").on(table.assignedUserId),
  ],
);

export const customerNotes = mysqlTable(
  "customer_notes",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    customerId: bigint("customer_id", {
      mode: "number",
    })
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),

    authorId: bigint("author_id", {
      mode: "number",
    })
      .notNull()
      .references(() => users.id),

    note: text("note").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("customer_notes_customer_idx").on(table.customerId)],
);

export const customerAssignments = mysqlTable(
  "customer_assignments",
  {
    id: bigint("id", {
      mode: "number",
    })
      .primaryKey()
      .autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    customerId: bigint("customer_id", {
      mode: "number",
    })
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),

    assignedFrom: bigint("assigned_from", {
      mode: "number",
    }).references(() => users.id),

    assignedTo: bigint("assigned_to", {
      mode: "number",
    })
      .notNull()
      .references(() => users.id),

    assignedBy: bigint("assigned_by", {
      mode: "number",
    })
      .notNull()
      .references(() => users.id),

    reason: varchar("reason", {
      length: 255,
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("customer_assignments_customer_idx").on(table.customerId)],
);
