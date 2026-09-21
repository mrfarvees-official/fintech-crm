import { and, desc, eq, isNull, isNotNull, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requirePermissionPage } from "@/features/authorization/can";
import { NotificationActions } from "@/features/notifications/components/notification-actions";
import { MarkAllReadButton } from "@/features/notifications/components/mark-all-read-button";
import { NotificationFilters } from "@/features/notifications/components/notification-filters";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requirePermissionPage("notification.view", "NOTIFICATION");
  const user = await getCurrentUser();
  const { q, status } = await searchParams;

  const conditions = [eq(notifications.userId, user.id)];
  if (status === "unread") conditions.push(isNull(notifications.readAt));
  if (status === "read") conditions.push(isNotNull(notifications.readAt));
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(like(notifications.title, term), like(notifications.message, term))!,
    );
  }

  const rows = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(200);

  const unreadRows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), isNull(notifications.readAt)),
    );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-steel">{unreadRows.length} unread.</p>
        </div>
        {unreadRows.length > 0 && <MarkAllReadButton />}
      </div>

      <NotificationFilters />

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-paper-raised">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-ink-soft">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-steel"
                >
                  No notifications match your filters.
                </td>
              </tr>
            )}
            {rows.map((n) => (
              <tr key={n.id} className={!n.readAt ? "bg-paper" : undefined}>
                <td className="px-4 py-3 text-xs text-steel">
                  {new Date(n.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-ink">{n.title}</td>
                <td className="px-4 py-3 text-xs text-steel">{n.message}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${n.readAt ? "bg-paper text-steel" : "bg-ledger/10 text-ledger"}`}
                  >
                    {n.readAt ? "Read" : "Unread"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <NotificationActions
                    notificationId={n.id}
                    isRead={Boolean(n.readAt)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
