import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auditLogs, type AuditValues } from "@/lib/db/schema";

export interface AuditEntry {
  organizationId: number;
  actorId: number | null;
  action: string;
  resourceType: string;
  resourceId: number | null;
  oldValues?: AuditValues | null;
  newValues?: AuditValues | null;
}

/**
 * Best-effort: a logging failure must never break the mutation it describes,
 * so errors are caught and reported here, never propagated to the caller.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const h = await headers();
    await db.insert(auditLogs).values({
      organizationId: entry.organizationId,
      actorId: entry.actorId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      oldValues: entry.oldValues ?? null,
      newValues: entry.newValues ?? null,
      ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: h.get("user-agent"),
    });
  } catch (err) {
    console.error("Failed to record audit log entry:", entry.action, err);
  }
}
