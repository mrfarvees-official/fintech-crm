import { eq } from "drizzle-orm";

import { organizations, organizationSettings } from "@/lib/db/schema";

import { DEMO_ORGANIZATION } from "../data/organization";
import { DEMO_ORGANIZATION_SETTINGS } from "../data/organization_settings";

import type { SeedTransaction } from "../types";

export async function ensureOrganizationOwner(
  tx: SeedTransaction,
  organization: typeof organizations.$inferSelect,
  ownerId: number,
) {
  if (organization.ownerId) {
    console.log(
      `  = Organization owner already set (user ${organization.ownerId})`,
    );
    return;
  }
  await tx
    .update(organizations)
    .set({ ownerId })
    .where(eq(organizations.id, organization.id));
  console.log(`  + Organization owner set to user ${ownerId}`);
}

/**
 * organizations.tenantAdminUserId is a single nullable column, so "one
 * tenant admin per org" is enforced by the schema shape itself — this
 * function just never overwrites an existing assignment on reseed,
 * matching ensureOrganizationOwner's idempotency.
 */
export async function ensureTenantAdmin(
  tx: SeedTransaction,
  organization: typeof organizations.$inferSelect,
  tenantAdminUserId: number,
) {
  if (organization.tenantAdminUserId) {
    console.log(
      `  = Tenant admin already set (user ${organization.tenantAdminUserId})`,
    );
    return;
  }
  await tx
    .update(organizations)
    .set({ tenantAdminUserId })
    .where(eq(organizations.id, organization.id));
  console.log(`  + Tenant admin set to user ${tenantAdminUserId}`);
}

export async function seedOrganization(tx: SeedTransaction) {
  const [existingOrganization] = await tx
    .select()
    .from(organizations)
    .where(eq(organizations.code, DEMO_ORGANIZATION.code))
    .limit(1);

  let organization = existingOrganization;

  if (!organization) {
    const result = await tx
      .insert(organizations)
      .values({
        ...DEMO_ORGANIZATION,
        status: DEMO_ORGANIZATION.status as "ACTIVE" | "SUSPENDED" | "INACTIVE",
      })
      .$returningId();

    const organizationId = result[0].id;

    const [createdOrganization] = await tx
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!createdOrganization) {
      throw new Error("Failed to create seed organization.");
    }

    organization = createdOrganization;

    console.log(`  + Organization: ${organization.code}`);
  } else {
    console.log(`  = Organization exists: ${organization.code}`);
  }

  const [existingSettings] = await tx
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, organization.id))
    .limit(1);

  if (!existingSettings) {
    await tx.insert(organizationSettings).values({
      organizationId: organization.id,
      ...DEMO_ORGANIZATION_SETTINGS,
    });

    console.log("  + Organization settings");
  } else {
    console.log("  = Organization settings exist");
  }

  return organization;
}
