export const POLICY_SEEDS = [
  {
    key: "denySelfApproval",

    policy: {
      code: "DENY_SELF_KYC_APPROVAL",
      name: "Prevent Self KYC Approval",
      description:
        "Prevents the submitter of a KYC case from approving the same case.",
      action: "kyc.approve",
      resourceType: "KYC_CASE",
      effect: "DENY" as const,
      priority: 1000,
      isActive: true,
    },

    subjects: [],

    resources: [
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "AWAITING_APPROVAL",
      },
    ],

    conditions: [
      {
        source: "SUBJECT" as const,
        attribute: "id",
        operator: "EQUALS" as const,
        value: "$resource.submittedBy",
      },
    ],
  },

  {
    key: "denyOfficerHighRisk",

    policy: {
      code: "DENY_OFFICER_HIGH_RISK_APPROVAL",
      name: "Deny Officer High Risk Approval",
      description:
        "Prevents compliance officers from approving high-risk KYC cases.",
      action: "kyc.approve",
      resourceType: "KYC_CASE",
      effect: "DENY" as const,
      priority: 900,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "EQUALS" as const,
        value: "COMPLIANCE",
      },
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "ACTIVE",
      },
    ],

    resources: [
      {
        attribute: "riskLevel",
        operator: "EQUALS" as const,
        value: "HIGH",
      },
    ],

    conditions: [],
  },

  {
    key: "managerApproveKyc",

    policy: {
      code: "ALLOW_MANAGER_KYC_APPROVAL",
      name: "Compliance Manager KYC Approval",
      description: "Allows compliance managers to approve eligible KYC cases.",
      action: "kyc.approve",
      resourceType: "KYC_CASE",
      effect: "ALLOW" as const,
      priority: 700,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "EQUALS" as const,
        value: "MANAGEMENT",
      },
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "ACTIVE",
      },
    ],

    resources: [
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "AWAITING_APPROVAL",
      },
    ],

    conditions: [
      {
        source: "SUBJECT" as const,
        attribute: "organizationId",
        operator: "EQUALS" as const,
        value: "$resource.organizationId",
      },
    ],
  },

  {
    key: "officerApproveKyc",

    policy: {
      code: "ALLOW_OFFICER_KYC_APPROVAL",
      name: "Compliance Officer KYC Approval",
      description: "Allows compliance officers to approve eligible KYC cases.",
      action: "kyc.approve",
      resourceType: "KYC_CASE",
      effect: "ALLOW" as const,
      priority: 600,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "EQUALS" as const,
        value: "COMPLIANCE",
      },
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "ACTIVE",
      },
    ],

    resources: [
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "AWAITING_APPROVAL",
      },
    ],

    conditions: [
      {
        source: "SUBJECT" as const,
        attribute: "organizationId",
        operator: "EQUALS" as const,
        value: "$resource.organizationId",
      },
    ],
  },

  {
    key: "analystReviewKyc",

    policy: {
      code: "ALLOW_ANALYST_KYC_REVIEW",
      name: "KYC Analyst Review",
      description: "Allows KYC analysts to review customer KYC cases.",
      action: "kyc.review",
      resourceType: "KYC_CASE",
      effect: "ALLOW" as const,
      priority: 500,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "EQUALS" as const,
        value: "KYC",
      },
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "ACTIVE",
      },
    ],

    resources: [],

    conditions: [
      {
        source: "SUBJECT" as const,
        attribute: "organizationId",
        operator: "EQUALS" as const,
        value: "$resource.organizationId",
      },
    ],
  },

  {
    key: "relationshipManagerUpdate",

    policy: {
      code: "ALLOW_RM_ASSIGNED_CUSTOMER_UPDATE",
      name: "Relationship Manager Assigned Customer Update",
      description:
        "Allows relationship managers to update customers assigned to them.",
      action: "customer.update",
      resourceType: "CUSTOMER",
      effect: "ALLOW" as const,
      priority: 400,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "EQUALS" as const,
        value: "RELATIONSHIP",
      },
      {
        attribute: "status",
        operator: "EQUALS" as const,
        value: "ACTIVE",
      },
    ],

    resources: [],

    conditions: [
      {
        source: "SUBJECT" as const,
        attribute: "id",
        operator: "EQUALS" as const,
        value: "$resource.assignedUserId",
      },
      {
        source: "SUBJECT" as const,
        attribute: "organizationId",
        operator: "EQUALS" as const,
        value: "$resource.organizationId",
      },
    ],
  },
  // --- Login policy ---------------------------------------------------
  // action "auth.login" / resourceType "SESSION" is evaluated in
  // features/auth/actions.ts BEFORE a session exists — there is no
  // getCurrentUser()/getUserPermissions() yet, so the subject bag is built
  // straight from the row just fetched by email, and the login attempt's
  // own request context (time, presented device header) is passed in as
  // CONTEXT. Same evaluatePolicySet()/canWithReason() engine as every
  // other policy in this file — nothing login-specific about the engine,
  // only about what gets passed in.
  //
  // Baseline ALLOW is required: without one, once these DENY policies
  // exist for auth.login/SESSION, any login attempt that doesn't match a
  // DENY falls through to NOT_APPLICABLE -> dead RBAC -> false, which
  // would lock everyone out, not just the people these rules target.
  {
    key: "allowLoginBaseline",

    policy: {
      code: "ALLOW_LOGIN_BASELINE",
      name: "Allow Login (baseline)",
      description:
        "Baseline allow for auth.login so the DENY login-policy rules below have something to override, rather than everyone falling through to the dead RBAC fallback.",
      action: "auth.login",
      resourceType: "SESSION",
      effect: "ALLOW" as const,
      priority: 100,
      isActive: true,
    },

    subjects: [],
    resources: [],
    conditions: [],
  },

  {
    key: "denyStaffLoginBeforeHours",

    policy: {
      code: "DENY_STAFF_LOGIN_BEFORE_HOURS",
      name: "Deny Staff Login Before 8 AM",
      description:
        "Staff (everyone except TENANT_ADMIN) may not sign in before 08:00, org local time.",
      action: "auth.login",
      resourceType: "SESSION",
      effect: "DENY" as const,
      priority: 900,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "NOT_EQUALS" as const,
        value: "TENANT_ADMIN",
      },
    ],

    resources: [],

    conditions: [
      {
        source: "CONTEXT" as const,
        attribute: "hour",
        operator: "LESS_THAN" as const,
        value: "8",
      },
    ],
  },

  {
    key: "denyStaffLoginAfterHours",

    policy: {
      code: "DENY_STAFF_LOGIN_AFTER_HOURS",
      name: "Deny Staff Login After 8 PM",
      description:
        "Staff (everyone except TENANT_ADMIN) may not sign in at or after 20:00, org local time.",
      action: "auth.login",
      resourceType: "SESSION",
      effect: "DENY" as const,
      priority: 900,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "NOT_EQUALS" as const,
        value: "TENANT_ADMIN",
      },
    ],

    resources: [],

    conditions: [
      {
        source: "CONTEXT" as const,
        attribute: "hour",
        operator: "GREATER_THAN_OR_EQUAL" as const,
        value: "20",
      },
    ],
  },

  {
    key: "denyStaffLoginSunday",

    policy: {
      code: "DENY_STAFF_LOGIN_SUNDAY",
      name: "Deny Staff Login on Sunday",
      description:
        "Staff (everyone except TENANT_ADMIN) may only sign in Monday–Saturday, org local time.",
      action: "auth.login",
      resourceType: "SESSION",
      effect: "DENY" as const,
      priority: 900,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "NOT_EQUALS" as const,
        value: "TENANT_ADMIN",
      },
    ],

    resources: [],

    conditions: [
      {
        source: "CONTEXT" as const,
        attribute: "dayOfWeek",
        operator: "EQUALS" as const,
        value: "0",
      },
    ],
  },

  {
    key: "denyTenantAdminUnregisteredDevice",

    policy: {
      code: "DENY_TENANT_ADMIN_UNREGISTERED_DEVICE",
      name: "Deny Tenant Admin Login From Unregistered Device",
      description:
        "TENANT_ADMIN may only sign in from the device MAC registered in organization settings, once one is configured.",
      action: "auth.login",
      resourceType: "SESSION",
      effect: "DENY" as const,
      priority: 900,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "EQUALS" as const,
        value: "TENANT_ADMIN",
      },
    ],

    // EXISTS here is deliberate: if the org hasn't configured
    // organizationSettings.tenantAdminAllowedMac yet, this whole policy
    // should not match at all (fail-open on missing configuration), not
    // fail-closed and lock the tenant admin out before anyone's set a
    // device. Once a MAC is configured, the CONTEXT condition below
    // starts actually comparing it.
    resources: [
      {
        attribute: "allowedMac",
        operator: "EXISTS" as const,
        value: "", // ignored by EXISTS — see compare() in lib/auth/pbac.ts. Using "" instead of null works around a dedup-query gap in pbac.seed.ts (eq() vs isNull()) rather than touching that shared seed infra for one policy.
      },
    ],

    conditions: [
      {
        source: "CONTEXT" as const,
        attribute: "deviceMac",
        operator: "NOT_EQUALS" as const,
        value: "$resource.allowedMac",
      },
    ],
  },
  {
    key: "denyTenantAdminUnknownIp",

    policy: {
      code: "DENY_TENANT_ADMIN_UNKNOWN_IP",
      name: "Deny Tenant Admin Login From Unknown IP",
      description:
        "TENANT_ADMIN may only sign in from the IP address registered in organization settings, once one is configured. The practical, actually-verifiable alternative to the MAC-based policy above (which needs network infrastructure this deployment may not have) — see lib/auth/login-policy.ts.",
      action: "auth.login",
      resourceType: "SESSION",
      effect: "DENY" as const,
      priority: 900,
      isActive: true,
    },

    subjects: [
      {
        attribute: "department",
        operator: "EQUALS" as const,
        value: "TENANT_ADMIN",
      },
    ],

    resources: [
      {
        attribute: "allowedIp",
        operator: "EXISTS" as const,
        value: "",
      },
    ],

    conditions: [
      {
        source: "CONTEXT" as const,
        attribute: "ip",
        operator: "NOT_EQUALS" as const,
        value: "$resource.allowedIp",
      },
    ],
  },
] as const;
