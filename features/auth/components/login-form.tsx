"use client";

import { useActionState } from "react";

import { loginAction } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-soft">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@fintech.local"
          aria-invalid={Boolean(state?.errors?.email)}
          className="rounded-md border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-steel/60 focus:border-ledger focus:ring-2 focus:ring-ledger/20"
        />
        {state?.errors?.email && (
          <p className="text-xs text-danger">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(state?.errors?.password)}
          className="rounded-md border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-steel/60 focus:border-ledger focus:ring-2 focus:ring-ledger/20"
        />
        {state?.errors?.password && (
          <p className="text-xs text-danger">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-md bg-ledger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#183e52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ledger/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
