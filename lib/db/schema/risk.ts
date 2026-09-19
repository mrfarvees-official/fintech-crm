import {
  mysqlTable,
  bigint,
  int,
  varchar,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";
import { customers } from "./customers";
import { kycCases } from "./kyc";
import { users } from "./users";

export const riskLevelEnum = mysqlEnum("risk_level", ["LOW", "MEDIUM", "HIGH"]);

export const riskAssessments = mysqlTable(
  "risk_assessments",
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
      .references(() => customers.id),

    kycCaseId: bigint("kyc_case_id", {
      mode: "number",
    })
      .notNull()
      .references(() => kycCases.id),

    score: int("score").notNull(),

    level: riskLevelEnum.notNull(),

    calculatedBy: bigint("calculated_by", {
      mode: "number",
    }).references(() => users.id),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("risk_customer_idx").on(table.customerId),

    index("risk_kyc_idx").on(table.kycCaseId),
  ],
);

export const riskFactors = mysqlTable("risk_factors", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  riskAssessmentId: bigint("risk_assessment_id", { mode: "number" })
    .notNull()
    .references(() => riskAssessments.id, {
      onDelete: "cascade",
    }),

  code: varchar("code", {
    length: 100,
  }).notNull(),

  description: varchar("description", {
    length: 255,
  }).notNull(),

  score: int("score").notNull(),
});
