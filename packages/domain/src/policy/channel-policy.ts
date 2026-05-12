import type { ActionRegistryEntry, PolicyCheckRequest, PolicyDecision } from "@hallederiz/types";

export function evaluateChannelPolicy(request: PolicyCheckRequest, action: ActionRegistryEntry): PolicyDecision | null {
  if (!request.channel) {
    return null;
  }

  if (action.allowedChannels?.length && !action.allowedChannels.includes(request.channel)) {
    return {
      decision: "deny",
      actionKey: action.actionKey,
      reasons: ["channel_not_allowed_for_action"],
      requiredPermissions: action.requiredPermissions,
      requiredFeature: action.requiredFeature,
      requiredModule: action.requiredModule,
      riskLevel: action.isCritical ? "critical" : "medium",
      auditRequired: true,
      timelineRequired: action.timelineRequired,
      idempotencyRequired: action.idempotencyRequired
    };
  }

  if (request.channel === "whatsapp" && action.isCritical) {
    return {
      decision: "require_approval",
      actionKey: action.actionKey,
      reasons: ["whatsapp_critical_action_requires_approval"],
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

  return null;
}
