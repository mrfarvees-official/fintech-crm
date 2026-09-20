import { and, eq } from "drizzle-orm";

import {
  policies,
  policyConditions,
  policyResources,
  policySubjects,
} from "@/lib/db/schema";

import { POLICY_SEEDS } from "../data/policies";

import type { SeedTransaction } from "../types";

type Policy = typeof policies.$inferSelect;

export async function seedPbac(
  tx: SeedTransaction,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) {
  const seededPolicies: Record<string, Policy> = {};

  for (const seed of POLICY_SEEDS) {
    const [existingPolicy] = await tx
      .select()
      .from(policies)
      .where(
        and(
          eq(policies.organizationId, organizationId),
          eq(policies.code, seed.policy.code),
        ),
      )
      .limit(1);

    let policy = existingPolicy;

    if (!policy) {
      const [id] = await tx
        .insert(policies)
        .values({
          organizationId,
          ...seed.policy,
        })
        .$returningId();

      [policy] = await tx
        .select()
        .from(policies)
        .where(eq(policies.id, id.id))
        .limit(1);
    }

    if (!policy) {
      throw new Error(`Failed to seed policy ${seed.policy.code}`);
    }

    for (const subject of seed.subjects) {
      const [existing] = await tx
        .select()
        .from(policySubjects)
        .where(
          and(
            eq(policySubjects.policyId, policy.id),
            eq(policySubjects.attribute, subject.attribute),
            eq(policySubjects.operator, subject.operator),
            eq(policySubjects.value, subject.value),
          ),
        )
        .limit(1);

      if (!existing) {
        await tx.insert(policySubjects).values({
          policyId: policy.id,
          ...subject,
        });
      }
    }

    for (const resource of seed.resources) {
      const [existing] = await tx
        .select()
        .from(policyResources)
        .where(
          and(
            eq(policyResources.policyId, policy.id),
            eq(policyResources.attribute, resource.attribute),
            eq(policyResources.operator, resource.operator),
            eq(policyResources.value, resource.value),
          ),
        )
        .limit(1);

      if (!existing) {
        await tx.insert(policyResources).values({
          policyId: policy.id,
          ...resource,
        });
      }
    }

    for (const condition of seed.conditions) {
      const [existing] = await tx
        .select()
        .from(policyConditions)
        .where(
          and(
            eq(policyConditions.policyId, policy.id),
            eq(policyConditions.source, condition.source),
            eq(policyConditions.attribute, condition.attribute),
            eq(policyConditions.operator, condition.operator),
            eq(policyConditions.value, condition.value),
          ),
        )
        .limit(1);

      if (!existing) {
        await tx.insert(policyConditions).values({
          policyId: policy.id,
          ...condition,
        });
      }
    }

    seededPolicies[seed.key] = policy;
  }

  return seededPolicies;
}
