import { and, eq } from "drizzle-orm";

import {
  approvalRequests,
  approvalSteps,
  customerAssignments,
  customerNotes,
  customers,
  kycCases,
  riskAssessments,
  riskFactors,
  users,
} from "@/lib/db/schema";

import { CRM_CUSTOMERS, CRM_RISK_FACTORS } from "../data/crm";

import type { SeedTransaction } from "../types";

type User = typeof users.$inferSelect;

export async function seedCrm(
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
  const manager = users.complianceManager;

  if (!rm || !analyst || !manager) {
    throw new Error("CRM seed users are incomplete.");
  }

  for (const seed of CRM_CUSTOMERS) {
    const [existingCustomer] = await tx
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.organizationId, organizationId),
          eq(customers.customerNumber, seed.customerNumber),
        ),
      )
      .limit(1);

    let customer = existingCustomer;

    if (!customer) {
      const [id] = await tx
        .insert(customers)
        .values({
          organizationId,

          customerNumber: seed.customerNumber,

          firstName: seed.firstName,
          lastName: seed.lastName,

          email: seed.email,
          phone: seed.phone,

          nicPassport: seed.nicPassport,
          dateOfBirth: seed.dateOfBirth ? new Date(seed.dateOfBirth) : null,

          employmentStatus: seed.employmentStatus,

          employer: seed.employer,
          monthlyIncome: seed.monthlyIncome,

          assignedUserId: rm.id,

          status: seed.status,

          createdBy: rm.id,
        })
        .$returningId();

      [customer] = await tx
        .select()
        .from(customers)
        .where(eq(customers.id, id.id))
        .limit(1);
    }

    if (!customer) {
      throw new Error(`Failed to seed ${seed.customerNumber}`);
    }

    const [assignment] = await tx
      .select()
      .from(customerAssignments)
      .where(
        and(
          eq(customerAssignments.organizationId, organizationId),
          eq(customerAssignments.customerId, customer.id),
          eq(customerAssignments.assignedTo, rm.id),
        ),
      )
      .limit(1);

    if (!assignment) {
      await tx.insert(customerAssignments).values({
        organizationId,
        customerId: customer.id,

        assignedFrom: null,
        assignedTo: rm.id,

        assignedBy: manager.id,

        reason: "Initial customer assignment",
      });
    }

    const [note] = await tx
      .select()
      .from(customerNotes)
      .where(
        and(
          eq(customerNotes.organizationId, organizationId),
          eq(customerNotes.customerId, customer.id),
          eq(customerNotes.authorId, rm.id),
        ),
      )
      .limit(1);

    if (!note) {
      await tx.insert(customerNotes).values({
        organizationId,
        customerId: customer.id,
        authorId: rm.id,
        note: "Initial fintech CRM demo customer.",
      });
    }

    const [existingKyc] = await tx
      .select()
      .from(kycCases)
      .where(
        and(
          eq(kycCases.organizationId, organizationId),
          eq(kycCases.customerId, customer.id),
        ),
      )
      .limit(1);

    let kyc = existingKyc;

    if (!kyc) {
      const now = new Date();

      const approved = seed.kyc.status === "APPROVED";

      const reviewed =
        approved ||
        seed.kyc.status === "AWAITING_APPROVAL" ||
        seed.kyc.status === "UNDER_REVIEW";

      const [id] = await tx
        .insert(kycCases)
        .values({
          organizationId,
          customerId: customer.id,

          status: seed.kyc.status,

          submittedBy: rm.id,
          submittedAt: now,

          reviewedBy: reviewed ? analyst.id : null,

          reviewedAt: reviewed ? now : null,

          approvedBy: approved ? manager.id : null,

          approvedAt: approved ? now : null,
        })
        .$returningId();

      [kyc] = await tx
        .select()
        .from(kycCases)
        .where(eq(kycCases.id, id.id))
        .limit(1);
    }

    if (!kyc) {
      throw new Error(`Failed to seed KYC for ${seed.customerNumber}`);
    }

    const [existingRisk] = await tx
      .select()
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.organizationId, organizationId),
          eq(riskAssessments.kycCaseId, kyc.id),
        ),
      )
      .limit(1);

    let risk = existingRisk;

    if (!risk) {
      const [id] = await tx
        .insert(riskAssessments)
        .values({
          organizationId,

          customerId: customer.id,
          kycCaseId: kyc.id,

          score: seed.kyc.riskScore,
          level: seed.kyc.riskLevel,

          calculatedBy: analyst.id,
        })
        .$returningId();

      [risk] = await tx
        .select()
        .from(riskAssessments)
        .where(eq(riskAssessments.id, id.id))
        .limit(1);
    }

    if (!risk) {
      throw new Error(`Failed to seed risk for ${seed.customerNumber}`);
    }

    const factors = CRM_RISK_FACTORS[seed.key];

    for (const factor of factors) {
      const [existingFactor] = await tx
        .select()
        .from(riskFactors)
        .where(
          and(
            eq(riskFactors.riskAssessmentId, risk.id),
            eq(riskFactors.code, factor.code),
          ),
        )
        .limit(1);

      if (!existingFactor) {
        await tx.insert(riskFactors).values({
          riskAssessmentId: risk.id,
          ...factor,
        });
      }
    }

    if (seed.kyc.status !== "AWAITING_APPROVAL") {
      continue;
    }

    const [existingApproval] = await tx
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.organizationId, organizationId),
          eq(approvalRequests.resourceType, "KYC_CASE"),
          eq(approvalRequests.resourceId, kyc.id),
        ),
      )
      .limit(1);

    let approval = existingApproval;

    if (!approval) {
      const [id] = await tx
        .insert(approvalRequests)
        .values({
          organizationId,

          resourceType: "KYC_CASE",
          resourceId: kyc.id,

          requestedBy: analyst.id,

          status: "PENDING",
        })
        .$returningId();

      [approval] = await tx
        .select()
        .from(approvalRequests)
        .where(eq(approvalRequests.id, id.id))
        .limit(1);
    }

    if (!approval) {
      throw new Error("Failed to seed approval request.");
    }

    const [existingStep] = await tx
      .select()
      .from(approvalSteps)
      .where(
        and(
          eq(approvalSteps.approvalRequestId, approval.id),
          eq(approvalSteps.stepOrder, 1),
        ),
      )
      .limit(1);

    if (!existingStep) {
      await tx.insert(approvalSteps).values({
        approvalRequestId: approval.id,

        stepOrder: 1,

        action: "kyc.approve",

        assignedUserId: null,

        status: "PENDING",
      });
    }
  }
}
