"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { verifyPassword, hashPassword } from "@/lib/auth/passwords";
import {
  UpdateNameSchema,
  ChangePasswordSchema,
  type UpdateNameState,
  type ChangePasswordState,
} from "./schema";

export async function updateNameAction(
  _prevState: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  const user = await getCurrentUser();

  const validated = UpdateNameSchema.safeParse({ name: formData.get("name") });
  if (!validated.success)
    return { errors: validated.error.flatten().fieldErrors };

  await db
    .update(users)
    .set({ name: validated.data.name })
    .where(eq(users.id, user.id));
  revalidatePath("/settings/profile");
  return { message: "Saved." };
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const user = await getCurrentUser();

  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!validated.success)
    return { errors: validated.error.flatten().fieldErrors };

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (
    !row ||
    !verifyPassword(validated.data.currentPassword, row.passwordHash)
  ) {
    return { errors: { currentPassword: ["Current password is incorrect."] } };
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(validated.data.newPassword) })
    .where(eq(users.id, user.id));

  return { message: "Password updated." };
}
