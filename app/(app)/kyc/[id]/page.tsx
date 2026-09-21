import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { kycCases, customers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  requirePermissionPage,
  checkPermission,
} from "@/features/authorization/can";
import { latestRiskLevel } from "@/features/kyc/queries";
import { KycStatusActions } from "@/features/kyc/components/kyc-status-actions";
import { DeleteButton } from "@/features/ui/delete-button";
import { deleteKycCaseAction } from "@/features/kyc/actions";

export default async function KycCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermissionPage("kyc.view", "KYC_CASE");
  const { id } = await params;
  const kycCaseId = Number(id);
  if (!Number.isInteger(kycCaseId)) notFound();

  const user = await getCurrentUser();
  const [kycCase] = await db
    .select()
    .from(kycCases)
    .where(eq(kycCases.id, kycCaseId))
    .limit(1);
  if (!kycCase || kycCase.organizationId !== user.organizationId) notFound();

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, kycCase.customerId))
    .limit(1);
  const riskLevel = await latestRiskLevel(kycCaseId);
  const canDelete = await checkPermission("kyc.delete", "KYC_CASE", {
    organizationId: kycCase.organizationId,
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">
            {customer?.firstName} {customer?.lastName}
          </h1>
          <p className="mt-1 text-xs text-steel">
            {customer?.customerNumber} · Status: {kycCase.status}
            {riskLevel ? ` · Risk: ${riskLevel}` : ""}
          </p>
        </div>
        {canDelete && (
          <DeleteButton
            onDelete={deleteKycCaseAction.bind(null, kycCaseId)}
            confirmText="Delete this KYC case? This cannot be undone."
            redirectTo="/kyc"
          />
        )}
      </div>

      {kycCase.rejectionReason && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Rejected: {kycCase.rejectionReason}
        </p>
      )}

      <KycStatusActions kycCaseId={kycCaseId} status={kycCase.status} />
    </div>
  );
}
