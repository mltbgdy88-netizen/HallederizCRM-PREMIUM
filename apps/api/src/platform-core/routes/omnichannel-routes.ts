import type { FastifyInstance } from "fastify";
import { recordOmnichannelUsageEvent } from "@hallederiz/domain";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { enforcePolicyForRoute } from "../../shared/policy-route-enforcement";
import type { RequestContext } from "../../shared/request-context";
import { resolveOmnichannelRuntime } from "../../shared/omnichannel-runtime";
import { resolveTenantUsageLedger } from "../../shared/tenant-usage-runtime";

const readPermissions = ["omnichannel.read", "integrations.read"] as const;
const writePermissions = ["omnichannel.write", "integrations.write"] as const;

type OmnichannelChannel = "whatsapp" | "instagram" | "facebook" | "web_chat" | "email" | "sms" | "internal_note";

function ensureRuntime(context: RequestContext) {
  const runtime = resolveOmnichannelRuntime(context);
  if (!runtime.conversationRepository || !runtime.messageRepository) {
    return { runtime, error: true as const };
  }

  return {
    runtime: {
      ...runtime,
      conversationRepository: runtime.conversationRepository,
      messageRepository: runtime.messageRepository
    },
    error: false as const
  };
}

async function tryRecordUsage(
  context: RequestContext,
  payload: { channel: OmnichannelChannel; conversationId: string; direction: "inbound" | "outbound_attempt" | "outbound_sent" | "outbound_failed" }
) {
  const usage = resolveTenantUsageLedger(context);
  if (!usage.ledger) {
    return { usageRecorded: false, usageReasons: usage.reasons, usagePersistenceMode: usage.mode };
  }

  try {
    await recordOmnichannelUsageEvent(usage.ledger, {
      tenantId: context.tenantId,
      actorId: context.userId,
      channel: payload.channel,
      conversationId: payload.conversationId,
      direction: payload.direction
    });
    return { usageRecorded: true, usagePersistenceMode: usage.mode };
  } catch (error) {
    return {
      usageRecorded: false,
      usagePersistenceMode: usage.mode,
      usageRecordError: error instanceof Error ? error.message : "usage_record_failed"
    };
  }
}

function normalizeChannel(input: string | undefined): OmnichannelChannel {
  if (input === "whatsapp" || input === "instagram" || input === "facebook" || input === "web_chat" || input === "email" || input === "sms" || input === "internal_note") {
    return input;
  }

  return "whatsapp";
}

export async function registerOmnichannelRoutes(server: FastifyInstance) {
  server.get("/platform/omnichannel/conversations", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, readPermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.omnichannel.conversations.read",
        requiredPermissions: readPermissions,
        source: "api",
        channel: "api",
        payload: { path: "list_conversations" }
      });

      if (policy.handled) return reply.status(policy.statusCode).send(policy.body);

      const resolved = ensureRuntime(context);
      if (resolved.error) {
        return reply.status(503).send({ ok: false, error: "omnichannel_repository_unavailable", persistenceMode: resolved.runtime.mode, reasons: resolved.runtime.reasons });
      }

      const query = request.query as Record<string, unknown>;
      const channel = typeof query.channel === "string" ? query.channel : undefined;
      const status = typeof query.status === "string" ? query.status : undefined;
      const items = await resolved.runtime.conversationRepository.listByTenant(context.tenantId, { channel, status: status as any });

      return {
        items,
        total: items.length,
        persistenceMode: resolved.runtime.mode,
        providerHealth: await Promise.all([...resolved.runtime.providers.values()].map(async (provider) => ({ kind: provider.kind, ...(await provider.health()) })))
      };
    })
  );

  server.get<{ Params: { id: string } }>("/platform/omnichannel/conversations/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, readPermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.omnichannel.conversations.read",
        requiredPermissions: readPermissions,
        source: "api",
        channel: "api",
        payload: { path: "get_conversation", conversationId: request.params.id }
      });

      if (policy.handled) return reply.status(policy.statusCode).send(policy.body);

      const resolved = ensureRuntime(context);
      if (resolved.error) {
        return reply.status(503).send({ ok: false, error: "omnichannel_repository_unavailable", persistenceMode: resolved.runtime.mode, reasons: resolved.runtime.reasons });
      }

      const item = await resolved.runtime.conversationRepository.getById(context.tenantId, request.params.id);
      if (!item) return reply.status(404).send({ ok: false, error: "not_found" });

      return { item, persistenceMode: resolved.runtime.mode };
    })
  );

  server.get<{ Params: { id: string } }>("/platform/omnichannel/conversations/:id/messages", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, readPermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.omnichannel.conversations.read",
        requiredPermissions: readPermissions,
        source: "api",
        channel: "api",
        payload: { path: "list_messages", conversationId: request.params.id }
      });

      if (policy.handled) return reply.status(policy.statusCode).send(policy.body);

      const resolved = ensureRuntime(context);
      if (resolved.error) {
        return reply.status(503).send({ ok: false, error: "omnichannel_repository_unavailable", persistenceMode: resolved.runtime.mode, reasons: resolved.runtime.reasons });
      }

      const items = await resolved.runtime.messageRepository.listByConversation(context.tenantId, request.params.id);
      return { items, total: items.length, persistenceMode: resolved.runtime.mode };
    })
  );

  server.post<{ Params: { id: string }; Body: { text?: string; channel?: string; idempotencyKey?: string; source?: "web" | "api" | "ai" } }>(
    "/platform/omnichannel/conversations/:id/reply",
    async (request, reply) =>
      withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, writePermissions)], async (context) => {
        const channel = normalizeChannel(request.body?.channel);
        const policy = await enforcePolicyForRoute(context, {
          actionKey: "platform.omnichannel.reply",
          requiredPermissions: writePermissions,
          source: request.body?.source === "ai" ? "ai" : "api",
          channel,
          idempotencyKey: request.body?.idempotencyKey,
          payload: { path: "reply", conversationId: request.params.id, text: request.body?.text, channel },
          channelPolicy: { withinChannelWindow: channel === "whatsapp" ? false : true }
        });

        if (policy.handled) return reply.status(policy.statusCode).send(policy.body);

        const resolved = ensureRuntime(context);
        if (resolved.error) {
          return reply.status(503).send({ ok: false, error: "omnichannel_repository_unavailable", persistenceMode: resolved.runtime.mode, reasons: resolved.runtime.reasons });
        }

        const provider = resolved.runtime.providers.get(channel);
        if (!provider) return reply.status(503).send({ ok: false, error: "provider_unavailable", channel });

        const health = await provider.health();
        if (!health.ok) {
          return reply.status(503).send({ ok: false, error: "provider_unavailable", channel, providerMode: health.mode, reasons: health.reasons });
        }

        const providerResult = await provider.sendMessage({
          tenantId: context.tenantId,
          actorId: context.userId,
          channel,
          conversationId: request.params.id,
          source: request.body?.source ?? "api",
          text: request.body?.text ?? "",
          idempotencyKey: request.body?.idempotencyKey
        });

        const usage = await tryRecordUsage(context, {
          channel,
          conversationId: request.params.id,
          direction: providerResult.ok ? "outbound_sent" : "outbound_failed"
        });

        return reply.status(providerResult.ok ? 200 : 503).send({
          ok: providerResult.ok,
          channel,
          conversationId: request.params.id,
          providerResult,
          usage,
          mutationExecuted: false,
          externalProviderCallExecuted: false
        });
      })
  );

  server.post<{ Params: { id: string }; Body: { assignedUserId?: string } }>("/platform/omnichannel/conversations/:id/assign", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, writePermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.omnichannel.assign",
        requiredPermissions: writePermissions,
        source: "api",
        channel: "api",
        payload: { path: "assign", conversationId: request.params.id, assignedUserId: request.body?.assignedUserId }
      });

      if (policy.handled) return reply.status(policy.statusCode).send(policy.body);

      const resolved = ensureRuntime(context);
      if (resolved.error) {
        return reply.status(503).send({ ok: false, error: "omnichannel_repository_unavailable", persistenceMode: resolved.runtime.mode, reasons: resolved.runtime.reasons });
      }

      const item = await resolved.runtime.conversationRepository.assign(context.tenantId, request.params.id, request.body?.assignedUserId ?? context.userId);
      if (!item) return reply.status(404).send({ ok: false, error: "not_found" });

      return { ok: true, item, policyDecision: "allow", persistenceMode: resolved.runtime.mode };
    })
  );

  server.post<{ Params: { id: string } }>("/platform/omnichannel/conversations/:id/resolve", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, writePermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.omnichannel.resolve",
        requiredPermissions: writePermissions,
        source: "api",
        channel: "api",
        payload: { path: "resolve", conversationId: request.params.id }
      });

      if (policy.handled) return reply.status(policy.statusCode).send(policy.body);

      const resolved = ensureRuntime(context);
      if (resolved.error) {
        return reply.status(503).send({ ok: false, error: "omnichannel_repository_unavailable", persistenceMode: resolved.runtime.mode, reasons: resolved.runtime.reasons });
      }

      const item = await resolved.runtime.conversationRepository.resolve(context.tenantId, request.params.id);
      if (!item) return reply.status(404).send({ ok: false, error: "not_found" });

      const usage = await tryRecordUsage(context, { channel: item.channel, conversationId: item.id, direction: "outbound_attempt" });
      return { ok: true, item, policyDecision: "allow", persistenceMode: resolved.runtime.mode, usage };
    })
  );

  server.get("/platform/omnichannel/health", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, readPermissions)], async (context) => {
      const runtime = resolveOmnichannelRuntime(context);
      const providers = await Promise.all(
        [...runtime.providers.values()].map(async (provider) => ({ kind: provider.kind, capabilities: provider.getCapabilities(), ...(await provider.health()) }))
      );
      return {
        ok: runtime.mode !== "unsupported",
        persistenceMode: runtime.mode,
        reasons: runtime.reasons,
        providers
      };
    })
  );
}
