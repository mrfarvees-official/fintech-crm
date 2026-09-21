export interface NavItem {
  href: string;
  label: string;
  gate?: { action: string; resourceType: string };
  /** Structural tenant-ownership, checked via organizations.ownerId — never RBAC/PBAC. */
  ownerOnly?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Dashboard" },
  {
    href: "/customers",
    label: "Customers",
    gate: { action: "customer.view", resourceType: "CUSTOMER" },
  },
  {
    href: "/kyc",
    label: "KYC Cases",
    gate: { action: "kyc.view", resourceType: "KYC_CASE" },
  },
  {
    href: "/approvals",
    label: "Approvals",
    gate: { action: "approval.view", resourceType: "KYC_CASE" },
  },
  {
    href: "/audit",
    label: "Audit Log",
    gate: { action: "audit.view", resourceType: "AUDIT_LOG" },
  },
  {
    href: "/notifications",
    label: "Notifications",
    gate: { action: "notification.view", resourceType: "NOTIFICATION" },
  },
];

export const SETTINGS_NAV: NavItem[] = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/sessions", label: "Sessions" },
  {
    href: "/settings/tenant",
    label: "Tenant",
    ownerOnly: true, // was: gate: { action: "tenant.manage", resourceType: "organization" }
  },
  {
    href: "/settings/permissions",
    label: "Policies",
    ownerOnly: true,
  },
];
