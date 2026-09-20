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
] as const;
