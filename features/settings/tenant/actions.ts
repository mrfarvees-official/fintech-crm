"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizations, users, organizationSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { isTenantOwner } from "@/lib/auth/tenant";
import { recordAudit } from "@/lib/audit/log";

export async function updateTenantAction(
  _prevState: unknown,
  formData: FormData,
) {
  if (!(await isTenantOwner())) {
    return { message: "You don't have permission to manage this tenant." };
  }
  const user = await getCurrentUser();

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim())
    return { message: "Name is required." };

  const [existing] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  await db
    .update(organizations)
    .set({ name: name.trim() })
    .where(eq(organizations.id, user.organizationId));

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "tenant.update",
    resourceType: "organization",
    resourceId: user.organizationId,
    oldValues: { name: existing?.name ?? null },
    newValues: { name: name.trim() },
  });

  revalidatePath("/settings/tenant");
  return { message: "Saved." };
}

/**
 * Reassigning is just an UPDATE on the single tenantAdminUserId column —
 * "at most one per tenant" falls out of that column shape, there's no
 * separate uniqueness check to maintain here.
 *
 * Gated by isTenantOwner(), which now means owner OR tenant admin (see
 * lib/auth/tenant.ts). Worth knowing: this means a tenant admin can
 * reassign the seat to someone else, or simply leave it assigned to
 * themselves indefinitely — there's no separate control preventing that
 * beyond the owner noticing and reassigning it back. That's a deliberate
 * consequence of "full superuser," not an oversight; say so if you want
 * this one action to stay strictly owner-only while everything else here
 * opens up to the tenant admin.
 */
export async function updateTenantAdminAction(
  _prevState: unknown,
  formData: FormData,
) {
  if (!(await isTenantOwner())) {
    return { message: "You don't have permission to manage this tenant." };
  }
  const user = await getCurrentUser();

  const raw = formData.get("tenantAdminUserId");
  const nextTenantAdminUserId =
    typeof raw === "string" && raw.trim() ? Number(raw) : null;

  if (raw !== null && nextTenantAdminUserId === null) {
    return { message: "Invalid selection." };
  }

  if (nextTenantAdminUserId !== null) {
    // Guard against assigning a user from a different org — nothing in the
    // schema itself prevents that (tenantAdminUserId is a bare bigint, no
    // .references(), same as ownerId), so it has to be checked here.
    const [candidate] = await db
      .select({ id: users.id, organizationId: users.organizationId })
      .from(users)
      .where(
        and(
          eq(users.id, nextTenantAdminUserId),
          eq(users.organizationId, user.organizationId),
        ),
      )
      .limit(1);

    if (!candidate) {
      return { message: "That user isn't a member of this tenant." };
    }
  }

  const [existing] = await db
    .select({ tenantAdminUserId: organizations.tenantAdminUserId })
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  await db
    .update(organizations)
    .set({ tenantAdminUserId: nextTenantAdminUserId })
    .where(eq(organizations.id, user.organizationId));

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "tenant.admin.reassign",
    resourceType: "organization",
    resourceId: user.organizationId,
    oldValues: { tenantAdminUserId: existing?.tenantAdminUserId ?? null },
    newValues: { tenantAdminUserId: nextTenantAdminUserId },
  });

  revalidatePath("/settings/tenant");
  return { message: "Tenant admin updated." };
}

/**
 * Sets organizationSettings.tenantAdminAllowedIp — the value the
 * DENY_TENANT_ADMIN_UNKNOWN_IP policy (see lib/db/seed/data/policies.ts)
 * compares against at login via $resource.allowedIp. Empty input clears
 * it, which makes that policy's EXISTS resource rule stop matching
 * entirely — fail-open, not fail-closed, same reasoning as the MAC
 * field: an org should never get locked out just because a settings
 * field happens to be unset.
 *
 * This does NOT touch tenantAdminAllowedMac — that field is left in
 * place but is effectively inert unless something in front of this app
 * actually injects a trustworthy X-Device-Mac header (see the caveat on
 * that column in lib/db/schema/settings.ts and in lib/auth/login-policy.ts).
 */
export async function updateTenantAdminAllowedIpAction(
  _prevState: unknown,
  formData: FormData,
) {
  if (!(await isTenantOwner())) {
    return { message: "You don't have permission to manage this tenant." };
  }
  const user = await getCurrentUser();

  const raw = formData.get("tenantAdminAllowedIp");
  const nextAllowedIp =
    typeof raw === "string" && raw.trim() ? raw.trim() : null;

  const [existing] = await db
    .select({ tenantAdminAllowedIp: organizationSettings.tenantAdminAllowedIp })
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, user.organizationId))
    .limit(1);

  if (!existing) {
    return {
      message:
        "No organization settings row found for this tenant — check that the seed has run.",
    };
  }

  await db
    .update(organizationSettings)
    .set({ tenantAdminAllowedIp: nextAllowedIp })
    .where(eq(organizationSettings.organizationId, user.organizationId));

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "tenant.admin.allowedIp.update",
    resourceType: "organization",
    resourceId: user.organizationId,
    oldValues: { tenantAdminAllowedIp: existing.tenantAdminAllowedIp },
    newValues: { tenantAdminAllowedIp: nextAllowedIp },
  });

  revalidatePath("/settings/tenant");
  return { message: "Allowed IP updated." };
}
