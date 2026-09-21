import { getCurrentUser } from "@/lib/auth/dal";
import { listActiveSessions } from "@/lib/auth/session-device";
import { readSessionCookie } from "@/lib/auth/session";
import { describeUserAgent } from "@/lib/auth/user-agent";
import { revokeSessionAction } from "@/features/settings/sessions/actions";

export default async function SessionsPage() {
  const user = await getCurrentUser();
  const current = await readSessionCookie();
  const sessions = await listActiveSessions(user.id);

  const currentSession = sessions.find((s) => s.id === current?.sessionId);
  const otherSessions = sessions.filter((s) => s.id !== current?.sessionId);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Sessions</h1>
      <p className="mt-1 text-sm text-steel">
        Devices currently signed in to your account.
      </p>

      {currentSession && (
        <div className="mt-6 rounded-lg border border-line bg-paper-raised px-5 py-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink">
              {describeUserAgent(currentSession.userAgent)}
            </p>
            <span className="rounded-full bg-ledger-soft px-2 py-0.5 text-xs text-ledger">
              This device
            </span>
          </div>
          <p className="mt-1 text-xs text-steel">
            {currentSession.ipAddress ?? "Unknown IP"} · Last active{" "}
            {currentSession.lastActiveAt.toLocaleString()}
          </p>
        </div>
      )}

      <h2 className="mt-8 text-sm font-medium text-steel">Other sessions</h2>
      {otherSessions.length === 0 ? (
        <p className="mt-3 text-sm text-steel">
          No other devices are signed in.
        </p>
      ) : (
        <div className="mt-3 flex flex-col divide-y divide-line rounded-lg border border-line bg-paper-raised">
          {otherSessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {describeUserAgent(s.userAgent)}
                </p>
                <p className="mt-1 text-xs text-steel">
                  {s.ipAddress ?? "Unknown IP"} · Last active{" "}
                  {s.lastActiveAt.toLocaleString()}
                </p>
              </div>
              <form action={revokeSessionAction.bind(null, s.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-line px-3 py-1.5 text-sm text-danger hover:bg-danger-soft"
                >
                  Log out
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
