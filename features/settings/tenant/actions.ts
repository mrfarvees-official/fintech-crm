"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
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
 * Gated by isTenantOwner(), same as updateTenantAction — the owner is who
 * grants this, not the tenant admin themself (a tenant admin bypasses PBAC,
 * but that bypass is scoped in tenant.ts to checkPermissionWithReason, and
 * this action deliberately doesn't route through that, so bypass status has
 * no bearing on who can reassign the seat).
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
