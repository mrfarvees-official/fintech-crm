import { ROLE_CODES } from "./roles";
import type { PermissionCode } from "./permissions";

export const ROLE_PERMISSION_MAP: Record<string, PermissionCode[]> = {
  [ROLE_CODES.RELATIONSHIP_MANAGER]: [
    "dashboard.view",

    "customer.view",
    "customer.create",
    "customer.update",
    "customer.assign",
    "customer.note.create",

    "kyc.view",
    "kyc.create",
    "kyc.submit",

    "kyc_document.view",
    "kyc_document.create",

    "risk.view",

    "approval.view",

    "notification.view",
  ],

  [ROLE_CODES.KYC_ANALYST]: [
    "dashboard.view",

    "customer.view",
    "customer.note.create",

    "kyc.view",
    "kyc.review",
    "kyc.request_info",

    "kyc_document.view",
    "kyc_document.verify",

    "risk.view",
    "risk.assess",

    "approval.view",

    "notification.view",
  ],

  [ROLE_CODES.COMPLIANCE_OFFICER]: [
    "dashboard.view",

    "customer.view",

    "kyc.view",
    "kyc.review",

    "kyc_document.view",

    "risk.view",

    "approval.view",
    "approval.act",

    "audit.view",

    "notification.view",
  ],

  [ROLE_CODES.COMPLIANCE_MANAGER]: [
    "dashboard.view",

    "customer.view",

    "kyc.view",
    "kyc.review",

    "kyc_document.view",

    "risk.view",
    "risk.assess",

    "approval.view",
    "approval.act",

    "audit.view",

    "notification.view",

    "authorization.view",
  ],

  [ROLE_CODES.ADMIN]: [
    "dashboard.view",

    "customer.view",
    "customer.create",
    "customer.update",
    "customer.assign",
    "customer.note.create",

    "kyc.view",

    "kyc_document.view",

    "risk.view",

    "approval.view",

    "audit.view",

    "notification.view",

    "settings.view",
    "settings.update",

    "user.view",
    "user.manage",

    "authorization.view",
    "authorization.manage",
  ],
};
