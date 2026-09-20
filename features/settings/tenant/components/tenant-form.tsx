"use client";
import { useActionState } from "react";
import { updateTenantAction } from "../actions";
import type { organizations } from "@/lib/db/schema";

export function TenantForm({
  organization,
}: {
  organization: typeof organizations.$inferSelect;
}) {
  const [state, formAction, pending] = useActionState(
    updateTenantAction,
    undefined,
  );

  return (
    <form action={formAction} className="max-w-md">
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
  );
}
