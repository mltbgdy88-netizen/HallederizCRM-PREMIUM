import type { ActionRegistryEntry, PolicyCheckRequest, PolicyDecision } from "@hallederiz/types";
import { getActionRegistryEntry } from "./action-registry";
import { evaluateAiActionPolicy } from "./ai-action-policy";
import { evaluateApprovalPolicy } from "./approval-policy";
import { evaluateChannelPolicy } from "./channel-policy";
import { isFeatureEnabled } from "./feature-registry";

function buildDenyDecision(request: PolicyCheckRequest, reason: string, action?: ActionRegistryEntry): PolicyDecision {
  return {
    decision: "deny",
    actionKey: request.actionKey,
    reasons: [reason],
    requiredPermissions: action?.requiredPermissions,
    requiredFeature: action?.requiredFeature,
    requiredModule: action?.requiredModule,
    riskLevel: action?.isCritical ? "critical" : "medium",
    auditRequired: true,
    timelineRequired: action?.timelineRequired ?? false,
    idempotencyRequired: action?.idempotencyRequired ?? false
  };
}

export function evaluatePolicy(request: PolicyCheckRequest): PolicyDecision {
  const action = getActionRegistryEntry(request.actionKey);
  if (!action) {
    return buildDenyDecision(request, "unknown_action");
  }

  if (request.tenant.status && request.tenant.status !== "active") {
    return buildDenyDecision(request, "tenant_not_active", action);
  }

  if (action.requiredModule && !(request.tenant.modules ?? []).includes(action.requiredModule)) {
    return buildDenyDecision(request, "required_module_missing", action);
  }

  if (action.requiredFeature && !isFeatureEnabled(action.requiredFeature, request.tenant.features)) {
    return buildDenyDecision(request, "required_feature_disabled", action);
  }

  if (!action.allowedActors.includes(request.actor.type)) {
    return buildDenyDecision(request, "actor_not_allowed", action);
  }

  const permissions = new Set(request.actor.permissions);
  const hasRequiredPermission = action.requiredPermissions.some((permission) => permissions.has(permission)) || permissions.has("*");
  if (!hasRequiredPermission) {
    return buildDenyDecision(request, "required_permission_missing", action);
  }

  const channelDecision = evaluateChannelPolicy(request, action);
  if (channelDecision) {
    return channelDecision;
  }

  const aiDecision = evaluateAiActionPolicy(request, action);
  if (aiDecision) {
    return aiDecision;
  }

  const approvalDecision = evaluateApprovalPolicy(request, action);
  if (approvalDecision) {
    return approvalDecision;
  }

  if (action.externalProviders?.length) {
    const unavailableProvider = action.externalProviders.find((provider) => {
      const health = request.providerHealth?.[provider];
      return health === "degraded" || health === "unavailable";
    });
    if (unavailableProvider) {
      return buildDenyDecision(request, `provider_unhealthy:${unavailableProvider}`, action);
    }
  }

  return {
    decision: "allow",
    actionKey: action.actionKey,
    reasons: ["policy_allow"],
    requiredPermissions: action.requiredPermissions,
    requiredFeature: action.requiredFeature,
    requiredModule: action.requiredModule,
    approvalPolicyKey: action.approvalPolicyKey,
    riskLevel: action.isCritical ? "critical" : "low",
    auditRequired: action.auditRequired,
    timelineRequired: action.timelineRequired,
    idempotencyRequired: action.idempotencyRequired
  };
}
