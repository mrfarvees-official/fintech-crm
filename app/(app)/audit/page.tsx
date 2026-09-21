import { and, desc, eq, gte, like, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requirePermissionPage } from "@/features/authorization/can";
import { AuditFilters } from "@/features/audit/components/audit-filters";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    actorId?: string;
    from?: string;
    to?: string;
  }>;
}) {
  await requirePermissionPage("audit.view", "AUDIT_LOG");
  const user = await getCurrentUser();
  const { q, actorId, from, to } = await searchParams;

  const conditions = [eq(auditLogs.organizationId, user.organizationId)];
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(like(auditLogs.action, term), like(auditLogs.resourceType, term))!,
    );
  }
  if (actorId) conditions.push(eq(auditLogs.actorId, Number(actorId)));
  if (from) conditions.push(gte(auditLogs.createdAt, new Date(from)));
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLogs.createdAt, end));
  }

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      resourceType: auditLogs.resourceType,
      resourceId: auditLogs.resourceId,
      oldValues: auditLogs.oldValues,
      newValues: auditLogs.newValues,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.actorId))
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  const orgUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.organizationId, user.organizationId))
    .orderBy(users.name);

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">Audit Log</h1>
      <p className="mt-1 text-sm text-steel">
        Every create, update, and delete across the tenant. Read-only — this
        trail cannot be edited.
      </p>

      <AuditFilters orgUsers={orgUsers} />

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-paper-raised">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-ink-soft">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-steel"
                >
                  No audit entries match your filters.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-xs text-steel">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-ink-soft">
                  {r.actorName ?? "System"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink">
                  {r.action}
                </td>
                <td className="px-4 py-3 text-xs text-steel">
                  {r.resourceType}
                  {r.resourceId ? ` #${r.resourceId}` : ""}
                </td>
                <td className="px-4 py-3">
                  {r.oldValues || r.newValues ? (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-ledger">
                        View
                      </summary>
                      <div className="mt-2 space-y-1 rounded-md border border-line bg-paper p-2 font-mono">
                        {r.oldValues && (
                          <pre className="whitespace-pre-wrap text-red-700">
                            - {JSON.stringify(r.oldValues)}
                          </pre>
                        )}
                        {r.newValues && (
                          <pre className="whitespace-pre-wrap text-green-700">
                            + {JSON.stringify(r.newValues)}
                          </pre>
                        )}
                      </div>
                    </details>
                  ) : (
                    <span className="text-xs text-steel">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
