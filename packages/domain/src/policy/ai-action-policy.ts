import type { ActionRegistryEntry, PolicyCheckRequest, PolicyDecision } from "@hallederiz/types";

export function evaluateAiActionPolicy(request: PolicyCheckRequest, action: ActionRegistryEntry): PolicyDecision | null {
  if (request.actor.type !== "ai") {
    return null;
  }

  if (action.aiMode === "blocked") {
    return {
      decision: "deny",
      actionKey: action.actionKey,
      reasons: ["ai_action_blocked"],
      requiredPermissions: action.requiredPermissions,
      requiredFeature: action.requiredFeature,
      requiredModule: action.requiredModule,
      riskLevel: "critical",
      auditRequired: true,
      timelineRequired: true,
      idempotencyRequired: action.idempotencyRequired
    };
  }

  if (action.isCritical) {
    return {
      decision: "require_approval",
      actionKey: action.actionKey,
      reasons: ["ai_critical_execution_requires_human_approval"],
      requiredPermissions: action.requiredPermissions,
      requiredFeature: action.requiredFeature,
      requiredModule: action.requiredModule,
      approvalPolicyKey: action.approvalPolicyKey,
      riskLevel: "critical",
      auditRequired: true,
      timelineRequired: true,
      idempotencyRequired: action.idempotencyRequired
    };
  }

  if (action.aiMode === "draft") {
    return {
      decision: "draft_only",
      actionKey: action.actionKey,
      reasons: ["ai_draft_mode_only"],
      requiredPermissions: action.requiredPermissions,
      requiredFeature: action.requiredFeature,
      requiredModule: action.requiredModule,
      riskLevel: "low",
      auditRequired: true,
      timelineRequired: action.timelineRequired,
      idempotencyRequired: action.idempotencyRequired
    };
  }

  return null;
}
