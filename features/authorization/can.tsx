import "server-only";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getUserPermissions } from "@/lib/auth/rbac";
import { isTenantAdmin } from "@/lib/auth/tenant";
import {
  canWithReason,
  type AttrBag,
  type AccessResult,
} from "@/lib/auth/pbac";

export async function checkPermissionWithReason(
  action: string,
  resourceType: string,
  resource: AttrBag = {},
  context: AttrBag = {},
): Promise<AccessResult> {
  // Single chokepoint for the tenant-admin bypass. Every permission check in
  // the app funnels through here (Can, checkPermission, requirePermissionPage
  // all delegate to this function), so this is the one place it needs to
  // live — deliberately NOT inside evaluatePolicySet()/canWithReason() in
  // pbac.ts, since those are pure policy evaluation also reused by the
  // policy-test tooling, and shouldn't silently short-circuit.
  if (await isTenantAdmin()) {
    return { allowed: true, reason: "Allowed: tenant admin bypass." };
  }

  const user = await getCurrentUser();
  const permissionCodes = await getUserPermissions();

  return canWithReason(
    user.organizationId,
    {
      id: user.id,
      department: user.department,
      organizationId: user.organizationId,
      status: user.status,
    },
    permissionCodes,
    action,
    resourceType,
    resource,
    context,
  );
}

export async function checkPermission(
  action: string,
  resourceType: string,
  resource: AttrBag = {},
  context: AttrBag = {},
): Promise<boolean> {
  return (
    await checkPermissionWithReason(action, resourceType, resource, context)
  ).allowed;
}

interface CanProps {
  action: string;
  resourceType: string;
  resource?: AttrBag;
  context?: AttrBag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function Can({
  action,
  resourceType,
  resource = {},
  context = {},
  children,
  fallback = null,
}: CanProps) {
  const allowed = await checkPermission(
    action,
    resourceType,
    resource,
    context,
  );
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export async function requirePermissionPage(
  action: string,
  resourceType: string,
  resource: AttrBag = {},
  context: AttrBag = {},
): Promise<void> {
  if (!(await checkPermission(action, resourceType, resource, context)))
    notFound();
}
