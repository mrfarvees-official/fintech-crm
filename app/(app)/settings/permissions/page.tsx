import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  policies,
  policySubjects,
  policyResources,
  policyConditions,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requireTenantOwnerPage } from "@/lib/auth/tenant";
import { PolicyTester } from "@/features/settings/permissions/components/policy-tester";
import { DeletePolicyButton } from "@/features/settings/permissions/components/delete-policy-button";

export default async function PermissionsPage() {
  await requireTenantOwnerPage();
  const user = await getCurrentUser();

  const orgPolicies = await db
    .select()
    .from(policies)
    .where(eq(policies.organizationId, user.organizationId))
    .orderBy(policies.priority);

  const ids = orgPolicies.map((p) => p.id);
  const [subjectRows, resourceRows, conditionRows] = ids.length
    ? await Promise.all([
        db
          .select()
          .from(policySubjects)
          .where(inArray(policySubjects.policyId, ids)),
        db
          .select()
          .from(policyResources)
          .where(inArray(policyResources.policyId, ids)),
        db
          .select()
          .from(policyConditions)
          .where(inArray(policyConditions.policyId, ids)),
      ])
    : [[], [], []];

  const countFor = (rows: { policyId: number }[], id: number) =>
    rows.filter((r) => r.policyId === id).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Policies</h1>
          <p className="mt-1 text-sm text-steel">
            PBAC policies for your organization. Visible only to the tenant
            owner.
          </p>
        </div>
        <Link
          href="/settings/permissions/new"
          className="rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white"
        >
          New policy
        </Link>
      </div>

      <div className="mt-6 flex flex-col divide-y divide-line rounded-lg border border-line bg-paper-raised">
        {orgPolicies.length === 0 && (
          <p className="px-5 py-4 text-sm text-steel">No policies yet.</p>
        )}
        {orgPolicies.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="text-sm font-medium text-ink">
                {p.name}{" "}
                {!p.isActive && (
                  <span className="text-xs text-steel">(inactive)</span>
                )}
              </p>
              <p className="mt-1 text-xs text-steel">
                {p.effect} · {p.action} on {p.resourceType} · priority{" "}
                {p.priority} · {countFor(subjectRows, p.id)} subject rule(s),{" "}
                {countFor(resourceRows, p.id)} resource rule(s),{" "}
                {countFor(conditionRows, p.id)} condition(s)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/settings/permissions/${p.id}`}
                className="text-sm font-medium text-ledger"
              >
                Edit
              </Link>
              <DeletePolicyButton policyId={p.id} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-serif text-lg text-ink">Test a policy</h2>
      <PolicyTester
        policies={orgPolicies.map((p) => ({
          id: p.id,
          name: p.name,
          resourceType: p.resourceType,
        }))} orgUsers={[]}      />
    </div>
  );
}
