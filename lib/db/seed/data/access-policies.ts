type Department =
  | "RELATIONSHIP"
  | "KYC"
  | "COMPLIANCE"
  | "MANAGEMENT"
  | "ADMIN";

function allow(
  key: string,
  code: string,
  action: string,
  resourceType: string,
  departments: Department[],
  priority = 100,
) {
  return {
    key,
    policy: {
      code,
      name: `${action} — ${departments.join(", ")}`,
      description: `Section-level grant: ${action} on ${resourceType}.`,
      action,
      resourceType,
      effect: "ALLOW" as const,
      priority,
      isActive: true,
    },
    subjects: [
      {
        attribute: "department",
        operator: "IN" as const,
        value: departments.join(","),
      },
      { attribute: "status", operator: "EQUALS" as const, value: "ACTIVE" },
    ],
    resources: [] as { attribute: string; operator: "EQUALS"; value: string }[],
    conditions: [] as {
      source: "SUBJECT" | "RESOURCE" | "CONTEXT";
      attribute: string;
      operator: "EQUALS";
      value: string;
    }[],
  };
}

const ALL: Department[] = [
  "RELATIONSHIP",
  "KYC",
  "COMPLIANCE",
  "MANAGEMENT",
  "ADMIN",
];

export const ACCESS_POLICY_SEEDS = [
  allow(
    "dashboardView",
    "ALLOW_ALL_DASHBOARD_VIEW",
    "dashboard.view",
    "DASHBOARD",
    ALL,
  ),

  allow(
    "customerView",
    "ALLOW_ALL_CUSTOMER_VIEW",
    "customer.view",
    "CUSTOMER",
    ALL,
  ),
  allow(
    "customerCreate",
    "ALLOW_RM_ADMIN_CUSTOMER_CREATE",
    "customer.create",
    "CUSTOMER",
    ["RELATIONSHIP", "ADMIN"],
  ),
  // customer.update for RELATIONSHIP is intentionally NOT here — it's covered by the
  // existing ownership-scoped ALLOW_RM_ASSIGNED_CUSTOMER_UPDATE in policies.ts.
  allow(
    "customerUpdateAdmin",
    "ALLOW_ADMIN_CUSTOMER_UPDATE",
    "customer.update",
    "CUSTOMER",
    ["ADMIN"],
  ),
  allow(
    "customerAssign",
    "ALLOW_RM_ADMIN_CUSTOMER_ASSIGN",
    "customer.assign",
    "CUSTOMER",
    ["RELATIONSHIP", "ADMIN"],
  ),
  allow(
    "customerNote",
    "ALLOW_RM_KYC_ADMIN_CUSTOMER_NOTE",
    "customer.note.create",
    "CUSTOMER",
    ["RELATIONSHIP", "KYC", "ADMIN"],
  ),

  allow("kycView", "ALLOW_ALL_KYC_VIEW", "kyc.view", "KYC_CASE", ALL),
  allow("kycCreate", "ALLOW_RM_KYC_CREATE", "kyc.create", "KYC_CASE", [
    "RELATIONSHIP",
  ]),
  allow("kycSubmit", "ALLOW_RM_KYC_SUBMIT", "kyc.submit", "KYC_CASE", [
    "RELATIONSHIP",
  ]),
  // kyc.review for KYC dept already exists as ALLOW_ANALYST_KYC_REVIEW — this adds the other two.
  allow(
    "kycReviewCompliance",
    "ALLOW_COMPLIANCE_MGMT_KYC_REVIEW",
    "kyc.review",
    "KYC_CASE",
    ["COMPLIANCE", "MANAGEMENT"],
  ),
  allow(
    "kycRequestInfo",
    "ALLOW_KYC_REQUEST_INFO",
    "kyc.request_info",
    "KYC_CASE",
    ["KYC"],
  ),

  allow(
    "kycDocView",
    "ALLOW_ALL_KYC_DOC_VIEW",
    "kyc_document.view",
    "KYC_DOCUMENT",
    ALL,
  ),
  allow(
    "kycDocCreate",
    "ALLOW_RM_KYC_DOC_CREATE",
    "kyc_document.create",
    "KYC_DOCUMENT",
    ["RELATIONSHIP"],
  ),
  allow(
    "kycDocVerify",
    "ALLOW_KYC_DOC_VERIFY",
    "kyc_document.verify",
    "KYC_DOCUMENT",
    ["KYC"],
  ),

  allow("riskView", "ALLOW_ALL_RISK_VIEW", "risk.view", "RISK_ASSESSMENT", ALL),
  allow(
    "riskAssess",
    "ALLOW_KYC_MGMT_RISK_ASSESS",
    "risk.assess",
    "RISK_ASSESSMENT",
    ["KYC", "MANAGEMENT"],
  ),

  allow(
    "approvalView",
    "ALLOW_ALL_APPROVAL_VIEW",
    "approval.view",
    "KYC_CASE",
    ALL,
  ),
  allow(
    "approvalAct",
    "ALLOW_COMPLIANCE_MGMT_APPROVAL_ACT",
    "approval.act",
    "KYC_CASE",
    ["COMPLIANCE", "MANAGEMENT"],
  ),

  allow(
    "auditView",
    "ALLOW_COMPLIANCE_MGMT_ADMIN_AUDIT_VIEW",
    "audit.view",
    "AUDIT_LOG",
    ["COMPLIANCE", "MANAGEMENT", "ADMIN"],
  ),
  allow(
    "notificationView",
    "ALLOW_ALL_NOTIFICATION_VIEW",
    "notification.view",
    "NOTIFICATION",
    ALL,
  ),

  allow(
    "settingsView",
    "ALLOW_ADMIN_SETTINGS_VIEW",
    "settings.view",
    "SETTINGS",
    ["ADMIN"],
  ),
  allow(
    "settingsUpdate",
    "ALLOW_ADMIN_SETTINGS_UPDATE",
    "settings.update",
    "SETTINGS",
    ["ADMIN"],
  ),
  allow("userView", "ALLOW_ADMIN_USER_VIEW", "user.view", "USER", ["ADMIN"]),
  allow("userManage", "ALLOW_ADMIN_USER_MANAGE", "user.manage", "USER", [
    "ADMIN",
  ]),
  allow(
    "authorizationView",
    "ALLOW_MGMT_ADMIN_AUTHORIZATION_VIEW",
    "authorization.view",
    "policy",
    ["MANAGEMENT", "ADMIN"],
  ),
  allow(
    "customerNoteDelete",
    "ALLOW_ADMIN_CUSTOMER_NOTE_DELETE",
    "customer_note.delete",
    "CUSTOMER_NOTE",
    ["ADMIN"],
  ),

  allow(
    "customerDelete",
    "ALLOW_ADMIN_CUSTOMER_DELETE",
    "customer.delete",
    "CUSTOMER",
    ["ADMIN"],
  ),

  allow("kycDelete", "ALLOW_ADMIN_KYC_DELETE", "kyc.delete", "KYC_CASE", [
    "ADMIN",
  ]),

  allow(
    "kycDocDelete",
    "ALLOW_RM_ADMIN_KYC_DOC_DELETE",
    "kyc_document.delete",
    "KYC_DOCUMENT",
    ["RELATIONSHIP", "ADMIN"],
  ),

  allow(
    "notificationDelete",
    "ALLOW_ALL_NOTIFICATION_DELETE",
    "notification.delete",
    "NOTIFICATION",
    ALL,
  ),
] as const;
