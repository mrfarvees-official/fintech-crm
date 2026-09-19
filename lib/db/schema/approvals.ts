import {
  mysqlTable,
  bigint,
  varchar,
  text,
  int,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";
import { users } from "./users";

export const approvalStatusEnum = mysqlEnum("approval_status", [
  "PENDING",
  "IN_PROGRESS",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const approvalStepStatusEnum = mysqlEnum("approval_step_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SKIPPED",
]);

export const approvalRequests = mysqlTable(
  "approval_requests",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    resourceType: varchar("resource_type", {
      length: 100,
    }).notNull(),

    resourceId: bigint("resource_id", {
      mode: "number",
    }).notNull(),

    requestedBy: bigint("requested_by", {
      mode: "number",
    })
      .notNull()
      .references(() => users.id),

    status: approvalStatusEnum.notNull().default("PENDING"),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("approval_resource_idx").on(table.resourceType, table.resourceId),

    index("approval_org_idx").on(table.organizationId),
  ],
);

export const approvalSteps = mysqlTable(
  "approval_steps",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    approvalRequestId: bigint("approval_request_id", {
      mode: "number",
    })
      .notNull()
      .references(() => approvalRequests.id, {
        onDelete: "cascade",
      }),

    stepOrder: int("step_order").notNull(),

    /*
     * PBAC action that must be authorized
     *
     * Examples:
     * kyc.review
     * kyc.approve
     * kyc.approve_high_risk
     */
    action: varchar("action", {
      length: 150,
    }).notNull(),

    /*
     * Optional direct assignment.
     *
     * When null:
     * any subject matching PBAC may act.
     *
     * When set:
     * PBAC must allow AND the step must be
     * assigned to this user.
     */
    assignedUserId: bigint("assigned_user_id", {
      mode: "number",
    }).references(() => users.id),

    status: approvalStepStatusEnum.notNull().default("PENDING"),

    actedBy: bigint("acted_by", {
      mode: "number",
    }).references(() => users.id),

    actedAt: timestamp("acted_at"),

    comment: text("comment"),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("approval_steps_request_idx").on(table.approvalRequestId),

    uniqueIndex("approval_steps_request_order_unique").on(
      table.approvalRequestId,
      table.stepOrder,
    ),

    index("approval_steps_status_idx").on(table.status),

    index("approval_steps_assigned_user_idx").on(table.assignedUserId),

    index("approval_steps_action_idx").on(table.action),
  ],
);
