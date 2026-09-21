"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  policies,
  policySubjects,
  policyResources,
  policyConditions,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { isTenantOwner } from "@/lib/auth/tenant";
import { PolicySchema, type PolicyFormState } from "./schema";

function parseRows(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    code: formData.get("code"),
    description: (formData.get("description") as string) || null,
    action: formData.get("action"),
    resourceType: formData.get("resourceType"),
    effect: formData.get("effect"),
    priority: formData.get("priority"),
    isActive: formData.get("isActive") === "on",
    subjects: parseRows(formData.get("subjects")),
    resources: parseRows(formData.get("resources")),
    conditions: parseRows(formData.get("conditions")),
  };
}

export async function createPolicyAction(
  _prevState: PolicyFormState,
  formData: FormData,
): Promise<PolicyFormState> {
  if (!(await isTenantOwner())) {
    return { message: "Only the tenant owner can manage policies." };
  }
  const user = await getCurrentUser();

  const parsed = PolicySchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Fix the errors below.",
    };
  }
  const data = parsed.data;

  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(policies)
      .values({
        organizationId: user.organizationId,
        name: data.name,
        code: data.code,
        description: data.description ?? null,
        action: data.action,
        resourceType: data.resourceType,
        effect: data.effect,
        priority: data.priority,
        isActive: data.isActive,
      })
      .$returningId();

    const policyId = row.id;

    if (data.subjects.length)
      await tx
        .insert(policySubjects)
        .values(data.subjects.map((r) => ({ policyId, ...r })));
    if (data.resources.length)
      await tx
        .insert(policyResources)
        .values(data.resources.map((r) => ({ policyId, ...r })));
    if (data.conditions.length)
      await tx
        .insert(policyConditions)
        .values(data.conditions.map((c) => ({ policyId, ...c })));
  });

  revalidatePath("/settings/permissions");
  redirect("/settings/permissions");
}

export async function updatePolicyAction(
  policyId: number,
  _prevState: PolicyFormState,
  formData: FormData,
): Promise<PolicyFormState> {
  if (!(await isTenantOwner())) {
    return { message: "Only the tenant owner can manage policies." };
  }
  const user = await getCurrentUser();

  const [existing] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, policyId))
    .limit(1);
  if (!existing || existing.organizationId !== user.organizationId) {
    return { message: "Policy not found." };
  }

  const parsed = PolicySchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Fix the errors below.",
    };
  }
  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(policies)
      .set({
        name: data.name,
        code: data.code,
        description: data.description ?? null,
        action: data.action,
        resourceType: data.resourceType,
        effect: data.effect,
        priority: data.priority,
        isActive: data.isActive,
      })
      .where(eq(policies.id, policyId));

    // "Can have multiple" rows -> simplest correct update is replace-the-set.
    await tx
      .delete(policySubjects)
      .where(eq(policySubjects.policyId, policyId));
    await tx
      .delete(policyResources)
      .where(eq(policyResources.policyId, policyId));
    await tx
      .delete(policyConditions)
      .where(eq(policyConditions.policyId, policyId));

    if (data.subjects.length)
      await tx
        .insert(policySubjects)
        .values(data.subjects.map((r) => ({ policyId, ...r })));
    if (data.resources.length)
      await tx
        .insert(policyResources)
        .values(data.resources.map((r) => ({ policyId, ...r })));
    if (data.conditions.length)
      await tx
        .insert(policyConditions)
        .values(data.conditions.map((c) => ({ policyId, ...c })));
  });

  revalidatePath("/settings/permissions");
  redirect("/settings/permissions");
}

export async function deletePolicyAction(policyId: number) {
  if (!(await isTenantOwner())) return;
  const user = await getCurrentUser();

  const [existing] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, policyId))
    .limit(1);
  if (!existing || existing.organizationId !== user.organizationId) return;

  await db.delete(policies).where(eq(policies.id, policyId)); // children cascade
  revalidatePath("/settings/permissions");
}
