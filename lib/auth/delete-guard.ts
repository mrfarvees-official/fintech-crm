import "server-only";
import { checkPermissionWithReason } from "@/features/authorization/can";
import type { AttrBag } from "@/lib/auth/pbac";

export type DeleteGuardResult =
  | { allowed: true }
  | { allowed: false; message: string };

/** Every resource's delete action calls this first — one place for the PBAC check and its reason. */
export async function guardDelete(
  action: string,
  resourceType: string,
  resource: AttrBag,
): Promise<DeleteGuardResult> {
  const access = await checkPermissionWithReason(
    action,
    resourceType,
    resource,
  );
  if (!access.allowed) return { allowed: false, message: access.reason };
  return { allowed: true };
}

/** Turns a MySQL FK-constraint error into a clean message instead of a 500 — reusable across any resource with dependents. */
export function isForeignKeyConstraintError(err: unknown): boolean {
  const code =
    (err as { cause?: { code?: string }; code?: string })?.cause?.code ??
    (err as { code?: string })?.code;
  return code === "ER_ROW_IS_REFERENCED_2" || code === "ER_ROW_IS_REFERENCED";
}
