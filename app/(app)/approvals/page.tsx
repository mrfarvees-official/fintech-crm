import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { requirePermissionPage } from "@/features/authorization/can";
import { getPendingApprovalsForUser } from "@/features/approvals/get-pending";
import { ApprovalActions } from "@/features/approvals/components/approval-actions";
import { ApprovalFilters } from "@/features/approvals/components/approval-filters";

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string }>;
}) {
  await requirePermissionPage("approval.view", "KYC_CASE");
  const user = await getCurrentUser();
  const { q, action } = await searchParams;

  let items = await getPendingApprovalsForUser(user);
  const availableActions = Array.from(new Set(items.map((i) => i.stepAction)));

  if (action) items = items.filter((i) => i.stepAction === action);
  if (q) {
    const term = q.toLowerCase();
    items = items.filter((i) =>
      `${i.customerFirstName ?? ""} ${i.customerLastName ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">Approvals</h1>
      <p className="mt-1 text-sm text-steel">
        KYC cases awaiting your decision.
      </p>

      <ApprovalFilters actions={availableActions} />

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-paper-raised">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-ink-soft">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Requested by</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-steel"
                >
                  Nothing waiting on you.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.stepId}>
                <td className="px-4 py-3 text-ink">
                  <Link
                    href={`/kyc/${item.resourceId}`}
                    className="hover:underline"
                  >
                    {item.customerFirstName} {item.customerLastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-steel">
                  {item.requestedByName ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                  {item.stepAction}
                </td>
                <td className="px-4 py-3">
                  <ApprovalActions stepId={item.stepId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
