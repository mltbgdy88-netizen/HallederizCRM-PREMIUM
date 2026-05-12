import { evaluatePolicy } from "@hallederiz/domain";
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

export function enforcePolicyDecision(...args: any[]): RoutePolicyEnforcementResult {
  const decision = args.find(
    (arg) => arg && typeof arg === "object" && "decision" in arg
  ) as RoutePolicyDecisionLike | undefined;

  if (!decision || decision.decision === "allow") {
    return { handled: false };
  }

  const statusCode = decision.decision === "require_approval" ? 202 : 403;
  const body: Record<string, unknown> = {
    ok: false,
    status: decision.decision,
    policyDecision: decision.decision,
    actionKey: decision.actionKey,
    reasons: decision.reasons ?? [],
    auditRequired: decision.auditRequired ?? true,
    timelineRequired: decision.timelineRequired ?? true,
    idempotencyRequired: decision.idempotencyRequired ?? false
  };

  return {
    handled: true,
    statusCode,
    body
  };
}
