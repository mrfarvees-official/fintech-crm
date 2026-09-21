export interface NavItem {
  href: string;
  label: string;
  gate?: { action: string; resourceType: string };
  /** Structural tenant-ownership, checked via organizations.ownerId — never RBAC/PBAC. */
  ownerOnly?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Dashboard" },
  // customer, kyc, approvals items go here as those features land
];

export const SETTINGS_NAV: NavItem[] = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/sessions", label: "Sessions" },
  {
    href: "/settings/tenant",
    label: "Tenant",
    gate: { action: "tenant.manage", resourceType: "organization" },
  },
  {
    href: "/settings/permissions",
    label: "Policies", // renamed — it's full PBAC CRUD now, not just a view
    ownerOnly: true, // was: gate: { action: "authorization.manage", resourceType: "policy" }
  },
];
