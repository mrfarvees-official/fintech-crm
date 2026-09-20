import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { readSessionCookie,  } from "./session";
import { isSessionRevoked } from "./session-device";

export const verifySession = cache(async () => {
  const session = await readSessionCookie();
  if (!session?.userId) redirect("/login");
  if (await isSessionRevoked(session.sessionId)) redirect("/login");
  return session;
});

export const getOptionalSession = cache(async () => {
  return readSessionCookie();
});

export type CurrentUser = {
  id: number;
  organizationId: number;
  organizationName: string;
  name: string;
  email: string;
  department: (typeof users.$inferSelect)["department"];
  status: (typeof users.$inferSelect)["status"];
};

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const session = await verifySession();

  const [user] = await db
    .select({
      id: users.id,
      organizationId: users.organizationId,
      organizationName: organizations.name,
      name: users.name,
      email: users.email,
      department: users.department,
      status: users.status,
    })
    .from(users)
    .innerJoin(organizations, eq(organizations.id, users.organizationId))
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  return user;
});
