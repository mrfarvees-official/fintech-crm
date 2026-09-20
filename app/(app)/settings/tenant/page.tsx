import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { getUserPermissions } from "@/lib/auth/rbac";
import { can } from "@/lib/auth/pbac";
import { TenantForm } from "@/features/settings/tenant/components/tenant-form";

export default async function TenantPage() {
  const user = await getCurrentUser();
  const permissions = await getUserPermissions();
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  const allowed = await can(
    user.organizationId,
    { id: user.id },
    permissions,
    "tenant.manage",
    "organization",
    { ownerId: org.ownerId },
  );
  if (!allowed) notFound();

  return <TenantForm organization={org} />;
}
