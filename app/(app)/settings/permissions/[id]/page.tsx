import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  policies,
  policySubjects,
  policyResources,
  policyConditions,
  users,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requireTenantOwnerPage } from "@/lib/auth/tenant";
import { PolicyForm } from "@/features/settings/permissions/components/policy-form";

export default async function EditPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTenantOwnerPage();
  const { id } = await params;
  const policyId = Number(id);
  if (!Number.isInteger(policyId)) notFound();

  const user = await getCurrentUser();
  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, policyId))
    .limit(1);
  if (!policy || policy.organizationId !== user.organizationId) notFound();

  const [subjects, resources, conditions, orgUsers] = await Promise.all([
    db
      .select()
      .from(policySubjects)
      .where(eq(policySubjects.policyId, policyId)),
    db
      .select()
      .from(policyResources)
      .where(eq(policyResources.policyId, policyId)),
    db
      .select()
      .from(policyConditions)
      .where(eq(policyConditions.policyId, policyId)),
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(
        and(
          eq(users.organizationId, user.organizationId),
          eq(users.status, "ACTIVE"),
        ),
      )
      .orderBy(users.name),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Edit policy</h1>
      <PolicyForm
        orgUsers={orgUsers}
        policy={{
          id: policy.id,
          name: policy.name,
          code: policy.code,
          description: policy.description,
          action: policy.action,
          resourceType: policy.resourceType,
          effect: policy.effect,
          priority: policy.priority,
          isActive: policy.isActive,
          subjects: subjects.map(({ attribute, operator, value }) => ({
            attribute,
            operator,
            value,
          })),
          resources: resources.map(({ attribute, operator, value }) => ({
            attribute,
            operator,
            value,
          })),
          conditions: conditions.map(
            ({ source, attribute, operator, value }) => ({
              source,
              attribute,
              operator,
              value,
            }),
          ),
        }}
      />
    </div>
  );
}
