"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  kycCases,
  kycReviews,
  approvalRequests,
  approvalSteps,
  customers,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { checkPermissionWithReason } from "@/features/authorization/can";
import { recordAudit } from "@/lib/audit/log";
import { createNotification } from "@/lib/notifications/create";
import {
  CreateKycCaseSchema,
  RequestInfoSchema,
  type FormState,
} from "./schema";

async function loadCase(kycCaseId: number, organizationId: number) {
  const [row] = await db
    .select()
    .from(kycCases)
    .where(eq(kycCases.id, kycCaseId))
    .limit(1);
  if (!row || row.organizationId !== organizationId) return null;
  return row;
}

export async function createKycCaseAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const access = await checkPermissionWithReason("kyc.create", "KYC_CASE");
  if (!access.allowed) return { denied: true, message: access.reason };
  const user = await getCurrentUser();

  const parsed = CreateKycCaseSchema.safeParse({
    customerId: formData.get("customerId"),
  });
  if (!parsed.success)
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Fix the errors below.",
    };

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, parsed.data.customerId))
    .limit(1);
  if (!customer || customer.organizationId !== user.organizationId)
    return { message: "Customer not found." };

  const [row] = await db
    .insert(kycCases)
    .values({
      organizationId: user.organizationId,
      customerId: customer.id,
      status: "DRAFT",
    })
    .$returningId();

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "kyc.create",
    resourceType: "KYC_CASE",
    resourceId: row.id,
    newValues: { customerId: customer.id, status: "DRAFT" },
  });

  revalidatePath("/kyc");
  redirect(`/kyc/${row.id}`);
}

export async function submitKycCaseAction(kycCaseId: number) {
  const user = await getCurrentUser();
  const existing = await loadCase(kycCaseId, user.organizationId);
  if (!existing) return { denied: true, message: "KYC case not found." };
  if (!["DRAFT", "INFO_REQUIRED"].includes(existing.status)) {
    return {
      denied: true,
      message: `Can't submit a case in "${existing.status}" status.`,
    };
  }

  const access = await checkPermissionWithReason("kyc.submit", "KYC_CASE", {
    organizationId: existing.organizationId,
  });
  if (!access.allowed) return { denied: true, message: access.reason };

  await db
    .update(kycCases)
    .set({ status: "SUBMITTED", submittedBy: user.id, submittedAt: new Date() })
    .where(eq(kycCases.id, kycCaseId));

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "kyc.submit",
    resourceType: "KYC_CASE",
    resourceId: kycCaseId,
    oldValues: { status: existing.status },
    newValues: { status: "SUBMITTED" },
  });

  revalidatePath(`/kyc/${kycCaseId}`);
  revalidatePath("/kyc");
  return { message: "Submitted for review." };
}

export async function startReviewAction(kycCaseId: number) {
  const user = await getCurrentUser();
  const existing = await loadCase(kycCaseId, user.organizationId);
  if (!existing) return { denied: true, message: "KYC case not found." };
  if (existing.status !== "SUBMITTED") {
    return {
      denied: true,
      message: `Can't start review on a case in "${existing.status}" status.`,
    };
  }

  const access = await checkPermissionWithReason("kyc.review", "KYC_CASE", {
    organizationId: existing.organizationId,
  });
  if (!access.allowed) return { denied: true, message: access.reason };

  await db
    .update(kycCases)
    .set({
      status: "UNDER_REVIEW",
      reviewedBy: user.id,
      reviewedAt: new Date(),
    })
    .where(eq(kycCases.id, kycCaseId));

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "kyc.review",
    resourceType: "KYC_CASE",
    resourceId: kycCaseId,
    oldValues: { status: existing.status },
    newValues: { status: "UNDER_REVIEW" },
  });

  revalidatePath(`/kyc/${kycCaseId}`);
  revalidatePath("/kyc");
  return { message: "Review started." };
}

export async function requestInfoAction(
  kycCaseId: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  const existing = await loadCase(kycCaseId, user.organizationId);
  if (!existing) return { denied: true, message: "KYC case not found." };
  if (existing.status !== "UNDER_REVIEW") {
    return {
      denied: true,
      message: `Can't request info on a case in "${existing.status}" status.`,
    };
  }

  const access = await checkPermissionWithReason(
    "kyc.request_info",
    "KYC_CASE",
    { organizationId: existing.organizationId },
  );
  if (!access.allowed) return { denied: true, message: access.reason };

  const parsed = RequestInfoSchema.safeParse({
    reason: formData.get("reason"),
  });
  if (!parsed.success)
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Fix the errors below.",
    };

  await db
    .update(kycCases)
    .set({ status: "INFO_REQUIRED" })
    .where(eq(kycCases.id, kycCaseId));
  await db.insert(kycReviews).values({
    organizationId: user.organizationId,
    kycCaseId,
    reviewerId: user.id,
    decision: "INFO_REQUIRED",
    notes: parsed.data.reason,
  });

  if (existing.submittedBy) {
    await createNotification({
      organizationId: user.organizationId,
      userId: existing.submittedBy,
      type: "kyc.info_required",
      title: "More information needed",
      message: parsed.data.reason,
    });
  }

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "kyc.request_info",
    resourceType: "KYC_CASE",
    resourceId: kycCaseId,
    oldValues: { status: existing.status },
    newValues: { status: "INFO_REQUIRED", reason: parsed.data.reason },
  });

  revalidatePath(`/kyc/${kycCaseId}`);
  revalidatePath("/kyc");
  return { message: "Info requested." };
}

export async function sendForApprovalAction(kycCaseId: number) {
  const user = await getCurrentUser();
  const existing = await loadCase(kycCaseId, user.organizationId);
  if (!existing) return { denied: true, message: "KYC case not found." };
  if (existing.status !== "UNDER_REVIEW") {
    return {
      denied: true,
      message: `Can't send for approval from "${existing.status}" status.`,
    };
  }

  const access = await checkPermissionWithReason("kyc.review", "KYC_CASE", {
    organizationId: existing.organizationId,
  });
  if (!access.allowed) return { denied: true, message: access.reason };

  await db
    .update(kycCases)
    .set({ status: "AWAITING_APPROVAL" })
    .where(eq(kycCases.id, kycCaseId));

  const [reqRow] = await db
    .insert(approvalRequests)
    .values({
      organizationId: user.organizationId,
      resourceType: "KYC_CASE",
      resourceId: kycCaseId,
      requestedBy: user.id,
    })
    .$returningId();

  await db
    .insert(approvalSteps)
    .values({
      approvalRequestId: reqRow.id,
      stepOrder: 1,
      action: "kyc.approve",
      status: "PENDING",
    });

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "kyc.send_for_approval",
    resourceType: "KYC_CASE",
    resourceId: kycCaseId,
    oldValues: { status: existing.status },
    newValues: { status: "AWAITING_APPROVAL" },
  });

  revalidatePath(`/kyc/${kycCaseId}`);
  revalidatePath("/kyc");
  revalidatePath("/approvals");
  return { message: "Sent for approval." };
}

export async function deleteKycCaseAction(kycCaseId: number) {
  const user = await getCurrentUser();
  const existing = await loadCase(kycCaseId, user.organizationId);
  if (!existing) return { denied: true, message: "KYC case not found." };

  const access = await checkPermissionWithReason("kyc.delete", "KYC_CASE", {
    organizationId: existing.organizationId,
  });
  if (!access.allowed) return { denied: true, message: access.reason };

  try {
    await db.delete(kycCases).where(eq(kycCases.id, kycCaseId));
  } catch (err) {
    const code =
      (err as { cause?: { code?: string }; code?: string })?.cause?.code ??
      (err as { code?: string })?.code;
    if (code === "ER_ROW_IS_REFERENCED_2" || code === "ER_ROW_IS_REFERENCED") {
      return {
        denied: true,
        message:
          "Can't delete — this case has linked risk assessments or review history.",
      };
    }
    throw err;
  }

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "kyc.delete",
    resourceType: "KYC_CASE",
    resourceId: kycCaseId,
    oldValues: { status: existing.status, customerId: existing.customerId },
  });

  revalidatePath("/kyc");
  return { message: "KYC case deleted." };
}
