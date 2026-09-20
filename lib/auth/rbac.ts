import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userRoles, rolePermissions, permissions } from "@/lib/db/schema";
import { getCurrentUser } from "./dal";

export const getUserPermissions = cache(async (): Promise<Set<string>> => {
  const user = await getCurrentUser();

  const rows = await db
    .select({ code: permissions.code })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(userRoles.userId, user.id));

  return new Set(rows.map((r) => r.code));
});