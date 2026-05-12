import { createPendingApprovalRequest, evaluatePolicy, listPendingApprovalRequests } from "@hallederiz/domain";
import type { PolicyChannel, PolicyCheckRequest } from "@hallederiz/types";
import type { RequestContext } from "./request-context";

export function evaluatePolicyForContext(
  context: RequestContext,
  actionKey: string,
  options?: {
    channel?: PolicyChannel;
    tenantModules?: string[];
    tenantFeatures?: string[];
    providerHealth?: PolicyCheckRequest["providerHealth"];
    approval?: PolicyCheckRequest["approval"];
    actorType?: PolicyCheckRequest["actor"]["type"];
  }
) {
  return evaluatePolicy({
    tenant: {
      id: context.tenantId,
      status: "active",
      modules: options?.tenantModules ?? ["core"],
      features: options?.tenantFeatures ?? []
    },
    actor: {
      type: options?.actorType ?? "user",
      id: context.userId,
      roles: context.roles ?? [],
      permissions: context.permissions ?? []
    },
    actionKey,
    channel: options?.channel ?? "api",
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    providerHealth: options?.providerHealth,
    approval: options?.approval
  });
}

type RoutePolicyDecisionLike = {
  decision?: string;
  actionKey?: string;
  reasons?: string[];
  auditRequired?: boolean;
  timelineRequired?: boolean;
  idempotencyRequired?: boolean;
};

export type RoutePolicyEnforcementResult =
  | { handled: false }
  | { handled: true; statusCode: number; body: Record<string, unknown> };

export function evaluateRoutePolicy(
  contextOrArgs: any,
  actionKeyOrOptions?: string | ({ actionKey?: string } & Parameters<typeof evaluatePolicyForContext>[2]),
  options?: Parameters<typeof evaluatePolicyForContext>[2]
) {
  if (
    contextOrArgs &&
    typeof contextOrArgs === "object" &&
    "context" in contextOrArgs &&
    "actionKey" in contextOrArgs
  ) {
    return evaluatePolicyForContext(
      contextOrArgs.context,
      contextOrArgs.actionKey,
      contextOrArgs.options
    );
  }

  if (typeof actionKeyOrOptions === "object" && actionKeyOrOptions !== null) {
    const { actionKey: optionActionKey, ...routeOptions } = actionKeyOrOptions;
    return evaluatePolicyForContext(contextOrArgs, optionActionKey ?? "unknown.action", routeOptions);
  }

  return evaluatePolicyForContext(contextOrArgs, actionKeyOrOptions ?? "unknown.action", options);
}

export function enforcePolicyDecision(
  decision: RoutePolicyDecisionLike,
  context?: RequestContext
): RoutePolicyEnforcementResult {
  if (!decision || decision.decision === "allow") {
    return { handled: false };
  }

  if (decision.decision === "require_approval") {
    const pendingRequest = createPendingApprovalRequest({
      tenantId: context?.tenantId ?? "tenant_unknown",
      actorId: context?.userId ?? "unknown_actor",
      actionKey: decision.actionKey ?? "unknown.action",
      reasons: decision.reasons ?? []
    });

    return {
      handled: true,
      statusCode: 202,
      body: {
        ok: false,
        status: "require_approval",
        policyDecision: "require_approval",
        approvalRequired: true,
        actionKey: decision.actionKey,
        approvalRequestId: pendingRequest.approvalRequestId,
        reasons: decision.reasons ?? [],
        auditRequired: decision.auditRequired ?? true,
        timelineRequired: decision.timelineRequired ?? true
      }
    };
  }

  return {
    handled: true,
    statusCode: 403,
    body: {
      ok: false,
      status: decision.decision,
      policyDecision: decision.decision,
      actionKey: decision.actionKey,
      reasons: decision.reasons ?? [],
      auditRequired: decision.auditRequired ?? true,
      timelineRequired: decision.timelineRequired ?? true,
      idempotencyRequired: decision.idempotencyRequired ?? false
    }
  };
}

export { listPendingApprovalRequests };
