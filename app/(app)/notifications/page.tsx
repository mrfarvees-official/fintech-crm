import { requirePermissionPage } from "@/features/authorization/can";

export default async function NotificationsPage() {
  await requirePermissionPage("notification.view", "NOTIFICATION");
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">Notifications</h1>
      <p className="mt-1 text-sm text-steel">Coming soon.</p>
    </div>
  );
}
