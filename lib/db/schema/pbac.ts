import {
  mysqlTable,
  bigint,
  varchar,
  boolean,
  int,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";

/* ============================================================
   ENUMS
============================================================ */

export const policyEffectEnum = mysqlEnum("policy_effect", [
  "ALLOW",
  "DENY",
]);

export const policyOperatorEnum = mysqlEnum("policy_operator", [
  "EQUALS",
  "NOT_EQUALS",
  "IN",
  "NOT_IN",
  "CONTAINS",
  "NOT_CONTAINS",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "EXISTS",
  "NOT_EXISTS",
]);

export const conditionSourceEnum = mysqlEnum("condition_source", [
  "SUBJECT",
  "RESOURCE",
  "CONTEXT",
]);

/* ============================================================
   POLICIES
============================================================ */

export const policies = mysqlTable(
  "policies",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    }).references(() => organizations.id, {
      onDelete: "cascade",
    }),

    name: varchar("name", {
      length: 150,
    }).notNull(),

    code: varchar("code", {
      length: 150,
    }).notNull(),

    description: varchar("description", {
      length: 255,
    }),

    action: varchar("action", {
      length: 150,
    }).notNull(),

    resourceType: varchar("resource_type", {
      length: 100,
    }).notNull(),

    effect: policyEffectEnum
      .notNull()
      .default("ALLOW"),

    priority: int("priority")
      .notNull()
      .default(0),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    uniqueIndex("policies_org_code_unique").on(
      table.organizationId,
      table.code
    ),

    index("policies_action_resource_idx").on(
      table.action,
      table.resourceType
    ),

    index("policies_org_idx").on(
      table.organizationId
    ),

    index("policies_active_idx").on(
      table.isActive
    ),
  ]
);

/* ============================================================
   POLICY SUBJECT RULES

   Who does this policy apply to?

   Examples:
   department EQUALS COMPLIANCE
   role CONTAINS COMPLIANCE_MANAGER
   status EQUALS ACTIVE
============================================================ */

export const policySubjects = mysqlTable(
  "policy_subjects",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    policyId: bigint("policy_id", {
      mode: "number",
    })
      .notNull()
      .references(() => policies.id, {
        onDelete: "cascade",
      }),

    attribute: varchar("attribute", {
      length: 150,
    }).notNull(),

    operator: policyOperatorEnum.notNull(),

    value: varchar("value", {
      length: 255,
    }),

    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("policy_subjects_policy_idx").on(
      table.policyId
    ),
  ]
);

/* ============================================================
   POLICY RESOURCE RULES

   Which resources does this policy apply to?

   Examples:
   status EQUALS AWAITING_APPROVAL
   riskLevel EQUALS HIGH
   organizationId EQUALS $subject.organizationId
============================================================ */

export const policyResources = mysqlTable(
  "policy_resources",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    policyId: bigint("policy_id", {
      mode: "number",
    })
      .notNull()
      .references(() => policies.id, {
        onDelete: "cascade",
      }),

    attribute: varchar("attribute", {
      length: 150,
    }).notNull(),

    operator: policyOperatorEnum.notNull(),

    value: varchar("value", {
      length: 255,
    }),

    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("policy_resources_policy_idx").on(
      table.policyId
    ),
  ]
);

/* ============================================================
   POLICY CONDITIONS

   Additional comparison / request context rules.

   Examples:
   SUBJECT organizationId EQUALS $resource.organizationId
   SUBJECT id NOT_EQUALS $resource.submittedBy
   CONTEXT ipAddress IN 192.168.1.0/24
============================================================ */

export const policyConditions = mysqlTable(
  "policy_conditions",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    policyId: bigint("policy_id", {
      mode: "number",
    })
      .notNull()
      .references(() => policies.id, {
        onDelete: "cascade",
      }),

    source: conditionSourceEnum.notNull(),

    attribute: varchar("attribute", {
      length: 150,
    }).notNull(),

    operator: policyOperatorEnum.notNull(),

    value: varchar("value", {
      length: 255,
    }),

    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("policy_conditions_policy_idx").on(
      table.policyId
    ),
  ]
);