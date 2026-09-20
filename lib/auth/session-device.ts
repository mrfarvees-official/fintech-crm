import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSessions } from "@/lib/db/schema";
import { SESSION_DURATION_MS } from "./config";

export async function recordSession(
  userId: number,
  userAgent: string | null,
  ipAddress: string | null,
) {
  const id = randomUUID();
  await db.insert(userSessions).values({
    id,
    userId,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });
  return id;
}

export async function listActiveSessions(userId: number) {
  return db
    .select()
    .from(userSessions)
    .where(
      and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt)),
    );
}

export async function revokeSession(userId: number, sessionId: string) {
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)),
    );
}

export async function isSessionRevoked(sessionId: string) {
  const [row] = await db
    .select({ revokedAt: userSessions.revokedAt })
    .from(userSessions)
    .where(eq(userSessions.id, sessionId))
    .limit(1);
  return !row || row.revokedAt !== null;
}
