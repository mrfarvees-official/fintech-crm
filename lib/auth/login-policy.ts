import "server-only";
import { canWithReason, type AttrBag } from "./pbac";

/**
 * Login-time policy, driven entirely by real PBAC policies (action
 * "auth.login", resourceType "SESSION" — see lib/db/seed/data/policies.ts)
 * evaluated through the exact same evaluatePolicySet()/canWithReason()
 * engine as every other permission check in the app. There is no
 * hardcoded time window or department check in this file — the actual
 * rules (which hours, which days, whether the device check is active)
 * live in the DB and are editable/toggleable from Settings → Permissions,
 * same as any other policy.
 *
 * This function only exists because there's no session yet at login time,
 * so it can't reuse features/authorization/can.tsx's checkPermissionWithReason
 * (that pulls the subject from getCurrentUser(), which needs a session).
 * The subject bag here is built straight from the user row loginAction
 * already fetched by email.
 */
export async function checkLoginPolicy(
  candidate: {
    id: number;
    organizationId: number;
    department: string;
    status: string;
  },
  request: {
    now: Date;
    timezone: string;
    presentedMac: string | null;
    allowedMac: string | null;
    presentedIp: string | null;
    allowedIp: string | null;
  },
): Promise<{ allowed: boolean; reason: string }> {
  const subject: AttrBag = {
    id: candidate.id,
    department: candidate.department,
    organizationId: candidate.organizationId,
    status: candidate.status,
  };

  const resource: AttrBag = {
    allowedMac: request.allowedMac,
    allowedIp: request.allowedIp,
  };

  const context: AttrBag = computeLoginContext(
    request.now,
    request.timezone,
    request.presentedMac,
    request.presentedIp,
  );

  return canWithReason(
    candidate.organizationId,
    subject,
    new Set(), // RBAC is permanently dead — see repo notes — PBAC decides everything.
    "auth.login",
    "SESSION",
    resource,
    context,
  );
}

/**
 * CONTEXT attributes for the login policies: hour/dayOfWeek in the org's
 * own timezone (not the app server's), plus whatever device identifier
 * arrived with the request.
 *
 * deviceMac CAVEAT: this is read straight from the X-Device-Mac request
 * header. Standard browsers/HTTP never expose a client's real MAC address
 * to a server — there is no way to originate a trustworthy MAC from a
 * login request itself. This value is only meaningful if your reverse
 * proxy / network access control layer independently authenticates the
 * device on your LAN and sets this header itself, stripping whatever the
 * client sent. If nothing upstream does that, a client can set this
 * header directly and the DENY_TENANT_ADMIN_UNREGISTERED_DEVICE policy
 * provides no real security.
 */
function computeLoginContext(
  now: Date,
  timezone: string,
  presentedMac: string | null,
  presentedIp: string | null,
): AttrBag {
  let hour = 0;
  let dayOfWeek = 0; // 0 = Sunday, matches JS Date#getDay() convention

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    }).formatToParts(now);

    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
    const hourPart = parts.find((p) => p.type === "hour")?.value ?? "0";

    // hour12: false can render midnight as "24" in some environments.
    hour = Number(hourPart) % 24;
    dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      weekday,
    );
    if (dayOfWeek < 0) dayOfWeek = 0;
  } catch {
    // Invalid/unknown timezone in org settings. Fall back to UTC-based
    // values from the Date object directly rather than throwing — the
    // seeded DENY policies compare numbers either way, so a bad timezone
    // string degrades to "evaluate in UTC" rather than crashing login.
    hour = now.getUTCHours();
    dayOfWeek = now.getUTCDay();
  }

  return {
    hour,
    dayOfWeek,
    deviceMac: presentedMac ? normalizeMac(presentedMac) : null,
    ip: presentedIp,
  };
}

function normalizeMac(mac: string): string {
  return mac
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "");
}
