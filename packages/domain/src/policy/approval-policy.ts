import type { ActionRegistryEntry, PolicyCheckRequest, PolicyDecision } from "@hallederiz/types";

export function evaluateApprovalPolicy(request: PolicyCheckRequest, action: ActionRegistryEntry): PolicyDecision | null {
  if (!action.approvalRequired) {
    return null;
  }

  if (request.approval?.isApproved) {
    return null;
  }

  return {
    decision: "require_approval",
    actionKey: action.actionKey,
    reasons: ["approval_required_for_critical_action"],
    requiredPermissions: action.requiredPermissions,
    requiredFeature: action.requiredFeature,
    requiredModule: action.requiredModule,
    approvalPolicyKey: action.approvalPolicyKey,
    riskLevel: action.isCritical ? "critical" : "high",
    auditRequired: true,
    timelineRequired: true,
    idempotencyRequired: action.idempotencyRequired
  };
}
