import "server-only";
import { isTenantOwner } from "@/lib/auth/tenant";

export async function IsOwner({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (await isTenantOwner()) ? <>{children}</> : <>{fallback}</>;
}
