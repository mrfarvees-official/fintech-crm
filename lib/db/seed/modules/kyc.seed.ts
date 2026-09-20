import { and, eq } from "drizzle-orm";

import {
  customers,
  kycCases,
  kycDocuments,
  kycReviews,
  users,
} from "@/lib/db/schema";

import { KYC_DOCUMENT_SEEDS, KYC_REVIEW_SEEDS } from "../data/kyc";

import type { SeedTransaction } from "../types";

type User = typeof users.$inferSelect;

export async function seedKyc(
  tx: SeedTransaction,
  {
    organizationId,
    users,
  }: {
    organizationId: number;
    users: Record<string, User>;
  },
) {
  const rm = users.relationshipManager;
  const analyst = users.kycAnalyst;

  if (!rm || !analyst) {
    throw new Error("KYC seed users are incomplete.");
  }

  for (const seed of KYC_DOCUMENT_SEEDS) {
    const customerNumber =
      seed.customerKey === "lowRisk"
        ? "CUS-0001"
        : seed.customerKey === "mediumRisk"
          ? "CUS-0002"
          : "CUS-0003";

    const [customer] = await tx
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.organizationId, organizationId),
          eq(customers.customerNumber, customerNumber),
        ),
      )
      .limit(1);

    if (!customer) {
      throw new Error(
        `Customer not found for KYC document seed: ${customerNumber}`,
      );
    }

    const [kycCase] = await tx
      .select()
      .from(kycCases)
      .where(
        and(
          eq(kycCases.organizationId, organizationId),
          eq(kycCases.customerId, customer.id),
        ),
      )
      .limit(1);

    if (!kycCase) {
      throw new Error(`KYC case not found for customer: ${customerNumber}`);
    }

    const [existing] = await tx
      .select()
      .from(kycDocuments)
      .where(
        and(
          eq(kycDocuments.kycCaseId, kycCase.id),
          eq(kycDocuments.documentType, seed.documentType),
        ),
      )
      .limit(1);

    if (!existing) {
      await tx.insert(kycDocuments).values({
        organizationId,

        kycCaseId: kycCase.id,
        customerId: customer.id,

        documentType: seed.documentType,
        documentNumber: seed.documentNumber,
        fileUrl: seed.fileUrl,

        status: seed.status,

        uploadedBy: rm.id,
      });

      console.log(`  + KYC document: ${customerNumber} ${seed.documentType}`);
    }
  }

  for (const seed of KYC_REVIEW_SEEDS) {
    const customerNumber =
      seed.customerKey === "lowRisk"
        ? "CUS-0001"
        : seed.customerKey === "mediumRisk"
          ? "CUS-0002"
          : "CUS-0003";

    const [customer] = await tx
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.organizationId, organizationId),
          eq(customers.customerNumber, customerNumber),
        ),
      )
      .limit(1);

    if (!customer) {
      throw new Error(
        `Customer not found for KYC review seed: ${customerNumber}`,
      );
    }

    const [kycCase] = await tx
      .select()
      .from(kycCases)
      .where(
        and(
          eq(kycCases.organizationId, organizationId),
          eq(kycCases.customerId, customer.id),
        ),
      )
      .limit(1);

    if (!kycCase) {
      throw new Error(`KYC case not found for customer: ${customerNumber}`);
    }

    const [existing] = await tx
      .select()
      .from(kycReviews)
      .where(
        and(
          eq(kycReviews.kycCaseId, kycCase.id),
          eq(kycReviews.reviewerId, analyst.id),
          eq(kycReviews.decision, seed.decision),
        ),
      )
      .limit(1);

    if (!existing) {
      await tx.insert(kycReviews).values({
        organizationId,

        kycCaseId: kycCase.id,
        reviewerId: analyst.id,

        decision: seed.decision,
        notes: seed.notes,
      });

      console.log(`  + KYC review: ${customerNumber} ${seed.decision}`);
    }
  }
}
