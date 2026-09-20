export const AUDIT_LOG_SEEDS = [
  {
    key: "customerCreated",
    actorKey: "relationshipManager",
    customerKey: "lowRisk",

    action: "customer.create",
    resourceType: "CUSTOMER",

    oldValues: null,

    newValues: {
      status: "VERIFIED",
      customerNumber: "CUS-0001",
    },

    ipAddress: "127.0.0.1",
    userAgent: "Fintech CRM Demo Seeder",
  },

  {
    key: "mediumKycReview",
    actorKey: "kycAnalyst",
    customerKey: "mediumRisk",

    action: "kyc.review",
    resourceType: "KYC_CASE",

    oldValues: {
      status: "SUBMITTED",
    },

    newValues: {
      status: "UNDER_REVIEW",
      decision: "INFO_REQUIRED",
    },

    ipAddress: "127.0.0.1",
    userAgent: "Fintech CRM Demo Seeder",
  },

  {
    key: "highRiskEscalation",
    actorKey: "kycAnalyst",
    customerKey: "highRisk",

    action: "kyc.escalate",
    resourceType: "KYC_CASE",

    oldValues: {
      status: "UNDER_REVIEW",
    },

    newValues: {
      status: "AWAITING_APPROVAL",
      riskLevel: "HIGH",
    },

    ipAddress: "127.0.0.1",
    userAgent: "Fintech CRM Demo Seeder",
  },
] as const;
