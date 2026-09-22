import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentUser } from "./dal";

export const getCurrentOrganization = cache(async () => {
  const user = await getCurrentUser();
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);
  return org;
});

/**
 * "Owner-only" gate, now meaning owner OR tenant admin. This is the SAME
 * function every existing owner-only page/action/nav item already calls
 * (requireTenantOwnerPage, IsOwner) — tenant admin is folded directly into
 * it rather than living behind a second parallel function, specifically
 * because a parallel function (canManageTenant, tried earlier this
 * session) turned out to be easy to half-apply across files by hand and
 * silently leave some owner-only gates not actually admitting the tenant
 * admin. One function, one thing to update, no per-callsite drift.
 *
 * Still independent of RBAC/PBAC in the sense that matters: nobody gets
 * in here by being assigned a role or matching a seeded policy — only by
 * being the literal organizations.ownerId, or the literal, single
 * organizations.tenantAdminUserId.
 *
 * If you need the literal, un-conflated "is this specifically the owner"
 * fact (e.g. the "· Tenant owner" label on the dashboard), use
 * isExactTenantOwner() instead — that one does NOT include tenant admin.
 */
export const isTenantOwner = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();
  const isOwner = Boolean(org?.ownerId) && org.ownerId === user.id;
  const isAdmin =
    Boolean(org?.tenantAdminUserId) && org.tenantAdminUserId === user.id;
  return isOwner || isAdmin;
});

/** Use at the top of owner-only Server Components. */
export async function requireTenantOwnerPage(): Promise<void> {
  if (!(await isTenantOwner())) notFound();
}

/**
 * Pure ownership fact, deliberately NOT including tenant admin. Only use
 * this where "specifically the owner, not the tenant admin" actually
 * matters — right now that's just the dashboard's "· Tenant owner" label.
 * Every access-control gate should use isTenantOwner() above instead.
 */
export const isExactTenantOwner = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();
  return Boolean(org?.ownerId) && org.ownerId === user.id;
});

/**
 * organizations.tenantAdminUserId is a single nullable column, so this
 * can only ever be true for one user per org.
 *
 * checkPermissionWithReason() (features/authorization/can.tsx) uses this
 * to bypass PBAC for business actions. isTenantOwner() above uses it too,
 * now, to admit the tenant admin into owner-only pages. Both are
 * legitimate, separate uses of the same underlying fact — don't add a
 * third bypass check somewhere else; route through one of these two.
 */
export const isTenantAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();
  return Boolean(org?.tenantAdminUserId) && org.tenantAdminUserId === user.id;
});
