import * as z from "zod";

export const KYC_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "INFO_REQUIRED",
  "AWAITING_APPROVAL",
  "APPROVED",
  "REJECTED",
] as const;

export const CreateKycCaseSchema = z.object({
  customerId: z.coerce.number().int().positive({ error: "Select a customer." }),
});

export const RequestInfoSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, { error: "Explain what information is needed." }),
});

export type FormState =
  | { errors?: Record<string, string[]>; message?: string; denied?: boolean }
  | undefined;
