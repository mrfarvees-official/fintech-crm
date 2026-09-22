import {
  mysqlTable,
  bigint,
  int,
  boolean,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { organizations } from "./organizations";

export const organizationSettings = mysqlTable(
  "organization_settings",
  {
    id: bigint("id", {
      mode: "number",
    })
      .primaryKey()
      .autoincrement(),

    organizationId: bigint("organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organizations.id),

    mediumRiskThreshold: int("medium_risk_threshold").notNull().default(30),

    highRiskThreshold: int("high_risk_threshold").notNull().default(60),

    requireManagerForHighRisk: boolean("require_manager_for_high_risk")
      .notNull()
      .default(true),

    kycExpiryDays: int("kyc_expiry_days").notNull().default(365),

    // --- Login policy support data ---
    // These are DATA that the PBAC policies below reference at evaluation
    // time (loginAction passes them in as CONTEXT/RESOURCE attributes) —
    // they are not policies themselves, same relationship mediumRiskThreshold
    // etc. have to the risk-scoring logic elsewhere. The actual rules (which
    // hours, which days, whether the device check is even active) live in
    // seeded policies (see lib/db/seed/data/policies.ts, action "auth.login")
    // and can be edited/toggled from Settings → Permissions like any other
    // policy — deliberately NOT hardcoded booleans here anymore.

    // IANA timezone the org's business hours are evaluated in, since the
    // app server's own clock (likely UTC) isn't necessarily local time for
    // this tenant. e.g. "Asia/Colombo".
    loginPolicyTimezone: varchar("login_policy_timezone", {
      length: 64,
    })
      .notNull()
      .default("UTC"),

    // IMPORTANT — this is NOT a verified hardware MAC. Browsers/HTTP never
    // expose the client's real MAC address to a server; there is no way to
    // get one from a standard login request. The DENY_TENANT_ADMIN_
    // UNREGISTERED_DEVICE policy only means anything if your reverse proxy
    // / network access control layer independently verifies the device on
    // your LAN and injects an X-Device-Mac header itself — the app trusts
    // that header, it does not and cannot originate it. If nothing
    // upstream sets that header, this control is a formality, not real
    // device verification. Null = not configured, meaning the DENY policy
    // won't match at all (see its EXISTS resource rule) and login is
    // allowed regardless of device.
    tenantAdminAllowedMac: varchar("tenant_admin_allowed_mac", {
      length: 32,
    }),

    // Practical, verifiable substitute for the MAC check above when there's
    // no network layer to trust: the app itself reads x-forwarded-for at
    // login (same header lib/auth/session-device.ts already logs), which is
    // genuinely meaningful behind a normal reverse proxy / load balancer —
    // unlike a client-supplied MAC, this one the app can check on its own.
    // Caveat: only trustworthy if something in front of the app (most
    // hosting providers, Vercel, nginx, etc.) sets x-forwarded-for itself;
    // in a raw local dev setup with nothing in front, this header may be
    // absent or client-supplied, so don't rely on it there.
    tenantAdminAllowedIp: varchar("tenant_admin_allowed_ip", {
      length: 45, // long enough for IPv6
    }),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("organization_settings_org_unique").on(table.organizationId),
  ],
);
