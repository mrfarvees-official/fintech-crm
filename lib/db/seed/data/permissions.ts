export const PERMISSIONS = [
  // Dashboard
  "dashboard.view",

  // Customers
  "customer.view",
  "customer.create",
  "customer.update",
  "customer.assign",
  "customer.note.create",
  "customer.delete", // already added
  "customer_note.delete", // new

  // KYC
  "kyc.view",
  "kyc.create",
  "kyc.submit",
  "kyc.review",
  "kyc.request_info",
  "kyc.delete", // new

  // KYC documents
  "kyc_document.view",
  "kyc_document.create",
  "kyc_document.verify",
  "kyc_document.delete", // new

  // Risk
  "risk.view",
  "risk.assess",
  // intentionally no risk.delete — see reasoning above

  // Approvals
  "approval.view",
  "approval.act",
  // intentionally no approval.delete

  // Audit
  "audit.view",
  // intentionally no audit.delete

  // Notifications
  "notification.view",
  "notification.delete", // new — enforce by ownership, not department, when built

  // Settings
  "settings.view",
  "settings.update",

  // Users
  "user.view",
  "user.manage",
  // intentionally no user.delete — use status instead

  // RBAC / PBAC
  "authorization.view",
  "authorization.manage",

  // Tenant
  "tenant.view",
  "tenant.manage",
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number];
