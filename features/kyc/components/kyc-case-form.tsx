"use client";
import { useActionState } from "react";
import { createKycCaseAction } from "../actions";
import type { FormState } from "../schema";
import { ActionToast } from "@/features/ui/toast/action-toast";

type CustomerOption = {
  id: number;
  firstName: string;
  lastName: string;
  customerNumber: string;
};

export function KycCaseForm({ customers }: { customers: CustomerOption[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createKycCaseAction,
    undefined,
  );

  return (
    <form action={formAction} className="mt-6 max-w-md">
      <ActionToast state={state} />
      <label className="block text-sm font-medium text-ink-soft">
        Customer
        <select
          name="customerId"
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="">Select a customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName} ({c.customerNumber})
            </option>
          ))}
        </select>
      </label>
      {state?.errors?.customerId && (
        <p className="mt-1 text-xs text-red-600">
          {state.errors.customerId[0]}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create case"}
      </button>
    </form>
  );
}
