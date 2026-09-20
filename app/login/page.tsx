import { redirect } from "next/navigation";

import { getOptionalSession } from "@/lib/auth/dal";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign in — Fintech CRM",
};

export default async function LoginPage() {
  const session = await getOptionalSession();

  if (session?.userId) {
    redirect("/");
  }

  return (
    <div className="grid flex-1 lg:grid-cols-2">
      {/* Left: brand panel. Ledger rules tie the texture to the subject
          matter (a system of record) instead of decorating for its own sake. */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-12 text-paper lg:flex"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 44px)",
        }}
      >
        <span className="font-serif text-lg tracking-tight">
          Fintech CRM
        </span>

        <div className="max-w-sm">
          <p className="font-serif text-3xl leading-snug text-paper">
            Every relationship, one verified record.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-paper/60">
            Customer onboarding, KYC review, and approvals in a single
            system your compliance team can stand behind.
          </p>
        </div>

        <p className="text-xs text-paper/40">
          Internal use only &middot; authorized personnel
        </p>
      </div>

      {/* Right: the form. */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-1">
            <span className="font-serif text-lg tracking-tight text-ink lg:hidden">
              Fintech CRM
            </span>
            <h1 className="font-serif text-2xl text-ink">Sign in</h1>
            <p className="text-sm text-steel">
              Use the credentials issued by your organization.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}