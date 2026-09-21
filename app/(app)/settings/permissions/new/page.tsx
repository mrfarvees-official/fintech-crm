import { requireTenantOwnerPage } from "@/lib/auth/tenant";
import { PolicyForm } from "@/features/settings/permissions/components/policy-form";

export default async function NewPolicyPage() {
  await requireTenantOwnerPage();
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">New policy</h1>
      <PolicyForm />
    </div>
  );
}
