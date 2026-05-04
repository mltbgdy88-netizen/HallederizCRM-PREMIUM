import type {
  WhatsAppApprovalPolicyMode,
  WhatsAppApproverRole,
  WhatsAppBusinessIntent,
  WhatsAppIntentRulesConfig,
  WhatsAppRuleMode,
  WhatsAppRuleResolution,
  WhatsAppRuleTemplateKey
} from "@hallederiz/types";
import {
  createDefaultWhatsappIntentRules,
  findIntentRule,
  runtimeBooleansFromIntentRule,
  type WhatsAppIntentRule
} from "@hallederiz/types";

export interface WhatsAppRuleResolverSettings {
  mode?: WhatsAppRuleMode;
  approvalPolicyMode?: WhatsAppApprovalPolicyMode;
  salesApprovalPhone?: string;
  accountingApprovalPhone?: string;
}

interface RuntimeRule {
  requiresRegisteredPhone: boolean;
  requiresLinkedCustomer: boolean;
  canAutoReply: boolean;
  requiresCustomerConfirmation: boolean;
  requiresInternalApproval: boolean;
  requiresSalesApproval: boolean;
  requiresAccountingApproval: boolean;
  requiresCrmApproval: boolean;
  templateKey: WhatsAppRuleTemplateKey;
}

const defaultIntentRulesConfig: WhatsAppIntentRulesConfig = {
  intents: createDefaultWhatsappIntentRules()
};

const templateKeyByIntent: Record<WhatsAppBusinessIntent, WhatsAppRuleTemplateKey> = {
  stok: "stock",
  fiyat: "price",
  ekstre: "statement",
  siparis: "order",
  odeme: "payment",
  iade: "return",
  fatura: "invoice",
  hatali_urun: "defect",
  diger: "generic"
};

function intentRuleToRuntimeRule(intent: WhatsAppBusinessIntent, row: WhatsAppIntentRule): RuntimeRule {
  const b = runtimeBooleansFromIntentRule(row);
  return {
    requiresRegisteredPhone: b.registeredPhone,
    requiresLinkedCustomer: b.linkedCustomer,
    canAutoReply: b.autoReply,
    requiresCustomerConfirmation: b.customerConfirmation,
    requiresInternalApproval: b.internalApproval,
    requiresSalesApproval: b.salesApproval,
    requiresAccountingApproval: b.accountingApproval,
    requiresCrmApproval: b.crmApproval,
    templateKey: templateKeyByIntent[intent] ?? "generic"
  };
}

function getRuntimeRuleForIntent(
  intent: WhatsAppBusinessIntent,
  platformIntentRules?: WhatsAppIntentRulesConfig | null
): RuntimeRule {
  const cfg = platformIntentRules ?? defaultIntentRulesConfig;
  const row = findIntentRule(cfg, intent) ?? findIntentRule(defaultIntentRulesConfig, "diger")!;
  return intentRuleToRuntimeRule(intent, row);
}

function normalizePhone(value?: string): string {
  return (value ?? "").replace(/\D/g, "");
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function resolvePolicyMode(rule: RuntimeRule, preferred?: WhatsAppApprovalPolicyMode): WhatsAppApprovalPolicyMode {
  if (preferred && !["none", "confirmation_required", "approval_required"].includes(preferred)) return preferred;
  if (rule.requiresCrmApproval && rule.requiresSalesApproval) return "crm_and_sales";
  if (rule.requiresSalesApproval && rule.requiresAccountingApproval) return "sales_and_accounting";
  if (rule.requiresSalesApproval) return "sales_only";
  if (rule.requiresAccountingApproval) return "accounting_only";
  return rule.requiresInternalApproval ? "internal_approval" : "none";
}

function resolveRequiredRoles(mode: WhatsAppApprovalPolicyMode, rule: RuntimeRule): WhatsAppApproverRole[] {
  if (mode === "crm_and_sales") {
    return unique([
      "crm",
      "sales",
      ...(rule.requiresAccountingApproval ? (["accounting"] as const) : [])
    ]);
  }
  if (mode === "sales_and_accounting") return ["sales", "accounting"];
  if (mode === "sales_only") return ["sales"];
  if (mode === "accounting_only") return ["accounting"];
  return unique([
    ...(rule.requiresSalesApproval ? (["sales"] as const) : []),
    ...(rule.requiresAccountingApproval ? (["accounting"] as const) : []),
    ...(rule.requiresCrmApproval ? (["crm"] as const) : [])
  ]);
}

export function resolveWhatsAppRulePolicy(input: {
  intent: WhatsAppBusinessIntent;
  mode?: WhatsAppRuleMode;
  settings?: WhatsAppRuleResolverSettings;
  /** Tenant ayarı; yoksa ürün varsayılan matrisi kullanılır. */
  platformIntentRules?: WhatsAppIntentRulesConfig | null;
}): WhatsAppRuleResolution {
  const rule = getRuntimeRuleForIntent(input.intent, input.platformIntentRules);
  const mode = input.mode ?? input.settings?.mode ?? "hybrid";
  const approvalPolicyMode = resolvePolicyMode(rule, input.settings?.approvalPolicyMode);
  const requiredRoles = resolveRequiredRoles(approvalPolicyMode, rule);
  const salesPhone = normalizePhone(input.settings?.salesApprovalPhone);
  const accountingPhone = normalizePhone(input.settings?.accountingApprovalPhone);
  const approverPhones = unique([
    ...(requiredRoles.includes("sales") && salesPhone ? [salesPhone] : []),
    ...(requiredRoles.includes("accounting") && accountingPhone ? [accountingPhone] : [])
  ]);
  const allowed = !rule.requiresRegisteredPhone && !rule.requiresLinkedCustomer && !rule.requiresInternalApproval;

  return {
    intent: input.intent,
    allowed,
    policyMode: rule.requiresInternalApproval ? "approval_required" : rule.requiresRegisteredPhone || rule.requiresLinkedCustomer ? "confirmation_required" : "none",
    requiresRegisteredPhone: rule.requiresRegisteredPhone,
    requiresCustomerLink: rule.requiresLinkedCustomer,
    reason: rule.requiresInternalApproval
      ? "WhatsApp talebi ic onay ve rol bazli kontrol gerektirir."
      : rule.requiresLinkedCustomer
        ? "Bu talep icin kayitli telefon ve cari eslesmesi gerekir."
        : "Dusuk riskli WhatsApp akisi.",
    mode,
    requiresCustomerConfirmation: rule.requiresCustomerConfirmation,
    requiresLinkedCustomer: rule.requiresLinkedCustomer,
    canAutoReply: rule.canAutoReply,
    requiresInternalApproval: rule.requiresInternalApproval,
    requiresSalesApproval: rule.requiresSalesApproval,
    requiresAccountingApproval: rule.requiresAccountingApproval,
    requiresCrmApproval: rule.requiresCrmApproval,
    approvalPolicyMode,
    requiredRoles,
    approverPhones,
    approvalPolicy: {
      mode: approvalPolicyMode,
      requiredRoles,
      approverPhones,
      requiresInternalApproval: rule.requiresInternalApproval,
      requiresCrmApproval: rule.requiresCrmApproval
    },
    templateKey: rule.templateKey
  };
}
