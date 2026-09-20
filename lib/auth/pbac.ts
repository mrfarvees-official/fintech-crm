import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  policies,
  policySubjects,
  policyResources,
  policyConditions,
} from "@/lib/db/schema";

type Operator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "IN"
  | "NOT_IN"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "EXISTS"
  | "NOT_EXISTS";

export type AttrBag = Record<string, unknown>;

export interface PolicyRule {
  attribute: string;
  operator: Operator;
  value: string | null;
}

export interface PolicyCondition extends PolicyRule {
  source: "SUBJECT" | "RESOURCE" | "CONTEXT";
}

export interface PolicyDefinition {
  id: number;
  effect: "ALLOW" | "DENY";
  priority: number;
  subjectRules: PolicyRule[];
  resourceRules: PolicyRule[];
  conditions: PolicyCondition[];
}

export interface EvalResult {
  decision: "ALLOW" | "DENY" | "NOT_APPLICABLE";
  matchedPolicyId?: number;
  reasons: string[];
}

function compare(
  actual: unknown,
  operator: Operator,
  raw: string | null,
): boolean {
  const rawList = () => (raw ?? "").split(",").map((v) => v.trim());
  switch (operator) {
    case "EXISTS":
      return actual !== undefined && actual !== null;
    case "NOT_EXISTS":
      return actual === undefined || actual === null;
    case "EQUALS":
      return String(actual) === raw;
    case "NOT_EQUALS":
      return String(actual) !== raw;
    case "IN":
      return rawList().includes(String(actual));
    case "NOT_IN":
      return !rawList().includes(String(actual));
    case "CONTAINS":
      return String(actual ?? "").includes(raw ?? "");
    case "NOT_CONTAINS":
      return !String(actual ?? "").includes(raw ?? "");
    case "GREATER_THAN":
      return Number(actual) > Number(raw);
    case "GREATER_THAN_OR_EQUAL":
      return Number(actual) >= Number(raw);
    case "LESS_THAN":
      return Number(actual) < Number(raw);
    case "LESS_THAN_OR_EQUAL":
      return Number(actual) <= Number(raw);
    default:
      return false;
  }
}

/** Resolves "$subject.id" / "$resource.ownerId" / literal strings. */
function resolveValue(
  raw: string | null,
  subject: AttrBag,
  resource: AttrBag,
): string | null {
  if (!raw) return raw;
  if (raw.startsWith("$subject.")) return String(subject[raw.slice(9)] ?? "");
  if (raw.startsWith("$resource."))
    return String(resource[raw.slice(10)] ?? "");
  return raw;
}

function ruleMatches(rules: PolicyRule[], bag: AttrBag): boolean {
  return rules.every((r) => compare(bag[r.attribute], r.operator, r.value));
}

function conditionMatches(
  conditions: PolicyCondition[],
  subject: AttrBag,
  resource: AttrBag,
  context: AttrBag,
): boolean {
  return conditions.every((c) => {
    const bag =
      c.source === "SUBJECT"
        ? subject
        : c.source === "RESOURCE"
          ? resource
          : context;
    const attrValue = bag[c.attribute];
    const resolvedRaw = resolveValue(c.value, subject, resource);
    return compare(attrValue, c.operator, resolvedRaw);
  });
}

/** Pure evaluation — no DB access. Reused by the live gate and the test tool. */
export function evaluatePolicySet(
  policyList: PolicyDefinition[],
  subject: AttrBag,
  resource: AttrBag,
  context: AttrBag = {},
): EvalResult {
  const sorted = [...policyList].sort((a, b) => b.priority - a.priority);
  const matches = sorted.filter(
    (p) =>
      ruleMatches(p.subjectRules, subject) &&
      ruleMatches(p.resourceRules, resource) &&
      conditionMatches(p.conditions, subject, resource, context),
  );

  const deny = matches.find((p) => p.effect === "DENY");
  if (deny) {
    return {
      decision: "DENY",
      matchedPolicyId: deny.id,
      reasons: ["Explicit DENY policy matched"],
    };
  }
  const allow = matches.find((p) => p.effect === "ALLOW");
  if (allow) {
    return {
      decision: "ALLOW",
      matchedPolicyId: allow.id,
      reasons: ["ALLOW policy matched"],
    };
  }
  return { decision: "NOT_APPLICABLE", reasons: ["No policy matched"] };
}

async function loadPolicies(
  organizationId: number,
  action: string,
  resourceType: string,
): Promise<PolicyDefinition[]> {
  const rows = await db.query.policies.findMany({
    where: (p, { and, eq, or, isNull }) =>
      and(
        eq(p.action, action),
        eq(p.resourceType, resourceType),
        eq(p.isActive, true),
        or(eq(p.organizationId, organizationId), isNull(p.organizationId)),
      ),
    with: {
      policySubjects: true,
      policyResources: true,
      policyConditions: true,
    } as any,
  });

  // Fallback if relations aren't declared on the schema — fetch manually.
  return Promise.all(
    rows.map(async (p: any) => ({
      id: p.id,
      effect: p.effect,
      priority: p.priority,
      subjectRules:
        p.policySubjects ??
        (await db
          .select()
          .from(policySubjects)
          .where(eq(policySubjects.policyId, p.id))),
      resourceRules:
        p.policyResources ??
        (await db
          .select()
          .from(policyResources)
          .where(eq(policyResources.policyId, p.id))),
      conditions:
        p.policyConditions ??
        (await db
          .select()
          .from(policyConditions)
          .where(eq(policyConditions.policyId, p.id))),
    })),
  );
}

/**
 * Combined RBAC + PBAC check.
 * - If active PBAC policies exist for this action/resourceType, they decide (DENY wins, else ALLOW, else fall through).
 * - Otherwise, falls back to the caller's static RBAC permission set (action code === permission code).
 */
export async function can(
  organizationId: number,
  subject: AttrBag,
  rbacPermissions: Set<string>,
  action: string,
  resourceType: string,
  resource: AttrBag = {},
  context: AttrBag = {},
): Promise<boolean> {
  const policyList = await loadPolicies(organizationId, action, resourceType);
  if (policyList.length > 0) {
    const result = evaluatePolicySet(policyList, subject, resource, context);
    if (result.decision === "ALLOW") return true;
    if (result.decision === "DENY") return false;
    // NOT_APPLICABLE falls through to RBAC
  }
  return rbacPermissions.has(action);
}
