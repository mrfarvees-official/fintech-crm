import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  requirePermissionPage,
  checkPermission,
} from "@/features/authorization/can";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { deleteCustomerAction } from "@/features/customers/actions";
import { DeleteButton } from "@/features/ui/delete-button";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermissionPage("customer.view", "CUSTOMER");
  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isInteger(customerId)) notFound();

  const user = await getCurrentUser();
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!customer || customer.organizationId !== user.organizationId) notFound();

  const canEdit = await checkPermission("customer.update", "CUSTOMER", {
    assignedUserId: customer.assignedUserId,
    organizationId: customer.organizationId,
  });

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

  const canDelete = await checkPermission("customer.delete", "CUSTOMER", {
    assignedUserId: customer.assignedUserId,
    organizationId: customer.organizationId,
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">
          {customer.firstName} {customer.lastName}
        </h1>
        {canDelete && (
          <DeleteButton
            onDelete={deleteCustomerAction.bind(null, customer.id)}
            confirmText="Delete this customer? This cannot be undone."
          />
        )}
      </div>
      <CustomerForm
        customer={{
          ...customer,
          dateOfBirth: customer.dateOfBirth?.toISOString() ?? null,
        }}
        orgUsers={orgUsers}
        readOnly={!canEdit}
      />
    </div>
  );
}
