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
 * Deliberately independent of RBAC roles and PBAC policies.
 * "Who owns this tenant" is a structural fact (organizations.ownerId),
 * not a grantable permission — it must never become true just because
 * someone was assigned a role or a policy was seeded.
 */
export const isTenantOwner = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();
  return Boolean(org?.ownerId) && org.ownerId === user.id;
});

/** Use at the top of owner-only Server Components. */
export async function requireTenantOwnerPage(): Promise<void> {
  if (!(await isTenantOwner())) notFound();
}
