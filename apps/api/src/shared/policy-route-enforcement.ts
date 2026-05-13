import { buildPolicyDecisionUsageEvent } from "@hallederiz/domain";
import {
  assertAnyPermission,
  assertAuthenticated,
  assertTenantAccess
} from "./auth-guards";
import {
  enforcePolicyDecision,
  evaluateRoutePolicy,
  type RoutePolicyEnforcementResult
} from "./policy-bridge";
import type { RequestContext } from "./request-context";
import { resolveTenantUsageLedger } from "./tenant-usage-runtime";
import {
  assertProductionReadyForAction,
  buildProductionBlockedResponse,
  mapActionKeyToProductionActionType,
  type ProductionEnforcementActionType
} from "./production-enforcement";

type PolicyEnforcementOptions = {
  actionKey: string;
  productionActionType?: ProductionEnforcementActionType;
  requiredPermissions?: readonly string[];
  tenantId?: string;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
  channel?: "api" | "worker" | "whatsapp" | "email" | "instagram" | "facebook" | "web_chat" | "sms" | "internal_note";
  source?: "api" | "web" | "worker" | "whatsapp" | "ai" | "system" | "local_agent";
  channelPolicy?: {
    signatureVerified?: boolean;
    approvalTokenVerified?: boolean;
    phoneVerified?: boolean;
    withinChannelWindow?: boolean;
  };
};

async function enrichHandledResponseWithUsage(
  context: RequestContext,
  policyDecision: unknown,
  enforcement: RoutePolicyEnforcementResult
): Promise<RoutePolicyEnforcementResult> {
  if (!enforcement.handled) return enforcement;
  if (!policyDecision || typeof policyDecision !== "object") return enforcement;

  const decision = policyDecision as {
    effect?: string;
    actionKey?: string;
    reasons?: string[];
    usagePolicy?: { usageRecordRequired?: boolean; usageEventType?: string };
  } & Record<string, unknown>;

  if (!context.tenantId || !context.userId) {
    return enforcement;
  }

  const usageEvent = buildPolicyDecisionUsageEvent(
    {
      effect: decision.effect ?? "deny",
      actionKey: decision.actionKey ?? "unknown_action",
      reasons: Array.isArray(decision.reasons) ? decision.reasons : [],
      obligations: { requireUsageRecord: Boolean(decision.usagePolicy?.usageRecordRequired) },
      usagePolicy: decision.usagePolicy
    } as never,
    {
      userId: context.userId,
      tenantId: context.tenantId,
      roles: context.roles ?? [],
      permissions: context.permissions ?? [],
      authMode: context.sessionToken ? "session" : "demo",
      channel: "api"
    },
    {
      requestId: `req_${Date.now()}`,
      tenantId: context.tenantId,
      source: "api",
      environment: process.env.NODE_ENV === "production" ? "production" : "development",
      persistenceMode: context.persistenceMode,
      channel: "api"
    }
  );

  if (!usageEvent) return enforcement;

  const resolution = resolveTenantUsageLedger(context);
  if (!resolution.ledger) {
    return {
      handled: true,
      statusCode: enforcement.statusCode,
      body: {
        ...enforcement.body,
        usageRecordRequired: true,
        usageRecorded: false,
        usagePersistenceMode: resolution.mode,
        usageReasons: resolution.reasons
      }
    };
  }

  try {
    const saved = await resolution.ledger.record(usageEvent);
    return {
      handled: true,
      statusCode: enforcement.statusCode,
      body: {
        ...enforcement.body,
        usageRecordRequired: true,
        usageRecorded: true,
        usagePersistenceMode: resolution.mode,
        usageEventType: usageEvent.eventType,
        usageEventId: saved.id,
        usageRecordedAt: saved.createdAt ?? saved.occurredAt
      }
    };
  } catch (error) {
    return {
      handled: true,
      statusCode: enforcement.statusCode,
      body: {
        ...enforcement.body,
        usageRecordRequired: true,
        usageRecorded: false,
        usagePersistenceMode: resolution.mode,
        usageEventType: usageEvent.eventType,
        usageRecordError: error instanceof Error ? error.message : "usage_record_failed"
      }
    };
  }

}

export async function enforcePolicyForRoute(
  context: RequestContext,
  options: PolicyEnforcementOptions
): Promise<RoutePolicyEnforcementResult> {
  assertAuthenticated(context);
  if (options.tenantId) {
    assertTenantAccess(context, options.tenantId);
  }
  if (options.requiredPermissions?.length) {
    assertAnyPermission(context, options.requiredPermissions);
  }

  const mappedProductionActionType = options.productionActionType ?? mapActionKeyToProductionActionType(options.actionKey);
  if (mappedProductionActionType !== "safe_read") {
    const productionGate = await assertProductionReadyForAction({
      context,
      actionType: mappedProductionActionType,
      actionKey: options.actionKey
    });
    if (productionGate.productionGate !== "allowed") {
      return {
        handled: true,
        statusCode: 503,
        body: buildProductionBlockedResponse(productionGate)
      };
    }
  }

  const decision = evaluateRoutePolicy(context, {
    actionKey: options.actionKey,
    channel: options.channel ?? "api",
    source: options.source ?? "api",
    channelPolicy: options.channelPolicy,
    idempotencyKey: options.idempotencyKey
  });

  const result = await enforcePolicyDecision(decision, context, {
    payload: options.payload,
    idempotencyKey: options.idempotencyKey
  });

  const policyEngine =
    decision && typeof decision === "object" && "policyEngine" in decision
      ? (decision as { policyEngine?: unknown }).policyEngine
      : undefined;
  return await enrichHandledResponseWithUsage(context, policyEngine, result);
}

