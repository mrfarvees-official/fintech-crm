import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, kycCases, notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { isTenantOwner } from "@/lib/auth/tenant";
import { Can } from "@/features/authorization/can";
import { getPendingApprovalsForUser } from "@/features/approvals/get-pending";
import { GrowthChart } from "@/features/dashboard/components/growth-chart";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const owner = await isTenantOwner();

  const [customerRows, kycRows, notificationRows, pendingApprovals] =
    await Promise.all([
      db
        .select({ createdAt: customers.createdAt })
        .from(customers)
        .where(eq(customers.organizationId, user.organizationId)),
      db
        .select({ status: kycCases.status })
        .from(kycCases)
        .where(eq(kycCases.organizationId, user.organizationId)),
      db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(eq(notifications.userId, user.id), isNull(notifications.readAt)),
        ),
      getPendingApprovalsForUser(user),
    ]);

  const kycAwaitingApproval = kycRows.filter(
    (k) => k.status === "AWAITING_APPROVAL",
  ).length;

  const months: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = customerRows.filter((c) => {
      const created = new Date(c.createdAt);
      return (
        created.getFullYear() === d.getFullYear() &&
        created.getMonth() === d.getMonth()
      );
    }).length;
    months.push({
      label: d.toLocaleDateString(undefined, { month: "short" }),
      value: count,
    });
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">
        Welcome back, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-steel">
        {user.organizationName} · {user.department}
        {owner && " · Tenant owner"}
      </p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <Can action="customer.view" resourceType="CUSTOMER">
          <SummaryCard label="Customers" value={customerRows.length} />
        </Can>
        <Can action="kyc.view" resourceType="KYC_CASE">
          <SummaryCard
            label="KYC cases awaiting approval"
            value={kycAwaitingApproval}
          />
        </Can>
        <Can action="approval.view" resourceType="KYC_CASE">
          <SummaryCard
            label="Approvals waiting on you"
            value={pendingApprovals.length}
          />
        </Can>
        <SummaryCard
          label="Unread notifications"
          value={notificationRows.length}
        />
      </div>

      <Can action="customer.view" resourceType="CUSTOMER">
        <div className="mt-8 rounded-lg border border-line bg-paper-raised p-5">
          <p className="text-sm font-medium text-ink-soft">
            New customers, last 6 months
          </p>
          <GrowthChart data={months} />
        </div>
      </Can>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-paper-raised p-5">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-2 font-serif text-2xl text-ink">{value}</p>
    </div>
  );
}
