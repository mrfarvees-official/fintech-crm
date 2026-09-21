"use client";
import { useActionState } from "react";
import { changePasswordAction } from "../actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="max-w-md" noValidate>
      {(
        [
          ["currentPassword", "Current password", "current-password"],
          ["newPassword", "New password", "new-password"],
          ["confirmPassword", "Confirm new password", "new-password"],
        ] as const
      ).map(([name, label, autoComplete]) => (
        <label
          key={name}
          className="mt-4 block text-sm font-medium text-ink-soft first:mt-0"
        >
          {label}
          <input
            name={name}
            type="password"
            autoComplete={autoComplete}
            aria-invalid={Boolean(state?.errors?.[name])}
            className="mt-1 w-full rounded-md border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ledger focus:ring-2 focus:ring-ledger/20"
          />
          {state?.errors?.[name] && (
            <p className="mt-1 text-xs text-danger">{state.errors[name][0]}</p>
          )}
        </label>
      ))}

      {state?.message && (
        <p className="mt-3 rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-steel">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-steel/40 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
