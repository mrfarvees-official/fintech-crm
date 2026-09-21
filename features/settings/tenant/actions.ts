"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { isTenantOwner } from "@/lib/auth/tenant";
import { recordAudit } from "@/lib/audit/log";

export async function updateTenantAction(
  _prevState: unknown,
  formData: FormData,
) {
  if (!(await isTenantOwner())) {
    return { message: "You don't have permission to manage this tenant." };
  }
  const user = await getCurrentUser();

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim())
    return { message: "Name is required." };

  const [existing] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  await db
    .update(organizations)
    .set({ name: name.trim() })
    .where(eq(organizations.id, user.organizationId));

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "tenant.update",
    resourceType: "organization",
    resourceId: user.organizationId,
    oldValues: { name: existing?.name ?? null },
    newValues: { name: name.trim() },
  });

  revalidatePath("/settings/tenant");
  return { message: "Saved." };
}
