import {
  evaluatePolicy,
  listPendingApprovalRequests,
  type PendingApprovalRepository
} from "@hallederiz/domain";
import type { PolicyChannel, PolicyCheckRequest } from "@hallederiz/types";
import type { RequestContext } from "./request-context";
import { resolvePendingApprovalRepository } from "./approval-repository-runtime";

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

export async function enforcePolicyDecision(
  decision: RoutePolicyDecisionLike,
  context?: RequestContext,
  options?: PolicyPersistenceOptions
): Promise<RoutePolicyEnforcementResult> {
  if (!decision || decision.decision === "allow") {
    return { handled: false };
  }

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
          approvalPersisted: false,
          approvalPersistenceSkipped: true,
          approvalPersistenceMode: runtimeResolution.mode,
          persistenceMode: runtimeResolution.mode,
          persistenceReasons: runtimeResolution.reasons
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
          approvalPersisted: false,
          approvalPersistenceSkipped: false,
          approvalPersistenceMode: runtimeResolution.mode,
          persistenceMode: "error"
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
        approvalPersisted: true,
        approvalPersistenceSkipped: false,
        approvalPersistenceMode: runtimeResolution.mode,
        persistenceMode: runtimeResolution.mode
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
