import type { RequestContext } from "./request-context";
import { evaluateProductionReadiness, type ProductionReadinessReport } from "./production-readiness-runtime";

export type ProductionEnforcementActionType =
  | "critical_mutation"
  | "live_provider_send"
  | "approval_execution"
  | "worker_live_execution"
  | "document_send"
  | "omnichannel_reply"
  | "whatsapp_outbound"
  | "settings_update"
  | "user_management"
  | "commercial_write"
  | "local_output"
  | "ai_execute"
  | "safe_read";

export interface ProductionGateContext {
  context: RequestContext;
  actionType: ProductionEnforcementActionType;
  actionKey: string;
}

export interface ProductionGateEvaluation {
  productionGate: "blocked" | "allowed" | "degraded";
  action: ProductionEnforcementActionType;
  actionKey: string;
  isProduction: boolean;
  blockers: string[];
  missingEnv: string[];
  unsafeFallbacks: string[];
  reason: string;
  report: ProductionReadinessReport;
}

const CRITICAL_ACTIONS = new Set<ProductionEnforcementActionType>([
  "critical_mutation",
  "live_provider_send",
  "approval_execution",
  "worker_live_execution",
  "document_send",
  "omnichannel_reply",
  "whatsapp_outbound",
  "settings_update",
  "user_management",
  "commercial_write",
  "local_output",
  "ai_execute"
]);

function isCriticalAction(actionType: ProductionEnforcementActionType): boolean {
  return CRITICAL_ACTIONS.has(actionType);
}

export function mapActionKeyToProductionActionType(actionKey: string): ProductionEnforcementActionType {
  if (actionKey === "platform.users.create") return "user_management";
  if (actionKey === "platform.settings.update") return "settings_update";
  if (
    actionKey === "platform.customers.create" ||
    actionKey === "platform.customers.update" ||
    actionKey === "platform.offers.create" ||
    actionKey === "platform.orders.create" ||
    actionKey === "platform.payments.create" ||
    actionKey === "platform.payments.confirm" ||
    actionKey === "platform.payments.reverse"
  ) {
    return "commercial_write";
  }
  if (
    actionKey === "platform.documents.send_whatsapp" ||
    actionKey === "platform.documents.send_email" ||
    actionKey === "platform.documents.archive"
  ) {
    return "document_send";
  }
  if (actionKey === "platform.documents.generate") return "document_send";
  if (actionKey === "platform.documents.send") return "document_send";
  if (actionKey === "platform.omnichannel.reply") return "omnichannel_reply";
  if (actionKey === "platform.whatsapp.reply") {
    return "whatsapp_outbound";
  }
  if (actionKey === "platform.whatsapp.action_request.confirm") return "approval_execution";
  if (actionKey === "platform.ai.execute") return "ai_execute";
  if (
    actionKey === "worker.approval.dispatch" ||
    actionKey === "worker.audit.timeline.writeback" ||
    actionKey === "worker.omnichannel.reply.dispatch"
  ) {
    return "worker_live_execution";
  }
  if (actionKey.endsWith(".read")) return "safe_read";
  return "critical_mutation";
}

export async function evaluateProductionGate(input: ProductionGateContext): Promise<ProductionGateEvaluation> {
  const report = await evaluateProductionReadiness(input.context);
  const isProduction = report.environment.isProduction;
  if (!isProduction) {
    return {
      productionGate: "allowed",
      action: input.actionType,
      actionKey: input.actionKey,
      isProduction: false,
      blockers: report.blockers,
      missingEnv: report.missingEnv,
      unsafeFallbacks: report.unsafeFallbacks,
      reason: "non_production_environment",
      report
    };
  }

  if (report.overallStatus === "blocked" && isCriticalAction(input.actionType)) {
    return {
      productionGate: "blocked",
      action: input.actionType,
      actionKey: input.actionKey,
      isProduction: true,
      blockers: report.blockers,
      missingEnv: report.missingEnv,
      unsafeFallbacks: report.unsafeFallbacks,
      reason: "production_readiness_blocked",
      report
    };
  }

  if (report.overallStatus === "degraded" && isCriticalAction(input.actionType)) {
    return {
      productionGate: "degraded",
      action: input.actionType,
      actionKey: input.actionKey,
      isProduction: true,
      blockers: report.blockers,
      missingEnv: report.missingEnv,
      unsafeFallbacks: report.unsafeFallbacks,
      reason: "production_readiness_degraded",
      report
    };
  }

  return {
    productionGate: "allowed",
    action: input.actionType,
    actionKey: input.actionKey,
    isProduction: true,
    blockers: report.blockers,
    missingEnv: report.missingEnv,
    unsafeFallbacks: report.unsafeFallbacks,
    reason: "production_gate_allowed",
    report
  };
}

export function buildProductionBlockedResponse(gate: ProductionGateEvaluation): {
  ok: false;
  error: string;
  message: string;
  productionGate: ProductionGateEvaluation["productionGate"];
  action: ProductionEnforcementActionType;
  actionKey: string;
  blockers: string[];
  missingEnv: string[];
  unsafeFallbacks: string[];
  reason: string;
  mutationExecuted: false;
  externalProviderCallExecuted: false;
} {
  return {
    ok: false,
    error: "production_gate_blocked",
    message:
      gate.productionGate === "blocked"
        ? "Production readiness blocker bulundu, kritik islem fail-closed durduruldu."
        : "Production readiness degraded durumda, kritik islem canli modda calistirilmadi.",
    productionGate: gate.productionGate,
    action: gate.action,
    actionKey: gate.actionKey,
    blockers: gate.blockers,
    missingEnv: gate.missingEnv,
    unsafeFallbacks: gate.unsafeFallbacks,
    reason: gate.reason,
    mutationExecuted: false,
    externalProviderCallExecuted: false
  };
}

export async function assertProductionReadyForAction(input: ProductionGateContext): Promise<ProductionGateEvaluation> {
  const gate = await evaluateProductionGate(input);
  if (gate.productionGate !== "allowed") {
    return gate;
  }
  return gate;
}
