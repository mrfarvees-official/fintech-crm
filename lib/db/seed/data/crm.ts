export const CRM_CUSTOMERS = [
  {
    key: "lowRisk",

    customerNumber: "CUS-0001",
    firstName: "Kasun",
    lastName: "Perera",

    email: "kasun.perera@example.com",
    phone: "+94771234567",

    nicPassport: "901234567V",
    dateOfBirth: "1990-05-14",

    employmentStatus: "EMPLOYED" as const,
    employer: "Lanka Technologies PLC",
    monthlyIncome: "185000.00",

    status: "VERIFIED" as const,

    kyc: {
      status: "APPROVED" as const,
      riskScore: 18,
      riskLevel: "LOW" as const,
    },
  },

  {
    key: "mediumRisk",

    customerNumber: "CUS-0002",
    firstName: "Nadeesha",
    lastName: "Fernando",

    email: "nadeesha.fernando@example.com",
    phone: "+94772345678",

    nicPassport: "947654321V",
    dateOfBirth: "1994-09-22",

    employmentStatus: "SELF_EMPLOYED" as const,
    employer: "NF Trading",
    monthlyIncome: "260000.00",

    status: "KYC_REVIEW" as const,

    kyc: {
      status: "UNDER_REVIEW" as const,
      riskScore: 45,
      riskLevel: "MEDIUM" as const,
    },
  },

  {
    key: "highRisk",

    customerNumber: "CUS-0003",
    firstName: "Mohamed",
    lastName: "Rizwan",

    email: "mohamed.rizwan@example.com",
    phone: "+94773456789",

    nicPassport: "881234567V",
    dateOfBirth: "1988-03-18",

    employmentStatus: "SELF_EMPLOYED" as const,
    employer: "Rizwan International",
    monthlyIncome: "850000.00",

    status: "KYC_REVIEW" as const,

    kyc: {
      status: "AWAITING_APPROVAL" as const,
      riskScore: 82,
      riskLevel: "HIGH" as const,
    },
  },
] as const;

export const CRM_RISK_FACTORS = {
  lowRisk: [
    {
      code: "LOW_TRANSACTION_EXPOSURE",
      description: "Low expected transaction exposure.",
      score: 18,
    },
  ],

  mediumRisk: [
    {
      code: "SOURCE_OF_FUNDS_REVIEW",
      description: "Source of funds requires additional verification.",
      score: 25,
    },
    {
      code: "SELF_EMPLOYED",
      description: "Customer is self-employed and requires additional review.",
      score: 20,
    },
  ],

  highRisk: [
    {
      code: "PEP_EXPOSURE",
      description: "Potential politically exposed person exposure.",
      score: 45,
    },
    {
      code: "SOURCE_OF_FUNDS",
      description: "Enhanced source of funds verification required.",
      score: 37,
    },
  ],
} as const;
