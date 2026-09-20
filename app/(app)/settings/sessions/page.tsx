import { getCurrentUser } from "@/lib/auth/dal";
import { listActiveSessions } from "@/lib/auth/session-device";
import { readSessionCookie } from "@/lib/auth/session";
import { revokeSessionAction } from "@/features/settings/sessions/actions";

export default async function SessionsPage() {
  const user = await getCurrentUser();
  const current = await readSessionCookie();
  const sessions = await listActiveSessions(user.id);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Sessions</h1>
      <p className="mt-1 text-sm text-steel">
        Devices currently signed in to your account.
      </p>

      <div className="mt-6 flex flex-col divide-y divide-line rounded-lg border border-line bg-paper-raised">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="text-sm font-medium text-ink">
                {s.userAgent ?? "Unknown device"}
                {s.id === current?.sessionId && (
                  <span className="ml-2 rounded-full bg-ledger-soft px-2 py-0.5 text-xs text-ledger">
                    This device
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-steel">
                {s.ipAddress ?? "Unknown IP"} · Last active{" "}
                {s.lastActiveAt.toLocaleString()}
              </p>
            </div>
            {s.id !== current?.sessionId && (
              <form action={revokeSessionAction.bind(null, s.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-line px-3 py-1.5 text-sm text-danger hover:bg-danger-soft"
                >
                  Revoke
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
