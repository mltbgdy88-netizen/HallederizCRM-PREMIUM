import {
  evaluatePolicy,
  listPendingApprovalRequests,
  type PendingApprovalRepository
} from "@hallederiz/domain";
import type { PolicyChannel, PolicyCheckRequest } from "@hallederiz/types";
import type { RequestContext } from "./request-context";
import { resolvePendingApprovalRepository } from "./approval-repository-runtime";
import {
  evaluatePolicyEngineForContext,
  mapPolicyEngineDecisionToRouteDecision,
  type PolicyEngineRuntimeOptions
} from "./policy-engine-runtime";

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
  policyEngine?: unknown;
};

export type RoutePolicyEnforcementResult =
  | { handled: false }
  | { handled: true; statusCode: number; body: Record<string, unknown> };

type PolicyPersistenceOptions = {
  pendingApprovalRepository?: PendingApprovalRepository | null;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
  requestedAt?: string;
};

let skippedApprovalSequence = 0;

function createSkippedApprovalRequestId() {
  skippedApprovalSequence += 1;
  return `apr_req_skipped_${skippedApprovalSequence}`;
}

export function evaluateRoutePolicy(
  contextOrArgs: any,
  actionKeyOrOptions?:
    | string
    | ({ actionKey?: string } & Parameters<typeof evaluatePolicyForContext>[2] & Partial<PolicyEngineRuntimeOptions>),
  options?: Parameters<typeof evaluatePolicyForContext>[2]
) {
  const context = contextOrArgs && typeof contextOrArgs === "object" && "context" in contextOrArgs ? contextOrArgs.context : contextOrArgs;
  const rawActionKey =
    contextOrArgs && typeof contextOrArgs === "object" && "actionKey" in contextOrArgs
      ? contextOrArgs.actionKey
      : typeof actionKeyOrOptions === "object" && actionKeyOrOptions !== null
        ? actionKeyOrOptions.actionKey
        : actionKeyOrOptions;
  const actionKey = rawActionKey ?? "unknown.action";

  const policyEngineOptions =
    typeof actionKeyOrOptions === "object" && actionKeyOrOptions !== null
      ? (actionKeyOrOptions as Partial<PolicyEngineRuntimeOptions>)
      : {};

  if (typeof actionKey === "string" && (actionKey.startsWith("platform.") || actionKey.startsWith("worker."))) {
    return mapPolicyEngineDecisionToRouteDecision(
      evaluatePolicyEngineForContext(context, {
        actionKey,
        channel: policyEngineOptions.channel ?? "api",
        source: policyEngineOptions.source ?? "api",
        idempotencyKey: policyEngineOptions.idempotencyKey,
        channelPolicy: policyEngineOptions.channelPolicy,
        fallbackCertainty: policyEngineOptions.fallbackCertainty,
        auditMetadataPresent: policyEngineOptions.auditMetadataPresent,
        timelineMetadataPresent: policyEngineOptions.timelineMetadataPresent,
        metadata: policyEngineOptions.metadata,
        approval: policyEngineOptions.approval,
        resource: policyEngineOptions.resource
      })
    );
  }

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

export async function enforcePolicyDecision(
  decision: RoutePolicyDecisionLike,
  context?: RequestContext,
  options?: PolicyPersistenceOptions
): Promise<RoutePolicyEnforcementResult> {
  if (!decision || decision.decision === "allow") {
    return { handled: false };
  }

  const policyObligations =
    decision.policyEngine &&
    typeof decision.policyEngine === "object" &&
    "obligations" in decision.policyEngine
      ? (decision.policyEngine as { obligations?: Record<string, unknown> }).obligations
      : undefined;

  if (decision.decision === "require_approval") {
    const runtimeResolution =
      options?.pendingApprovalRepository === undefined
        ? resolvePendingApprovalRepository(context)
        : {
            repository: options.pendingApprovalRepository,
            mode: options.pendingApprovalRepository ? "memory" : "none",
            skipped: options.pendingApprovalRepository === null,
            reasons: options.pendingApprovalRepository === null ? ["pending_approval_repository_not_provided"] : []
          };
    const repository = runtimeResolution.repository;

    if (!repository) {
      return {
        handled: true,
        statusCode: 503,
        body: {
          ok: false,
          status: "require_approval",
          policyDecision: "require_approval",
          approvalRequired: true,
          actionKey: decision.actionKey,
          approvalRequestId: createSkippedApprovalRequestId(),
          reasons: decision.reasons ?? [],
          auditRequired: decision.auditRequired ?? true,
          timelineRequired: decision.timelineRequired ?? true,
          obligations: policyObligations,
          approvalPersisted: false,
          approvalPersistenceSkipped: true,
          approvalPersistenceMode: runtimeResolution.mode,
          persistenceMode: runtimeResolution.mode,
          persistenceReasons: runtimeResolution.reasons,
          policyEngine: decision.policyEngine
        }
      };
    }

    let pendingRequest;
    try {
      pendingRequest = await repository.createPendingApprovalRequest({
        tenantId: context?.tenantId ?? "tenant_unknown",
        actorId: context?.userId ?? "unknown_actor",
        actionKey: decision.actionKey ?? "unknown.action",
        reasons: decision.reasons ?? [],
        payload: options?.payload,
        idempotencyKey: options?.idempotencyKey,
        requestedAt: options?.requestedAt,
        auditRequired: decision.auditRequired ?? true,
        timelineRequired: decision.timelineRequired ?? true
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "approval_persistence_failed";
      return {
        handled: true,
        statusCode: 503,
        body: {
          ok: false,
          status: "require_approval",
          policyDecision: "require_approval",
          approvalRequired: true,
          actionKey: decision.actionKey,
          reasons: [...(decision.reasons ?? []), "approval_persistence_failed", reason],
          auditRequired: decision.auditRequired ?? true,
          timelineRequired: decision.timelineRequired ?? true,
          obligations: policyObligations,
          approvalPersisted: false,
          approvalPersistenceSkipped: false,
          approvalPersistenceMode: runtimeResolution.mode,
          persistenceMode: "error",
          policyEngine: decision.policyEngine
        }
      };
    }

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
        timelineRequired: decision.timelineRequired ?? true,
        obligations: policyObligations,
        approvalPersisted: true,
        approvalPersistenceSkipped: false,
        approvalPersistenceMode: runtimeResolution.mode,
        persistenceMode: runtimeResolution.mode,
        policyEngine: decision.policyEngine
      }
    };
  }

  if (decision.decision === "dry_run_only") {
    return {
      handled: true,
      statusCode: 202,
      body: {
        ok: false,
        status: "dry_run_only",
        policyDecision: "dry_run_only",
        actionKey: decision.actionKey,
        reasons: decision.reasons ?? [],
        auditRequired: decision.auditRequired ?? true,
        timelineRequired: decision.timelineRequired ?? true,
        idempotencyRequired: decision.idempotencyRequired ?? false,
        obligations: policyObligations,
        mutationExecuted: false,
        policyEngine: decision.policyEngine
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
      idempotencyRequired: decision.idempotencyRequired ?? false,
      obligations: policyObligations,
      policyEngine: decision.policyEngine
    }
  };
}

export { listPendingApprovalRequests };



