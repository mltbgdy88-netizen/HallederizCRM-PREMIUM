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

type PolicyEnforcementOptions = {
  actionKey: string;
  requiredPermissions?: readonly string[];
  tenantId?: string;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
  channel?: "api" | "worker" | "whatsapp" | "email";
  source?: "api" | "web" | "worker" | "whatsapp" | "ai" | "system";
  channelPolicy?: {
    signatureVerified?: boolean;
    approvalTokenVerified?: boolean;
    phoneVerified?: boolean;
    withinChannelWindow?: boolean;
  };
};

function enrichHandledResponseWithUsage(
  context: RequestContext,
  policyDecision: unknown,
  enforcement: RoutePolicyEnforcementResult
): RoutePolicyEnforcementResult {
  if (!enforcement.handled) return enforcement;
  if (!policyDecision || typeof policyDecision !== "object") return enforcement;

  const decision = policyDecision as {
    effect?: string;
    subject?: { userId?: string; channel?: string };
    context?: {
      tenantId?: string;
      source?: string;
      requestId?: string;
      channel?: string;
    };
  } & Record<string, unknown>;

  if (!decision.context?.tenantId || !decision.subject?.userId) {
    return enforcement;
  }

  const usageEvent = buildPolicyDecisionUsageEvent(
    decision as never,
    {
      userId: decision.subject.userId,
      tenantId: decision.context.tenantId,
      roles: context.roles ?? [],
      permissions: context.permissions ?? [],
      authMode: context.sessionToken ? "session" : "demo",
      channel: "api"
    },
    {
      requestId: decision.context.requestId ?? `req_${Date.now()}`,
      tenantId: decision.context.tenantId,
      source: (decision.context.source as never) ?? "api",
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

  return {
    handled: true,
    statusCode: enforcement.statusCode,
    body: {
      ...enforcement.body,
      usageRecordRequired: true,
      usageRecorded: true,
      usagePersistenceMode: resolution.mode,
      usageEventType: usageEvent.eventType
    }
  };
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
  return enrichHandledResponseWithUsage(context, policyEngine, result);
}
