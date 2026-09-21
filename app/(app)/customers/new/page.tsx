import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requirePermissionPage } from "@/features/authorization/can";
import { CustomerForm } from "@/features/customers/components/customer-form";

export default async function NewCustomerPage() {
  await requirePermissionPage("customer.create", "CUSTOMER");
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
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">New customer</h1>
      <CustomerForm orgUsers={orgUsers} />
    </div>
  );
}
