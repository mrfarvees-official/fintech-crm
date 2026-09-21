import * as z from "zod";

export const EMPLOYMENT_STATUSES = [
  "EMPLOYED",
  "SELF_EMPLOYED",
  "UNEMPLOYED",
  "STUDENT",
  "RETIRED",
  "OTHER",
] as const;
export const CUSTOMER_STATUSES = [
  "LEAD",
  "ACTIVE",
  "KYC_PENDING",
  "KYC_REVIEW",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
] as const;

export const CustomerSchema = z.object({
  customerNumber: z
    .string()
    .trim()
    .min(1, { error: "Customer number is required." }),
  firstName: z.string().trim().min(1, { error: "First name is required." }),
  lastName: z.string().trim().min(1, { error: "Last name is required." }),
  email: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
  phone: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
  nicPassport: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
  dateOfBirth: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).nullable().optional(),
  employer: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
  monthlyIncome: z.coerce.number().nonnegative().nullable().optional(),
  assignedUserId: z.coerce.number().int().positive().nullable().optional(),
  status: z.enum(CUSTOMER_STATUSES),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
export type CustomerFormState =
  | { errors?: Record<string, string[]>; message?: string; denied?: boolean }
  | undefined;
