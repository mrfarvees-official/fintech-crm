"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/dal";
import { revokeSession } from "@/lib/auth/session-device";

export async function revokeSessionAction(sessionId: string) {
  const user = await getCurrentUser();
  await revokeSession(user.id, sessionId); // scoped to own user — can't revoke someone else's
  revalidatePath("/settings/sessions");
}