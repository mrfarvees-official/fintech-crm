export const DEMO_USER_PASSWORD = "Password123!";

export const DEMO_USERS = [
  {
    key: "relationshipManager",
    name: "Nimal Perera",
    email: "rm@fintech.local",
    department: "RELATIONSHIP",
    role: "RELATIONSHIP_MANAGER",
  },
  {
    key: "kycAnalyst",
    name: "Anushka Fernando",
    email: "analyst@fintech.local",
    department: "KYC",
    role: "KYC_ANALYST",
  },
  {
    key: "complianceOfficer",
    name: "Shalini Silva",
    email: "officer@fintech.local",
    department: "COMPLIANCE",
    role: "COMPLIANCE_OFFICER",
  },
  {
    key: "complianceManager",
    name: "Dinesh Jayawardena",
    email: "manager@fintech.local",
    department: "MANAGEMENT",
    role: "COMPLIANCE_MANAGER",
  },
  {
    key: "admin",
    name: "System Administrator",
    email: "admin@fintech.local",
    department: "ADMIN",
    role: "ADMIN",
  },
] as const;
