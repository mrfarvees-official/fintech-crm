import { getCurrentUser } from "@/lib/auth/dal";
import { isTenantOwner } from "@/lib/auth/tenant";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const owner = await isTenantOwner();

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">
        Welcome back, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-steel">
        {user.organizationName} · {user.department}
        {owner && " · Tenant owner"}
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <PlaceholderCard label="Customers" />
        <PlaceholderCard label="KYC cases" />
        <PlaceholderCard label="Pending approvals" />
      </div>
    </div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper-raised p-5">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-2 text-xs text-steel">Coming soon.</p>
    </div>
  );
}