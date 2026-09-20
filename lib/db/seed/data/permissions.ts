export const PERMISSIONS = [
  // Dashboard
  "dashboard.view",

  // Customers
  "customer.view",
  "customer.create",
  "customer.update",
  "customer.assign",
  "customer.note.create",

  // KYC
  "kyc.view",
  "kyc.create",
  "kyc.submit",
  "kyc.review",
  "kyc.request_info",

  // KYC documents
  "kyc_document.view",
  "kyc_document.create",
  "kyc_document.verify",

  // Risk
  "risk.view",
  "risk.assess",

  // Approvals
  "approval.view",
  "approval.act",

  // Audit
  "audit.view",

  // Notifications
  "notification.view",

  // Settings
  "settings.view",
  "settings.update",

  // Users
  "user.view",
  "user.manage",

  // RBAC / PBAC
  "authorization.view",
  "authorization.manage",
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number];
