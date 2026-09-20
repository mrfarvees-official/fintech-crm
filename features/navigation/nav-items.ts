export interface NavItem {
  href: string;
  label: string;
  /** Omit for items visible to every authenticated user (e.g. Dashboard, Sessions). */
  gate?: { action: string; resourceType: string };
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Dashboard" },
  // customer, kyc, approvals items go here as those features land
];

export const SETTINGS_NAV: NavItem[] = [
  { href: "/settings/sessions", label: "Sessions" },
  {
    href: "/settings/tenant",
    label: "Tenant",
    gate: { action: "tenant.manage", resourceType: "organization" },
  },
  {
    href: "/settings/permissions",
    label: "Permissions",
    gate: { action: "authorization.manage", resourceType: "policy" },
  },
];
