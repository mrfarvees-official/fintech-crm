"use client";
import { useActionState } from "react";
import { updateNameAction } from "../actions";
import type { CurrentUser } from "@/lib/auth/dal";

const DEPARTMENT_LABELS: Record<string, string> = {
  RELATIONSHIP: "Relationship Management",
  KYC: "KYC",
  COMPLIANCE: "Compliance",
  MANAGEMENT: "Management",
  ADMIN: "Administration",
};

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [state, formAction, pending] = useActionState(
    updateNameAction,
    undefined,
  );

  return (
    <form action={formAction} className="max-w-md">
      <label className="block text-sm font-medium text-ink-soft">
        Name
        <input
          name="name"
          defaultValue={user.name}
          aria-invalid={Boolean(state?.errors?.name)}
          className="mt-1 w-full rounded-md border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ledger focus:ring-2 focus:ring-ledger/20"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-danger">{state.errors.name[0]}</p>
        )}
      </label>

      <div className="mt-4 flex flex-col gap-3 rounded-md border border-line bg-paper p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-steel">Email</span>
          <span className="font-medium text-ink">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-steel">Department</span>
          <span className="font-medium text-ink">
            {DEPARTMENT_LABELS[user.department] ?? user.department}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-steel">Organization</span>
          <span className="font-medium text-ink">{user.organizationName}</span>
        </div>
      </div>

      {state?.message && (
        <p className="mt-3 text-sm text-steel">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-ledger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#183e52] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
