import { getCurrentUser } from "@/lib/auth/dal";
import { logoutAction } from "@/features/auth/actions";

const DEPARTMENT_LABELS: Record<string, string> = {
  RELATIONSHIP: "Relationship Management",
  KYC: "KYC",
  COMPLIANCE: "Compliance",
  MANAGEMENT: "Management",
  ADMIN: "Administration",
};

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function Home() {
  const user = await getCurrentUser();

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const firstName = user.name.split(" ")[0];
  const department = DEPARTMENT_LABELS[user.department] ?? user.department;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b border-line bg-paper-raised px-6">
        <span className="font-serif text-lg tracking-tight text-ink">
          Fintech CRM
        </span>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-steel sm:inline">
            {user.organizationName}
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ledger text-xs font-medium text-white">
            {getInitials(user.name)}
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-steel/40 hover:bg-paper"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div>
          <h1 className="font-serif text-3xl text-ink">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-steel">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-line bg-paper-raised p-6">
            <h2 className="text-sm font-medium text-steel">Your access</h2>

            <dl className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-steel">Name</dt>
                <dd className="font-medium text-ink">{user.name}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-steel">Email</dt>
                <dd className="font-medium text-ink">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-steel">Department</dt>
                <dd className="font-medium text-ink">{department}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-steel">Organization</dt>
                <dd className="font-medium text-ink">
                  {user.organizationName}
                </dd>
              </div>
            </dl>
          </section>

          <section className="flex flex-col justify-between rounded-lg border border-dashed border-line bg-paper-raised/60 p-6">
            <div>
              <h2 className="text-sm font-medium text-steel">
                What&apos;s next
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Customer records, KYC review, and approvals will appear here as
                each module is enabled for your account.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
