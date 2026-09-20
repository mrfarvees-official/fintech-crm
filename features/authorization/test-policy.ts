"use server";
import { db } from "@/lib/db";
import {
  policySubjects,
  policyResources,
  policyConditions,
  policies,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  evaluatePolicySet,
  type AttrBag,
  type EvalResult,
} from "@/lib/auth/pbac";

export async function testPolicy(
  policyId: number,
  sampleSubject: AttrBag,
  sampleResource: AttrBag,
  sampleContext: AttrBag,
): Promise<EvalResult> {
  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, policyId))
    .limit(1);
  if (!policy)
    return { decision: "NOT_APPLICABLE", reasons: ["Policy not found"] };

  const [subjectRules, resourceRules, conditions] = await Promise.all([
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
  ]);

  return evaluatePolicySet(
    [
      {
        id: policy.id,
        effect: policy.effect,
        priority: policy.priority,
        subjectRules,
        resourceRules,
        conditions,
      },
    ],
    sampleSubject,
    sampleResource,
    sampleContext,
  );
}
