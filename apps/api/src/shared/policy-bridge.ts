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
