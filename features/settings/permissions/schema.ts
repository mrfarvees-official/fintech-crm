import * as z from "zod";

export const OPERATORS = [
  "EQUALS",
  "NOT_EQUALS",
  "IN",
  "NOT_IN",
  "CONTAINS",
  "NOT_CONTAINS",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "EXISTS",
  "NOT_EXISTS",
] as const; // keep in sync with lib/db/schema/pbac.ts -> policyOperatorEnum

export const CONDITION_SOURCES = ["SUBJECT", "RESOURCE", "CONTEXT"] as const;
export const EFFECTS = ["ALLOW", "DENY"] as const;

const RuleSchema = z.object({
  attribute: z.string().trim().min(1, { error: "Attribute is required." }),
  operator: z.enum(OPERATORS),
  value: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
});

const ConditionSchema = RuleSchema.extend({
  source: z.enum(CONDITION_SOURCES),
});

export const PolicySchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  code: z
    .string()
    .trim()
    .min(1, { error: "Code is required." })
    .regex(/^[A-Z0-9_]+$/, {
      error: "Use UPPER_SNAKE_CASE, e.g. ALLOW_OWNER_TENANT_MANAGE.",
    }),
  description: z.string().trim().max(255).nullable().optional(),
  action: z
    .string()
    .trim()
    .min(1, { error: "Action is required, e.g. tenant.manage." }),
  resourceType: z
    .string()
    .trim()
    .min(1, { error: "Resource type is required, e.g. organization." }),
  effect: z.enum(EFFECTS),
  priority: z.coerce.number().int().min(0).max(100000),
  isActive: z.boolean(),
  subjects: z.array(RuleSchema).default([]),
  resources: z.array(RuleSchema).default([]),
  conditions: z.array(ConditionSchema).default([]),
});

export type PolicyInput = z.infer<typeof PolicySchema>;
export type PolicyFormState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;
