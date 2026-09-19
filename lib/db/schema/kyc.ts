import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";
import { customers } from "./customers";
import { users } from "./users";

export const kycStatusEnum = mysqlEnum("kyc_status", [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "INFO_REQUIRED",
  "AWAITING_APPROVAL",
  "APPROVED",
  "REJECTED",
]);

export const kycCases = mysqlTable(
  "kyc_cases",
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

    status: kycStatusEnum.notNull().default("DRAFT"),

    submittedBy: bigint("submitted_by", {
      mode: "number",
    }).references(() => users.id),

    submittedAt: timestamp("submitted_at"),

    reviewedBy: bigint("reviewed_by", {
      mode: "number",
    }).references(() => users.id),

    reviewedAt: timestamp("reviewed_at"),

    approvedBy: bigint("approved_by", {
      mode: "number",
    }).references(() => users.id),

    approvedAt: timestamp("approved_at"),

    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("kyc_cases_org_idx").on(table.organizationId),

    index("kyc_cases_customer_idx").on(table.customerId),

    index("kyc_cases_status_idx").on(table.status),
  ],
);

export const kycDocumentTypeEnum = mysqlEnum("kyc_document_type", [
  "NIC",
  "PASSPORT",
  "PROOF_OF_ADDRESS",
  "BANK_STATEMENT",
  "INCOME_PROOF",
  "OTHER",
]);

export const kycDocumentStatusEnum = mysqlEnum("kyc_document_status", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

export const kycDocuments = mysqlTable("kyc_documents", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  organizationId: bigint("organization_id", {
    mode: "number",
  })
    .notNull()
    .references(() => organizations.id),

  kycCaseId: bigint("kyc_case_id", {
    mode: "number",
  })
    .notNull()
    .references(() => kycCases.id, {
      onDelete: "cascade",
    }),

  customerId: bigint("customer_id", {
    mode: "number",
  })
    .notNull()
    .references(() => customers.id),

  documentType: kycDocumentTypeEnum.notNull(),

  documentNumber: varchar("document_number", { length: 100 }),

  fileUrl: varchar("file_url", {
    length: 500,
  }),

  status: kycDocumentStatusEnum.notNull().default("PENDING"),

  uploadedBy: bigint("uploaded_by", {
    mode: "number",
  })
    .notNull()
    .references(() => users.id),

  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const kycReviewDecisionEnum = mysqlEnum("kyc_review_decision", [
  "APPROVED",
  "REJECTED",
  "INFO_REQUIRED",
]);

export const kycReviews = mysqlTable("kyc_reviews", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  organizationId: bigint("organization_id", {
    mode: "number",
  })
    .notNull()
    .references(() => organizations.id),

  kycCaseId: bigint("kyc_case_id", {
    mode: "number",
  })
    .notNull()
    .references(() => kycCases.id),

  reviewerId: bigint("reviewer_id", {
    mode: "number",
  })
    .notNull()
    .references(() => users.id),

  decision: kycReviewDecisionEnum.notNull(),

  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
