"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { isTenantOwner } from "@/lib/auth/tenant";

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

  await db
    .update(organizations)
    .set({ name: name.trim() })
    .where(eq(organizations.id, user.organizationId));
  revalidatePath("/settings/tenant");
  return { message: "Saved." };
}
