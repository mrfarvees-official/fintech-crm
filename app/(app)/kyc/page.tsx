import Link from "next/link";
import { and, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { kycCases, customers, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requirePermissionPage, Can, checkPermission } from "@/features/authorization/can";
import { KYC_STATUSES } from "@/features/kyc/schema";
import { KycFilters } from "@/features/kyc/components/kyc-filters";
import { DeleteButton } from "@/features/ui/delete-button";
import { deleteKycCaseAction } from "@/features/kyc/actions";

export default async function KycPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; submittedBy?: string }>;
}) {
  await requirePermissionPage("kyc.view", "KYC_CASE");
  const user = await getCurrentUser();
  const { q, status, submittedBy } = await searchParams;

  const conditions = [eq(kycCases.organizationId, user.organizationId)];
  if (status && (KYC_STATUSES as readonly string[]).includes(status)) {
    conditions.push(eq(kycCases.status, status as (typeof KYC_STATUSES)[number]));
  }
  if (submittedBy) conditions.push(eq(kycCases.submittedBy, Number(submittedBy)));
  if (q) {
    const term = `%${q}%`;
    conditions.push(or(like(customers.firstName, term), like(customers.lastName, term), like(customers.customerNumber, term))!);
  }

  const rows = await db
    .select({
      id: kycCases.id,
      status: kycCases.status,
      createdAt: kycCases.createdAt,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerNumber: customers.customerNumber,
      submittedByName: users.name,
      organizationId: kycCases.organizationId,
    })
    .from(kycCases)
    .innerJoin(customers, eq(customers.id, kycCases.customerId))
    .leftJoin(users, eq(users.id, kycCases.submittedBy))
    .where(and(...conditions))
    .orderBy(kycCases.status);

  const rowsWithAccess = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      canDelete: await checkPermission("kyc.delete", "KYC_CASE", { organizationId: r.organizationId }),
    })),
  );

  const orgUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.organizationId, user.organizationId))
    .orderBy(users.name);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">KYC Cases</h1>
        <Can action="kyc.create" resourceType="KYC_CASE">
          <Link href="/kyc/new" className="rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white">New case</Link>
        </Can>
      </div>

      <KycFilters orgUsers={orgUsers} />

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-paper-raised">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-ink-soft">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted by</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rowsWithAccess.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-steel">No KYC cases match your filters.</td></tr>
            )}
            {rowsWithAccess.map((r) => (
              <tr key={r.id} className="hover:bg-paper">
                <td className="px-4 py-3 text-ink">
                  {r.customerFirstName} {r.customerLastName}
                  <span className="ml-2 font-mono text-xs text-steel">{r.customerNumber}</span>
                </td>
                <td className="px-4 py-3"><span className="rounded-full bg-paper px-2 py-0.5 text-xs text-ink-soft">{r.status}</span></td>
                <td className="px-4 py-3 text-xs text-steel">{r.submittedByName ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-steel">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/kyc/${r.id}`} className="text-xs font-medium text-ledger hover:underline">View</Link>
                    {r.canDelete && (
                      <DeleteButton
                        onDelete={deleteKycCaseAction.bind(null, r.id)}
                        confirmText="Delete this KYC case? This cannot be undone."
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}