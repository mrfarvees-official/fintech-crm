import "server-only";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getUserPermissions } from "@/lib/auth/rbac";
import { can, type AttrBag } from "@/lib/auth/pbac";

export async function checkPermission(
  action: string,
  resourceType: string,
  resource: AttrBag = {},
  context: AttrBag = {},
): Promise<boolean> {
  const user = await getCurrentUser();
  const permissionCodes = await getUserPermissions();

  return can(
    user.organizationId,
    {
      id: user.id,
      department: user.department,
      organizationId: user.organizationId,
    },
    permissionCodes,
    action,
    resourceType,
    resource,
    context,
  );
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

/** Use at the top of a Server Component page — 404s when the permission is missing. */
export async function requirePermissionPage(
  action: string,
  resourceType: string,
  resource: AttrBag = {},
  context: AttrBag = {},
): Promise<void> {
  if (!(await checkPermission(action, resourceType, resource, context)))
    notFound();
}
