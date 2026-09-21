import Link from "next/link";
import { and, asc, eq, isNull, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  requirePermissionPage,
  Can,
  checkPermission,
} from "@/features/authorization/can";
import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { DeleteButton } from "@/features/ui/delete-button";
import { CUSTOMER_STATUSES } from "@/features/customers/schema";
import { deleteCustomerAction } from "@/features/customers/actions";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; assignedTo?: string }>;
}) {
  await requirePermissionPage("customer.view", "CUSTOMER");
  const user = await getCurrentUser();
  const { q, status, assignedTo } = await searchParams;

  const conditions = [eq(customers.organizationId, user.organizationId)];
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(
        like(customers.firstName, term),
        like(customers.lastName, term),
        like(customers.customerNumber, term),
        like(customers.email, term),
        like(customers.phone, term),
      )!,
    );
  }
  if (status && (CUSTOMER_STATUSES as readonly string[]).includes(status)) {
    conditions.push(
      eq(customers.status, status as (typeof CUSTOMER_STATUSES)[number]),
    );
  }
  if (assignedTo === "unassigned") {
    conditions.push(isNull(customers.assignedUserId));
  } else if (assignedTo) {
    conditions.push(eq(customers.assignedUserId, Number(assignedTo)));
  }

  const rows = await db
    .select({
      id: customers.id,
      customerNumber: customers.customerNumber,
      firstName: customers.firstName,
      lastName: customers.lastName,
      email: customers.email,
      phone: customers.phone,
      status: customers.status,
      createdAt: customers.createdAt,
      assignedUserId: customers.assignedUserId,
      assignedUserName: users.name,
    })
    .from(customers)
    .leftJoin(users, eq(users.id, customers.assignedUserId))
    .where(and(...conditions))
    .orderBy(asc(customers.lastName));

  const rowsWithAccess = await Promise.all(
    rows.map(async (c) => ({
      ...c,
      canEdit: await checkPermission("customer.update", "CUSTOMER", {
        assignedUserId: c.assignedUserId,
        organizationId: user.organizationId,
      }),
      canDelete: await checkPermission("customer.delete", "CUSTOMER", {
        assignedUserId: c.assignedUserId,
        organizationId: user.organizationId,
      }),
    })),
  );

  const orgUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.organizationId, user.organizationId))
    .orderBy(users.name);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Customers</h1>
        <Can action="customer.create" resourceType="CUSTOMER">
          <Link
            href="/customers/new"
            className="rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white"
          >
            New customer
          </Link>
        </Can>
      </div>

      <CustomerFilters orgUsers={orgUsers} />

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-paper-raised">
        <table className="w-full min-w-[min-w-] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-ink-soft">
              <th className="px-4 py-3">Customer #</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned to</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rowsWithAccess.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-steel"
                >
                  No customers match your filters.
                </td>
              </tr>
            )}
            {rowsWithAccess.map((c) => (
              <tr key={c.id} className="hover:bg-paper">
                <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                  {c.customerNumber}
                </td>
                <td className="px-4 py-3 text-ink">
                  {c.firstName} {c.lastName}
                </td>
                <td className="px-4 py-3 text-xs text-steel">
                  {c.email ?? c.phone ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-ink-soft">
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-steel">
                  {c.assignedUserName ?? "Unassigned"}
                </td>
                <td className="px-4 py-3 text-xs text-steel">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.canEdit ? (
                      <Link
                        href={`/customers/${c.id}`}
                        className="text-xs font-medium text-ledger hover:underline"
                      >
                        Edit
                      </Link>
                    ) : (
                      <Link
                        href={`/customers/${c.id}`}
                        className="text-xs font-medium text-steel hover:underline"
                      >
                        View
                      </Link>
                    )}
                    {c.canDelete && (
                      <DeleteButton
                        onDelete={deleteCustomerAction.bind(null, c.id)}
                        confirmText="Delete this customer? This cannot be undone."
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
