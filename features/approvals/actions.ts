"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { approvalSteps, approvalRequests, kycCases } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { checkPermissionWithReason } from "@/features/authorization/can";
import { recordAudit } from "@/lib/audit/log";
import { createNotification } from "@/lib/notifications/create";
import { latestRiskLevel } from "@/features/kyc/queries";

export async function actOnApprovalStepAction(
  stepId: number,
  decision: "APPROVED" | "REJECTED",
  comment: string | null,
) {
  const user = await getCurrentUser();

  const [step] = await db
    .select()
    .from(approvalSteps)
    .where(eq(approvalSteps.id, stepId))
    .limit(1);
  if (!step || step.status !== "PENDING")
    return {
      denied: true,
      message: "Approval step not found or already actioned.",
    };

  const [request] = await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, step.approvalRequestId))
    .limit(1);
  if (!request || request.organizationId !== user.organizationId)
    return { denied: true, message: "Approval request not found." };
  if (step.assignedUserId && step.assignedUserId !== user.id)
    return { denied: true, message: "This step is assigned to someone else." };
  if (request.resourceType !== "KYC_CASE")
    return {
      denied: true,
      message: `Unsupported resource type "${request.resourceType}".`,
    };

  const [kycCase] = await db
    .select()
    .from(kycCases)
    .where(eq(kycCases.id, request.resourceId))
    .limit(1);
  if (!kycCase) return { denied: true, message: "KYC case not found." };

  const riskLevel = await latestRiskLevel(kycCase.id);
  const access = await checkPermissionWithReason(step.action, "KYC_CASE", {
    status: kycCase.status,
    riskLevel,
    submittedBy: kycCase.submittedBy,
    organizationId: kycCase.organizationId,
  });
  if (!access.allowed) return { denied: true, message: access.reason };

  const now = new Date();
  await db
    .update(approvalSteps)
    .set({ status: decision, actedBy: user.id, actedAt: now, comment })
    .where(eq(approvalSteps.id, stepId));
  await db
    .update(approvalRequests)
    .set({ status: decision, completedAt: now })
    .where(eq(approvalRequests.id, request.id));
  await db
    .update(kycCases)
    .set(
      decision === "APPROVED"
        ? { status: "APPROVED", approvedBy: user.id, approvedAt: now }
        : { status: "REJECTED", rejectionReason: comment },
    )
    .where(eq(kycCases.id, kycCase.id));

  if (kycCase.submittedBy) {
    await createNotification({
      organizationId: user.organizationId,
      userId: kycCase.submittedBy,
      type: decision === "APPROVED" ? "kyc.approved" : "kyc.rejected",
      title:
        decision === "APPROVED" ? "KYC case approved" : "KYC case rejected",
      message:
        comment ??
        (decision === "APPROVED"
          ? "Your submitted KYC case was approved."
          : "Your submitted KYC case was rejected."),
    });
  }

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: decision === "APPROVED" ? "kyc.approve" : "kyc.reject",
    resourceType: "KYC_CASE",
    resourceId: kycCase.id,
    oldValues: { status: kycCase.status },
    newValues: { status: decision, comment },
  });

  revalidatePath("/approvals");
  revalidatePath(`/kyc/${kycCase.id}`);
  revalidatePath("/kyc");
  return { message: decision === "APPROVED" ? "Approved." : "Rejected." };
}
