"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/dal";
import { revokeSession } from "@/lib/auth/session-device";
import { recordAudit } from "@/lib/audit/log";

export async function revokeSessionAction(sessionId: string) {
  const user = await getCurrentUser();
  await revokeSession(user.id, sessionId);

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "session.revoke",
    resourceType: "USER_SESSION",
    resourceId: null,
    oldValues: { sessionId },
  });

  revalidatePath("/settings/sessions");
}
