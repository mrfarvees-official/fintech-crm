"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/passwords";
import {
  createSessionCookie,
  clearSessionCookie,
  readSessionCookie,
} from "@/lib/auth/session";
import { recordSession, revokeSession } from "@/lib/auth/session-device";
import { LoginSchema, type LoginState } from "./schema";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validated.success)
    return { errors: validated.error.flatten().fieldErrors };

  const { email, password } = validated.data;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { message: "Invalid email or password." };
  }
  if (user.status !== "ACTIVE") {
    return {
      message: "This account is not active. Contact your administrator.",
    };
  }

  const h = await headers();
  const sessionId = await recordSession(
    user.id,
    h.get("user-agent"),
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );

  await createSessionCookie({
    userId: user.id,
    organizationId: user.organizationId,
    sessionId,
  });
  redirect("/");
}

export async function logoutAction() {
  const session = await readSessionCookie();
  if (session?.sessionId) {
    await revokeSession(session.userId, session.sessionId);
  }
  await clearSessionCookie();
  redirect("/login");
}
