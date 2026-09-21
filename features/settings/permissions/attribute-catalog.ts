export type ValueKind = "text" | "enum" | "user";

export type AttributeOption = {
  key: string; // raw attribute name evaluated by lib/auth/pbac.ts — unchanged wire format
  label: string;
  valueKind: ValueKind;
  enumOptions?: { value: string; label: string }[];
  isNumeric?: boolean; // true for numeric FK-style fields (ids)
};

const DEPARTMENT_OPTIONS = [
  { value: "RELATIONSHIP", label: "Relationship" },
  { value: "KYC", label: "KYC" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "ADMIN", label: "Admin" },
];

const USER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "INACTIVE", label: "Inactive" },
];

const KYC_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "INFO_REQUIRED", label: "Info required" },
  { value: "AWAITING_APPROVAL", label: "Awaiting approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const RISK_LEVEL_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const CUSTOMER_STATUS_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Active" },
  { value: "KYC_PENDING", label: "KYC pending" },
  { value: "KYC_REVIEW", label: "KYC review" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const SUBJECT_ATTRIBUTES: AttributeOption[] = [
  { key: "id", label: "User ID", valueKind: "user", isNumeric: true },
  { key: "email", label: "Email", valueKind: "user" },
  {
    key: "department",
    label: "Department",
    valueKind: "enum",
    enumOptions: DEPARTMENT_OPTIONS,
  },
  {
    key: "status",
    label: "Account status",
    valueKind: "enum",
    enumOptions: USER_STATUS_OPTIONS,
  },
  {
    key: "organizationId",
    label: "Organization ID",
    valueKind: "text",
    isNumeric: true,
  },
];

export const RESOURCE_ATTRIBUTES: Record<string, AttributeOption[]> = {
  KYC_CASE: [
    {
      key: "status",
      label: "Case status",
      valueKind: "enum",
      enumOptions: KYC_STATUS_OPTIONS,
    },
    {
      key: "riskLevel",
      label: "Risk level",
      valueKind: "enum",
      enumOptions: RISK_LEVEL_OPTIONS,
    },
    {
      key: "submittedBy",
      label: "Submitted by (user)",
      valueKind: "user",
      isNumeric: true,
    },
    {
      key: "organizationId",
      label: "Organization ID",
      valueKind: "text",
      isNumeric: true,
    },
  ],
  CUSTOMER: [
    {
      key: "status",
      label: "Customer status",
      valueKind: "enum",
      enumOptions: CUSTOMER_STATUS_OPTIONS,
    },
    {
      key: "assignedUserId",
      label: "Assigned relationship manager",
      valueKind: "user",
      isNumeric: true,
    },
    {
      key: "organizationId",
      label: "Organization ID",
      valueKind: "text",
      isNumeric: true,
    },
  ],
  organization: [
    {
      key: "ownerId",
      label: "Tenant owner (user)",
      valueKind: "user",
      isNumeric: true,
    },
  ],
};

export const RESOURCE_TYPE_OPTIONS = Object.keys(RESOURCE_ATTRIBUTES);
export const CONTEXT_ATTRIBUTES: AttributeOption[] = [];

export function attributesFor(
  source: "SUBJECT" | "RESOURCE" | "CONTEXT",
  resourceType: string,
): AttributeOption[] {
  if (source === "SUBJECT") return SUBJECT_ATTRIBUTES;
  if (source === "CONTEXT") return CONTEXT_ATTRIBUTES;
  return RESOURCE_ATTRIBUTES[resourceType] ?? [];
}

export const CUSTOM_ATTRIBUTE_KEY = "__custom__";
