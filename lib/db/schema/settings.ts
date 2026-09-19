import {
  mysqlTable,
  bigint,
  int,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";

export const organizationSettings = mysqlTable(
  "organization_settings",
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

    mediumRiskThreshold: int("medium_risk_threshold").notNull().default(30),

    highRiskThreshold: int("high_risk_threshold").notNull().default(60),

    requireManagerForHighRisk: boolean("require_manager_for_high_risk")
      .notNull()
      .default(true),

    kycExpiryDays: int("kyc_expiry_days").notNull().default(365),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("organization_settings_org_unique").on(table.organizationId),
  ],
);
