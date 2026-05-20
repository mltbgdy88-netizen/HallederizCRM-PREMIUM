import type { FastifyReply, FastifyRequest } from "fastify";
import { getPolicyAction } from "@hallederiz/domain";
import { recordAuditEventStrict } from "./audit-timeline";
import { resolveMutationTimelineSummary } from "./mutation-timeline-summary";
import {
  assertProductionReadyForAction,
  buildProductionBlockedResponse,
  mapActionKeyToProductionActionType
} from "./production-enforcement";
import { enforcePolicyDecision, evaluateRoutePolicy } from "./policy-bridge";
import type { RequestContext } from "./request-context";

export type MutationPolicyResult<T> =
  | { handled: true; statusCode: number; body: Record<string, unknown> }
  | { handled: false; value: T };

export interface WithMutationPolicyOptions<T> {
  request: FastifyRequest;
  reply: FastifyReply;
  context: RequestContext;
  actionKey: string;
  entityType: string;
  entityId: string;
  idempotencyKey?: string;
  payload?: Record<string, unknown>;
  handler: () => Promise<T>;
  successStatus?: number;
  mapSuccess?: (value: T) => Record<string, unknown>;
}

const USER_SAFE_BLOCKED = "İşlem güvenli yapılandırma tamamlandığında çalıştırılabilir.";
const USER_SAFE_APPROVAL = "İşlem onaya gönderildi.";
const USER_SAFE_DENIED = "Bu işlem için yetkiniz yeterli değil.";

function resolvePolicyChannel(actionKey: string): "api" | "whatsapp" | "email" {
  if (actionKey.includes("send_whatsapp") || actionKey.includes(".whatsapp")) {
    return "whatsapp";
  }
  if (actionKey.includes("send_email")) {
    return "email";
  }
  return "api";
}

function resolveIdempotencyKey<T>(options: WithMutationPolicyOptions<T>): string | undefined {
  const header = options.request.headers["idempotency-key"];
  if (typeof header === "string" && header.trim()) {
    return header.trim();
  }
  return options.idempotencyKey;
}

export async function withMutationPolicy<T>(
  options: WithMutationPolicyOptions<T>
): Promise<MutationPolicyResult<T>> {
  const registry = getPolicyAction(options.actionKey);
  const productionActionType = mapActionKeyToProductionActionType(options.actionKey);

  const productionGate = await assertProductionReadyForAction({
    context: options.context,
    actionType: productionActionType,
    actionKey: options.actionKey
  });

  if (productionGate.productionGate === "blocked") {
    return {
      handled: true,
      statusCode: 503,
      body: {
        ...buildProductionBlockedResponse(productionGate),
        message: USER_SAFE_BLOCKED
      }
    };
  }

  const idempotencyKey = resolveIdempotencyKey(options);
  if (registry?.idempotencyRequired && !idempotencyKey) {
    return {
      handled: true,
      statusCode: 400,
      body: {
        ok: false,
        message: "İşlem şu anda tamamlanamıyor.",
        reason: "idempotency_key_required"
      }
    };
  }

  const policyDecision = evaluateRoutePolicy(options.context, {
    actionKey: options.actionKey,
    channel: resolvePolicyChannel(options.actionKey),
    source: "api",
    idempotencyKey,
    metadata: options.payload
  });

  const enforcement = await enforcePolicyDecision(policyDecision, options.context, {
    payload: options.payload,
    idempotencyKey
  });

  if (enforcement.handled) {
    if (enforcement.statusCode === 202 || enforcement.body?.policyDecision === "require_approval") {
      return {
        handled: true,
        statusCode: enforcement.statusCode,
        body: {
          ...enforcement.body,
          message: USER_SAFE_APPROVAL
        }
      };
    }
    if (enforcement.statusCode === 403 || enforcement.body?.policyDecision === "deny") {
      return {
        handled: true,
        statusCode: enforcement.statusCode,
        body: {
          ...enforcement.body,
          message: USER_SAFE_DENIED
        }
      };
    }
    return {
      handled: true,
      statusCode: enforcement.statusCode,
      body: enforcement.body
    };
  }

  if (policyDecision.decision === "dry_run_only") {
    return {
      handled: true,
      statusCode: 202,
      body: {
        ok: false,
        message: "İşlem güvenli yapılandırma tamamlandığında çalıştırılabilir.",
        policyDecision: "dry_run_only",
        actionKey: options.actionKey
      }
    };
  }

  const value = await options.handler();

  if (registry?.auditRequired) {
    const summary = resolveMutationTimelineSummary(options.actionKey);
    const audit = await recordAuditEventStrict(options.context, {
      entityType: options.entityType,
      entityId: options.entityId,
      eventType: options.actionKey,
      title: summary.title,
      description: summary.description,
      payload: options.payload
    });
    if (!audit.ok && process.env.NODE_ENV === "production") {
      return {
        handled: true,
        statusCode: 503,
        body: {
          ok: false,
          message: "Kayıt güvenli şekilde alınamadı; yeniden deneyin.",
          reason: audit.reason
        }
      };
    }
  }

  return {
    handled: false,
    value
  };
}
