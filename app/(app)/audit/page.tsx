import { requirePermissionPage } from "@/features/authorization/can";

export default async function AuditPage() {
  await requirePermissionPage("audit.view", "AUDIT_LOG");
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">Audit Log</h1>
      <p className="mt-1 text-sm text-steel">Coming soon.</p>
    </div>
  );
}
