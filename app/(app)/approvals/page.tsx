import { requirePermissionPage } from "@/features/authorization/can";

export default async function ApprovalsPage() {
  await requirePermissionPage("approval.view", "KYC_CASE");
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">Approvals</h1>
      <p className="mt-1 text-sm text-steel">Coming soon.</p>
    </div>
  );
}