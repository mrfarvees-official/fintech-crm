export const NOTIFICATION_SEEDS = [
  {
    key: "mediumRiskInfoRequired",
    userKey: "relationshipManager",

    type: "KYC_INFO_REQUIRED",

    title: "Additional KYC information required",

    message:
      "Customer CUS-0002 requires additional source of funds verification.",
  },

  {
    key: "highRiskApproval",
    userKey: "complianceManager",

    type: "KYC_APPROVAL_REQUIRED",

    title: "High-risk KYC approval required",

    message: "Customer CUS-0003 is awaiting approval for a high-risk KYC case.",
  },

  {
    key: "highRiskOfficerNotice",
    userKey: "complianceOfficer",

    type: "KYC_HIGH_RISK",

    title: "High-risk KYC case escalated",

    message:
      "Customer CUS-0003 has been classified as HIGH risk and escalated.",
  },
] as const;
