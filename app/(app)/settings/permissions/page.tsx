import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { policies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/dal";
import { getUserPermissions } from "@/lib/auth/rbac";
import { PolicyTester } from "@/features/settings/permissions/components/policy-tester";

export default async function PermissionsPage() {
  const user = await getCurrentUser();
  const permissions = await getUserPermissions();
  if (!permissions.has("authorization.manage")) notFound();

  const orgPolicies = await db
    .select()
    .from(policies)
    .where(eq(policies.organizationId, user.organizationId));

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Permissions</h1>
      <p className="mt-1 text-sm text-steel">
        Active PBAC policies for your organization.
      </p>

      <div className="mt-6 flex flex-col divide-y divide-line rounded-lg border border-line bg-paper-raised">
        {orgPolicies.map((p) => (
          <div key={p.id} className="px-5 py-4">
            <p className="text-sm font-medium text-ink">{p.name}</p>
            <p className="mt-1 text-xs text-steel">
              {p.effect} · {p.action} on {p.resourceType} · priority{" "}
              {p.priority}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-serif text-lg text-ink">Test a policy</h2>
      <PolicyTester
        policies={orgPolicies.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
