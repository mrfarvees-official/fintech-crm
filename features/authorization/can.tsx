import "server-only";
import { getCurrentUser } from "@/lib/auth/dal";
import { getUserPermissions } from "@/lib/auth/rbac";
import { can, type AttrBag } from "@/lib/auth/pbac";

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
  const user = await getCurrentUser();
  const permissionCodes = await getUserPermissions();

  const allowed = await can(
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

  return allowed ? <>{children}</> : <>{fallback}</>;
}
