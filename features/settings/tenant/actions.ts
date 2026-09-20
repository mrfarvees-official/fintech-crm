"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { getUserPermissions } from "@/lib/auth/rbac";
import { can } from "@/lib/auth/pbac";

export async function updateTenantAction(
  _prevState: unknown,
  formData: FormData,
) {
  const user = await getCurrentUser();
  const permissions = await getUserPermissions();

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  const allowed = await can(
    user.organizationId,
    { id: user.id },
    permissions,
    "tenant.manage",
    "organization",
    { ownerId: org.ownerId },
  );
  if (!allowed)
    return { message: "You don't have permission to manage this tenant." };

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim())
    return { message: "Name is required." };

  await db
    .update(organizations)
    .set({ name: name.trim() })
    .where(eq(organizations.id, org.id));
  revalidatePath("/settings/tenant");
  return { message: "Saved." };
}
