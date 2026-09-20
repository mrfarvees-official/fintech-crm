export const KYC_DOCUMENT_SEEDS = [
  {
    customerKey: "lowRisk",
    documentType: "NIC" as const,
    documentNumber: "901234567V",
    fileUrl: "/demo/kyc/cus-0001-nic.pdf",
    status: "VERIFIED" as const,
  },
  {
    customerKey: "mediumRisk",
    documentType: "NIC" as const,
    documentNumber: "947654321V",
    fileUrl: "/demo/kyc/cus-0002-nic.pdf",
    status: "VERIFIED" as const,
  },
  {
    customerKey: "mediumRisk",
    documentType: "BANK_STATEMENT" as const,
    documentNumber: null,
    fileUrl: "/demo/kyc/cus-0002-bank-statement.pdf",
    status: "PENDING" as const,
  },
  {
    customerKey: "highRisk",
    documentType: "PASSPORT" as const,
    documentNumber: "N8812345",
    fileUrl: "/demo/kyc/cus-0003-passport.pdf",
    status: "VERIFIED" as const,
  },
  {
    customerKey: "highRisk",
    documentType: "INCOME_PROOF" as const,
    documentNumber: null,
    fileUrl: "/demo/kyc/cus-0003-income-proof.pdf",
    status: "PENDING" as const,
  },
] as const;

export const KYC_REVIEW_SEEDS = [
  {
    customerKey: "lowRisk",
    decision: "APPROVED" as const,
    notes: "KYC documents verified and risk level accepted.",
  },
  {
    customerKey: "mediumRisk",
    decision: "INFO_REQUIRED" as const,
    notes: "Additional source of funds verification requested.",
  },
  {
    customerKey: "highRisk",
    decision: "APPROVED" as const,
    notes:
      "Analyst review completed. Case escalated for final compliance approval.",
  },
] as const;