import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requireTenantOwnerPage } from "@/lib/auth/tenant";
import { PolicyForm } from "@/features/settings/permissions/components/policy-form";

export default async function NewPolicyPage() {
  await requireTenantOwnerPage();
  const user = await getCurrentUser();

  const orgUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(
      and(
        eq(users.organizationId, user.organizationId),
        eq(users.status, "ACTIVE"),
      ),
    )
    .orderBy(users.name);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">New policy</h1>
      <PolicyForm orgUsers={orgUsers} />
    </div>
  );
}
