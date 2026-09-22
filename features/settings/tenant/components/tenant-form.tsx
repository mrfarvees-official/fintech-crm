"use client";
import { useActionState } from "react";
import { updateTenantAction, updateTenantAdminAction } from "../actions";
import type { organizations, users } from "@/lib/db/schema";

type OrgUser = Pick<typeof users.$inferSelect, "id" | "name" | "email">;

export function TenantForm({
  organization,
  users: orgUsers,
}: {
  organization: typeof organizations.$inferSelect;
  users: OrgUser[];
}) {
  const [state, formAction, pending] = useActionState(
    updateTenantAction,
    undefined,
  );

  const [adminState, adminFormAction, adminPending] = useActionState(
    updateTenantAdminAction,
    undefined,
  );

  return (
    <div className="max-w-md space-y-10">
      <form action={formAction}>
        <h1 className="font-serif text-2xl text-ink">Tenant</h1>
        <p className="mt-1 text-sm text-steel">
          Visible only to the tenant owner.
        </p>

        <label className="mt-6 block text-sm font-medium text-ink-soft">
          Organization name
          <input
            name="name"
            defaultValue={organization.name}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>

        {state?.message && (
          <p className="mt-3 text-sm text-steel">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </form>

      <form action={adminFormAction} className="border-t border-line pt-8">
        <h2 className="font-serif text-xl text-ink">Tenant admin</h2>
        <p className="mt-1 text-sm text-steel">
          This one person bypasses every access policy for this tenant. Only one
          seat exists — reassigning replaces whoever holds it.
        </p>

        <label className="mt-6 block text-sm font-medium text-ink-soft">
          Assigned to
          <select
            name="tenantAdminUserId"
            defaultValue={organization.tenantAdminUserId ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
          >
            <option value="">— None —</option>
            {orgUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </label>

        {adminState?.message && (
          <p className="mt-3 text-sm text-steel">{adminState.message}</p>
        )}

        <button
          type="submit"
          disabled={adminPending}
          className="mt-4 rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {adminPending ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
