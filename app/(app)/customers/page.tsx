import { requirePermissionPage } from "@/features/authorization/can";

export default async function CustomersPage() {
  await requirePermissionPage("customer.view", "CUSTOMER");
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">Customers</h1>
      <p className="mt-1 text-sm text-steel">Coming soon.</p>
    </div>
  );
}
