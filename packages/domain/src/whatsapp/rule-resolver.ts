import type {
  WhatsAppApprovalPolicyMode,
  WhatsAppApproverRole,
  WhatsAppBusinessIntent,
  WhatsAppRuleMode,
  WhatsAppRuleResolution,
  WhatsAppRuleTemplateKey
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
  requiresInternalApproval: boolean;
  requiresSalesApproval: boolean;
  requiresAccountingApproval: boolean;
  requiresCrmApproval: boolean;
  templateKey: WhatsAppRuleTemplateKey;
}

const defaultRule: RuntimeRule = {
  requiresRegisteredPhone: false,
  requiresLinkedCustomer: false,
  canAutoReply: true,
  requiresInternalApproval: false,
  requiresSalesApproval: false,
  requiresAccountingApproval: false,
  requiresCrmApproval: false,
  templateKey: "generic"
};

const rulesByIntent: Record<WhatsAppBusinessIntent, RuntimeRule> = {
  stok: {
    ...defaultRule,
    templateKey: "stock"
  },
  fiyat: {
    ...defaultRule,
    requiresRegisteredPhone: true,
    requiresLinkedCustomer: true,
    canAutoReply: false,
    templateKey: "price"
  },
  ekstre: {
    ...defaultRule,
    requiresRegisteredPhone: true,
    requiresLinkedCustomer: true,
    canAutoReply: false,
    templateKey: "statement"
  },
  siparis: {
    ...defaultRule,
    requiresRegisteredPhone: true,
    requiresLinkedCustomer: true,
    canAutoReply: false,
    requiresInternalApproval: true,
    requiresSalesApproval: true,
    requiresAccountingApproval: true,
    requiresCrmApproval: true,
    templateKey: "order"
  },
  odeme: {
    ...defaultRule,
    requiresRegisteredPhone: true,
    requiresLinkedCustomer: true,
    canAutoReply: false,
    requiresInternalApproval: true,
    requiresSalesApproval: true,
    requiresAccountingApproval: true,
    requiresCrmApproval: true,
    templateKey: "payment"
  },
  iade: {
    ...defaultRule,
    requiresRegisteredPhone: true,
    requiresLinkedCustomer: true,
    canAutoReply: false,
    requiresInternalApproval: true,
    requiresSalesApproval: true,
    requiresAccountingApproval: true,
    templateKey: "return"
  },
  fatura: {
    ...defaultRule,
    requiresRegisteredPhone: true,
    requiresLinkedCustomer: true,
    canAutoReply: false,
    requiresInternalApproval: true,
    requiresSalesApproval: true,
    requiresAccountingApproval: true,
    requiresCrmApproval: true,
    templateKey: "invoice"
  },
  hatali_urun: {
    ...defaultRule,
    requiresInternalApproval: true,
    requiresSalesApproval: true,
    requiresAccountingApproval: true,
    templateKey: "defect"
  },
  diger: {
    ...defaultRule,
    templateKey: "generic"
  }
};

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
}): WhatsAppRuleResolution {
  const rule = rulesByIntent[input.intent] ?? rulesByIntent.diger;
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
    requiresCustomerConfirmation: rule.requiresRegisteredPhone || rule.requiresLinkedCustomer,
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
