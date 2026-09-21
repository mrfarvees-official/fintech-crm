import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  approvalSteps,
  approvalRequests,
  kycCases,
  customers,
  users,
} from "@/lib/db/schema";
import { checkPermission } from "@/features/authorization/can";
import { latestRiskLevel } from "@/features/kyc/queries";
import type { CurrentUser } from "@/lib/auth/dal";

export async function getPendingApprovalsForUser(user: CurrentUser) {
  const rows = await db
    .select({
      stepId: approvalSteps.id,
      stepAction: approvalSteps.action,
      assignedUserId: approvalSteps.assignedUserId,
      resourceType: approvalRequests.resourceType,
      resourceId: approvalRequests.resourceId,
      requestedByName: users.name,
      kycStatus: kycCases.status,
      kycSubmittedBy: kycCases.submittedBy,
      kycOrganizationId: kycCases.organizationId,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
    })
    .from(approvalSteps)
    .innerJoin(
      approvalRequests,
      eq(approvalRequests.id, approvalSteps.approvalRequestId),
    )
    .leftJoin(kycCases, eq(kycCases.id, approvalRequests.resourceId))
    .leftJoin(customers, eq(customers.id, kycCases.customerId))
    .leftJoin(users, eq(users.id, approvalRequests.requestedBy))
    .where(
      and(
        eq(approvalRequests.organizationId, user.organizationId),
        eq(approvalSteps.status, "PENDING"),
      ),
    );

  const eligible = [];
  for (const r of rows) {
    if (r.assignedUserId && r.assignedUserId !== user.id) continue;
    if (r.resourceType !== "KYC_CASE" || r.resourceId == null) continue;

    const riskLevel = await latestRiskLevel(r.resourceId);
    const allowed = await checkPermission(r.stepAction, "KYC_CASE", {
      status: r.kycStatus,
      riskLevel,
      submittedBy: r.kycSubmittedBy,
      organizationId: r.kycOrganizationId,
    });
    if (allowed) eligible.push(r);
  }
  return eligible;
}
