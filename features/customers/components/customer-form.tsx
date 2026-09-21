"use client";
import { useActionState } from "react";
import { createCustomerAction, updateCustomerAction } from "../actions";
import {
  EMPLOYMENT_STATUSES,
  CUSTOMER_STATUSES,
  type CustomerFormState,
} from "../schema";
import { ActionToast } from "@/features/ui/toast/action-toast";

type CustomerRecord = {
  id?: number;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  nicPassport: string | null;
  dateOfBirth: string | null;
  employmentStatus: string | null;
  employer: string | null;
  monthlyIncome: string | null;
  assignedUserId: number | null;
  status: string;
};
type OrgUser = { id: number; name: string; email: string };

export function CustomerForm({
  customer,
  orgUsers,
  readOnly = false,
}: {
  customer?: CustomerRecord;
  orgUsers: OrgUser[];
  readOnly?: boolean;
}) {
  const boundAction = customer?.id
    ? updateCustomerAction.bind(null, customer.id)
    : createCustomerAction;
  const [state, formAction, pending] = useActionState<
    CustomerFormState,
    FormData
  >(boundAction, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-2xl">
      <ActionToast state={state} />
      <fieldset
        disabled={readOnly}
        className="grid grid-cols-2 gap-4 disabled:opacity-60"
      >
        <label className="block text-sm font-medium text-ink-soft">
          Customer number
          <input
            name="customerNumber"
            defaultValue={customer?.customerNumber}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Status
          <select
            name="status"
            defaultValue={customer?.status ?? "LEAD"}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          >
            {CUSTOMER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          First name
          <input
            name="firstName"
            defaultValue={customer?.firstName}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Last name
          <input
            name="lastName"
            defaultValue={customer?.lastName}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Email
          <input
            name="email"
            defaultValue={customer?.email ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Phone
          <input
            name="phone"
            defaultValue={customer?.phone ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          NIC / Passport
          <input
            name="nicPassport"
            defaultValue={customer?.nicPassport ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Date of birth
          <input
            name="dateOfBirth"
            type="date"
            defaultValue={customer?.dateOfBirth ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Employment status
          <select
            name="employmentStatus"
            defaultValue={customer?.employmentStatus ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {EMPLOYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Employer
          <input
            name="employer"
            defaultValue={customer?.employer ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Monthly income
          <input
            name="monthlyIncome"
            type="number"
            step="0.01"
            defaultValue={customer?.monthlyIncome ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Assigned to
          <select
            name="assignedUserId"
            defaultValue={customer?.assignedUserId ?? ""}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {orgUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="mt-6 rounded-md bg-ledger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save customer"}
        </button>
      )}
      {readOnly && (
        <p className="mt-6 text-sm text-steel">
          You don't have permission to edit this customer.
        </p>
      )}
    </form>
  );
}
