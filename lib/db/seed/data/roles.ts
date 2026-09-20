export const ROLE_CODES = {
  RELATIONSHIP_MANAGER: "RELATIONSHIP_MANAGER",
  KYC_ANALYST: "KYC_ANALYST",
  COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER",
  COMPLIANCE_MANAGER: "COMPLIANCE_MANAGER",
  ADMIN: "ADMIN",
} as const;

export const ROLE_SEEDS = [
  {
    code: ROLE_CODES.RELATIONSHIP_MANAGER,
    name: "Relationship Manager",
    description:
      "Manages customer relationships, customer profiles and KYC submissions.",
  },
  {
    code: ROLE_CODES.KYC_ANALYST,
    name: "KYC Analyst",
    description:
      "Reviews customer KYC information, documents and risk assessments.",
  },
  {
    code: ROLE_CODES.COMPLIANCE_OFFICER,
    name: "Compliance Officer",
    description:
      "Reviews compliance cases and performs permitted approval actions.",
  },
  {
    code: ROLE_CODES.COMPLIANCE_MANAGER,
    name: "Compliance Manager",
    description:
      "Handles senior compliance reviews and high-risk approval decisions.",
  },
  {
    code: ROLE_CODES.ADMIN,
    name: "Administrator",
    description: "Manages users, configuration and administrative operations.",
  },
] as const;
