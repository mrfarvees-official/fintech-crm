export const DEMO_USER_PASSWORD = "1234";

export const DEMO_USERS = [
  {
    key: "relationshipManager",
    name: "Nimal Perera",
    email: "rm@fintech.local",
    department: "RELATIONSHIP",
  },
  {
    key: "relationshipManager2",
    name: "Kasun Rathnayake",
    email: "rm2@fintech.local",
    department: "RELATIONSHIP",
  },
  {
    key: "kycAnalyst",
    name: "Anushka Fernando",
    email: "analyst@fintech.local",
    department: "KYC",
  },
  {
    key: "complianceOfficer",
    name: "Shalini Silva",
    email: "officer@fintech.local",
    department: "COMPLIANCE",
  },
  {
    key: "complianceManager",
    name: "Dinesh Jayawardena",
    email: "manager@fintech.local",
    department: "MANAGEMENT",
  },
  {
    key: "admin",
    name: "System Administrator",
    email: "admin@fintech.local",
    department: "ADMIN",
  },
  {
    key: "tenantAdmin",
    name: "Tenant Administrator",
    email: "tenantadmin@fintech.local",
    department: "TENANT_ADMIN",
  },
  {
    key: "formerEmployee",
    name: "Former Employee",
    email: "suspended@fintech.local",
    department: "RELATIONSHIP",
    status: "SUSPENDED",
  },
] as const;
