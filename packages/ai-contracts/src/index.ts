import { z } from "zod";

export const aiPlanSchemaVersion = "1.0" as const;

export const AiRiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type AiRiskLevel = z.infer<typeof AiRiskLevelSchema>;

export const AiOperationRiskClassSchema = z.enum(["L0_READ_ONLY", "L1_DRAFT", "L2_BUSINESS_MUTATION", "L3_EXTERNAL_SIDE_EFFECT"]);
export type AiOperationRiskClass = z.infer<typeof AiOperationRiskClassSchema>;

export const ReadOnlyOperationTypeSchema = z.enum([
  "search_customer",
  "search_product",
  "check_stock",
  "check_price",
  "show_balance",
  "show_order_status",
  "navigate",
  "summarize_customer",
  "summarize_order",
]);

export const LowRiskOperationTypeSchema = z.enum([
  "create_note",
  "create_task",
  "draft_message",
  "draft_quote",
]);

export const ApprovalRequiredOperationTypeSchema = z.enum([
  "quick_sale",
  "create_order",
  "confirm_order",
  "create_tahsilat",
  "complete_delivery",
  "create_return",
  "create_invoice",
  "approve_whatsapp_order",
  "update_factory_status",
  "update_supply_status",
  "send_whatsapp_message",
  "send_document",
]);

export const ForbiddenOperationTypeSchema = z.enum([
  "change_user_role",
  "change_permission",
  "delete_audit_event",
  "change_tenant_settings",
  "change_secret",
  "delete_customer",
  "delete_order",
  "force_payment_confirm",
  "bypass_approval",
  "send_erp_without_outbox",
]);

export const AllowedOperationTypeSchema = z.union([
  ReadOnlyOperationTypeSchema,
  LowRiskOperationTypeSchema,
  ApprovalRequiredOperationTypeSchema,
]);
export type AllowedOperationType = z.infer<typeof AllowedOperationTypeSchema>;

export type ForbiddenOperationType = z.infer<typeof ForbiddenOperationTypeSchema>;

export const EntityMatchSchema = z.discriminatedUnion("matchType", [
  z.object({
    matchType: z.literal("exact_id"),
    id: z.string().min(1),
  }),
  z.object({
    matchType: z.literal("exact_sku"),
    sku: z.string().min(1),
  }),
  z.object({
    matchType: z.literal("exact_phone"),
    normalizedPhone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  }),
]);
export type EntityMatch = z.infer<typeof EntityMatchSchema>;

export const MoneyAmountSchema = z.object({
  amount: z.number().finite().nonnegative(),
  currency: z.string().min(3).max(3).default("TRY"),
});
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;

export const AiOperationLineSchema = z.object({
  product: EntityMatchSchema,
  qty: z.number().finite().positive(),
  unit: z.string().min(1).optional(),
});
export type AiOperationLine = z.infer<typeof AiOperationLineSchema>;

export const BaseAiOperationSchema = z.object({
  type: AllowedOperationTypeSchema,
  riskClass: AiOperationRiskClassSchema,
  idempotencyKey: z.string().min(12).max(200),
  summary: z.string().min(1).max(500),
  requiresApproval: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string().min(1).max(300)).default([]),
  target: EntityMatchSchema.optional(),
  payload: z.record(z.unknown()).default({}),
});

export const AiReadOnlyOperationSchema = BaseAiOperationSchema.extend({
  type: ReadOnlyOperationTypeSchema,
  riskClass: z.literal("L0_READ_ONLY"),
  requiresApproval: z.literal(false),
});

export const AiLowRiskOperationSchema = BaseAiOperationSchema.extend({
  type: LowRiskOperationTypeSchema,
  riskClass: z.literal("L1_DRAFT"),
});

export const AiApprovalRequiredOperationSchema = BaseAiOperationSchema.extend({
  type: ApprovalRequiredOperationTypeSchema,
  riskClass: z.union([z.literal("L2_BUSINESS_MUTATION"), z.literal("L3_EXTERNAL_SIDE_EFFECT")]),
  requiresApproval: z.literal(true),
});

export const AiOperationSchema = z.union([
  AiReadOnlyOperationSchema,
  AiLowRiskOperationSchema,
  AiApprovalRequiredOperationSchema,
]);
export type AiOperation = z.infer<typeof AiOperationSchema>;

export const AiOperationPlanSchema = z.object({
  schemaVersion: z.literal(aiPlanSchemaVersion),
  language: z.literal("tr-TR"),
  reply: z.string().min(1).max(2000),
  confidence: z.number().min(0).max(1),
  riskLevel: AiRiskLevelSchema,
  requiresApproval: z.boolean(),
  operations: z.array(AiOperationSchema).max(20),
  needsClarification: z.boolean().default(false),
  clarificationQuestion: z.string().max(500).nullable().default(null),
}).superRefine((plan, ctx) => {
  const hasApprovalRequiredOperation = plan.operations.some((operation) => operation.requiresApproval);

  if (hasApprovalRequiredOperation && !plan.requiresApproval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Plan requiresApproval must be true when any operation requires approval.",
      path: ["requiresApproval"],
    });
  }

  if (plan.needsClarification && !plan.clarificationQuestion) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "clarificationQuestion is required when needsClarification is true.",
      path: ["clarificationQuestion"],
    });
  }
});
export type AiOperationPlan = z.infer<typeof AiOperationPlanSchema>;

export const ForbiddenAiOperationSchema = z.object({
  type: ForbiddenOperationTypeSchema,
});

export function parseAiOperationPlan(input: unknown): AiOperationPlan {
  return AiOperationPlanSchema.parse(input);
}

export function safeParseAiOperationPlan(input: unknown): z.SafeParseReturnType<unknown, AiOperationPlan> {
  return AiOperationPlanSchema.safeParse(input);
}

export function isForbiddenOperationType(operationType: string): operationType is ForbiddenOperationType {
  return ForbiddenOperationTypeSchema.safeParse(operationType).success;
}

export function isAllowedOperationType(operationType: string): operationType is AllowedOperationType {
  return AllowedOperationTypeSchema.safeParse(operationType).success;
}

export * from "./sales-assistant";
