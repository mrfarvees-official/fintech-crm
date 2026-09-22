import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations, users, organizationSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requireTenantOwnerPage } from "@/lib/auth/tenant";
import { TenantForm } from "@/features/settings/tenant/components/tenant-form";

export default async function TenantPage() {
  await requireTenantOwnerPage();
  const user = await getCurrentUser();

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  const orgUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.organizationId, user.organizationId));

  const [settings] = await db
    .select({
      tenantAdminAllowedIp: organizationSettings.tenantAdminAllowedIp,
    })
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, user.organizationId))
    .limit(1);

  return (
    <TenantForm
      organization={org}
      users={orgUsers}
      tenantAdminAllowedIp={settings?.tenantAdminAllowedIp ?? null}
    />
  );
}
