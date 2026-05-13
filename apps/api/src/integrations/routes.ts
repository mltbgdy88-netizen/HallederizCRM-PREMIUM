import type { FastifyInstance } from "fastify";
import { Readable } from "node:stream";
import { hashInboundMessageContent, parseWhatsAppApprovalCommand } from "@hallederiz/domain";
import type { ErpConnection, ErpMapping, FactoryOrder, WhatsAppActionRequest, WhatsAppMessage } from "@hallederiz/types";
import { IntegrationsService } from "../modules/integrations/service";
import { whatsAppWorkflowStoreService } from "../modules/whatsapp-workflow/store";
import { requireTenantPermissionGuards, withGuards } from "../shared/auth-guards";
import { AiRuntimeService } from "../modules/ai-runtime/service";
import { getLocalAgentStatus } from "../ai-local-output-store";
import { readPermissions, requireReadAccess } from "../shared/read-guards";
import { enforcePolicyForRoute } from "../shared/policy-route-enforcement";

type RequestWithRawBody = {
  rawBody?: string;
  method: string;
  url: string;
};

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type WhatsAppWebhookBody = Record<string, unknown> & {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string;
          id?: string;
          type?: string;
          text?: { body?: string };
        }>;
      };
    }>;
  }>;
  from?: string;
  messageId?: string;
  tenantId?: string;
  tenantSlug?: string;
  text?: string;
};

async function collectRawBody(payload: AsyncIterable<Buffer | string>) {
  const chunks: Buffer[] = [];
  for await (const chunk of payload) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function resolveWebhookTenantId(event: WhatsAppWebhookBody): string | undefined {
  const tenantId = typeof event.tenantId === "string" ? event.tenantId.trim() : "";
  if (tenantId) {
    return tenantId;
  }

  const tenantSlug = typeof event.tenantSlug === "string" ? event.tenantSlug.trim() : "";
  if (tenantSlug) {
    return tenantSlug;
  }

  return undefined;
}

function extractWhatsAppWebhookMessage(event: WhatsAppWebhookBody, tenantId: string) {
  const message = event.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const text = message?.text?.body ?? event.text ?? "";
  const from = message?.from ?? event.from ?? "";
  const messageType = message?.type ?? "text";
  const contentHash = hashInboundMessageContent({ from, messageType, text });
  const messageId = message?.id ?? event.messageId ?? `wa_msg_${contentHash.slice(0, 24)}`;
  return {
    contentHash,
    from,
    messageBody: String(text),
    messageId: String(messageId),
    messageType,
    tenantId: String(tenantId)
  };
}

export async function registerIntegrationRoutes(server: FastifyInstance) {
  server.addHook("preParsing", async (request, _reply, payload) => {
    if (request.method !== "POST" || request.url.split("?")[0] !== "/whatsapp/webhook") return payload;
    const buffer = await collectRawBody(payload as AsyncIterable<Buffer | string>);
    (request as unknown as RequestWithRawBody).rawBody = buffer.toString("utf8");
    const replay = Readable.from([buffer]);
    (replay as Readable & { receivedEncodedLength?: number }).receivedEncodedLength = buffer.length;
    return replay;
  });

  server.get("/whatsapp/webhook", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const mode = query["hub.mode"];
    const challenge = query["hub.challenge"];
    const verifyToken = query["hub.verify_token"];
    if (mode !== "subscribe" || !challenge) {
      return reply.status(400).send({ message: "Webhook verification parameters invalid." });
    }
    const service = new IntegrationsService({
      tenantId: "tenant_1",
      userId: "system",
      persistenceMode: "demo"
    });
    if (!service.verifyWhatsAppWebhookToken(verifyToken)) {
      return reply.status(403).send({ message: "Webhook verify token mismatch." });
    }
    return reply.type("text/plain").send(challenge);
  });

  server.post<{ Body: Record<string, unknown> }>("/whatsapp/webhook", async (request, reply) => {
    const rawBody = (request as unknown as RequestWithRawBody).rawBody;
    const signature = getHeaderValue(request.headers["x-hub-signature-256"]) ?? getHeaderValue(request.headers["x-whatsapp-signature"]);
    const secret = process.env.WHATSAPP_WEBHOOK_APP_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
      return reply.status(503).send({ message: "WhatsApp webhook secret is not configured." });
    }
    const service = new IntegrationsService({
      tenantId: "tenant_1",
      userId: "system",
      persistenceMode: "demo"
    });
    if (secret && !service.verifyWhatsAppWebhookSignature(rawBody ?? "", signature)) {
      return reply.status(403).send({ message: "Webhook signature mismatch." });
    }
    const event = request.body as WhatsAppWebhookBody;
    const resolvedTenantId = resolveWebhookTenantId(event);
    if (!resolvedTenantId && process.env.NODE_ENV === "production") {
      return reply.status(400).send({ message: "Webhook tenant context is required." });
    }
    const tenantId = resolvedTenantId ?? "tenant_1";
    const { contentHash, from, messageBody, messageId } = extractWhatsAppWebhookMessage(event, tenantId);
    const at = new Date().toISOString();
    const shouldTrackWorkflow = Boolean(from || messageBody);
    const workflowPayload = { at, contentHash, from, id: messageId };

    if (shouldTrackWorkflow) {
      const reservation = await whatsAppWorkflowStoreService.reserveInboundMessage(tenantId, workflowPayload);
      if (!reservation.reserved) {
        return {
          ok: true,
          duplicate: true,
          duplicateReason: reservation.reason,
          outbound: [],
          messageId,
          contentHash,
          workflowReserved: false
        };
      }

      try {
        const parsedCommand = parseWhatsAppApprovalCommand(messageBody);
        if (parsedCommand.command && parsedCommand.referenceCode && parsedCommand.rawToken) {
          const commandResult = await whatsAppWorkflowStoreService.handleApprovalCommand(tenantId, {
            command: parsedCommand.command,
            fromPhone: from,
            rawToken: parsedCommand.rawToken,
            referenceCode: parsedCommand.referenceCode
          });
          await whatsAppWorkflowStoreService.markProcessed(tenantId, workflowPayload);
          return {
            ok: true,
            commandResult,
            duplicate: false,
            messageId,
            contentHash,
            outbound: commandResult.outboundMessage ? [commandResult.outboundMessage] : [],
            workflowReserved: true
          };
        }

        if (parsedCommand.command && parsedCommand.parseError && parsedCommand.parseError !== "not_command") {
          const commandResult = {
            ok: false,
            command: parsedCommand.command,
            referenceCode: parsedCommand.referenceCode,
            reason: parsedCommand.parseError,
            outboundMessage: "Komut dogrulanamadi. Lutfen ONAY/RED/INCELE, referans kodu ve guvenlik kodunu birlikte gonderin."
          };
          await whatsAppWorkflowStoreService.markProcessed(tenantId, workflowPayload);
          return {
            ok: true,
            commandResult,
            duplicate: false,
            messageId,
            contentHash,
            outbound: [commandResult.outboundMessage],
            workflowReserved: true
          };
        }

        if (messageBody) {
          await service.receiveWhatsAppInbound({ body: messageBody, type: "text" });
        }
        await whatsAppWorkflowStoreService.markProcessed(tenantId, workflowPayload);
      } catch (error) {
        await whatsAppWorkflowStoreService.releaseProcessing(tenantId, workflowPayload);
        throw error;
      }

      return { ok: true, duplicate: false, messageId, contentHash, workflowReserved: true };
    }
    return { ok: true, duplicate: false, workflowReserved: false };
  });

  server.get("/whatsapp/conversations", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      const items = service.listWhatsAppConversations();
      return { items, total: items.length };
    })
  );

  server.get<{ Params: { id: string } }>("/whatsapp/conversations/:id", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      const conversation = service.getWhatsAppConversation(request.params.id);
      if (!conversation.conversation) return reply.status(404).send({ message: "Conversation not found" });
      return { item: conversation };
    })
  );

  server.post<{ Body: Partial<WhatsAppMessage> }>("/whatsapp/inbound", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "whatsapp.write"], () => request.body?.tenantId), async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.receiveWhatsAppInbound(request.body) });
    })
  );

  server.post<{ Body: Partial<WhatsAppMessage> }>("/whatsapp/outbound", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "whatsapp.write"], () => request.body?.tenantId), async (context) => {
      const policyResult = await enforcePolicyForRoute(context, {
        actionKey: "platform.whatsapp.reply",
        requiredPermissions: ["integrations.write", "whatsapp.write"],
        tenantId: request.body?.tenantId,
        channel: "whatsapp",
        source: "api",
        channelPolicy: { signatureVerified: true, withinChannelWindow: true },
        payload: { conversationId: request.body?.conversationId }
      });
      if (policyResult.handled) {
        return reply.status(policyResult.statusCode).send(policyResult.body);
      }

      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: await service.sendWhatsAppOutbound(request.body) });
    })
  );

  server.post<{ Body: Partial<WhatsAppActionRequest> }>("/whatsapp/action-requests", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "approvals.write"], () => request.body?.tenantId), async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.createWhatsAppActionRequest(request.body) });
    })
  );

  server.post<{ Params: { id: string } }>("/whatsapp/action-requests/:id/confirm", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "approvals.write"]), async (context) => {
      const policyResult = await enforcePolicyForRoute(context, {
        actionKey: "platform.whatsapp.approval_command",
        requiredPermissions: ["integrations.write", "approvals.write"],
        channel: "whatsapp",
        source: "whatsapp",
        channelPolicy: {
          signatureVerified: true,
          approvalTokenVerified: true,
          phoneVerified: true,
          withinChannelWindow: true
        },
        payload: { requestId: request.params.id }
      });
      if (policyResult.handled) {
        return reply.status(policyResult.statusCode).send(policyResult.body);
      }

      const service = new IntegrationsService(context);
      const item = service.confirmWhatsAppActionRequest(request.params.id);
      if (!item) return reply.status(404).send({ message: "Action request not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/whatsapp/action-requests/:id/reject", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "approvals.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const item = service.rejectWhatsAppActionRequest(request.params.id);
      if (!item) return reply.status(404).send({ message: "Action request not found" });
      return { item };
    })
  );

  server.get("/whatsapp/templates", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listWhatsAppTemplates() };
    })
  );

  server.get("/erp/connections", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      const items = service.listErpConnections();
      return { items, total: items.length };
    })
  );

  server.get<{ Params: { id: string } }>("/erp/connections/:id", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      const item = service.getErpConnection(request.params.id);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.post<{ Body: Partial<ErpConnection> }>("/erp/connections", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "erp.write"], () => request.body?.tenantId), async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.createErpConnection(request.body) });
    })
  );

  server.patch<{ Params: { id: string }; Body: Partial<ErpConnection> }>("/erp/connections/:id", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "erp.write"], () => request.body?.tenantId), async (context) => {
      const service = new IntegrationsService(context);
      const item = service.patchErpConnection(request.params.id, request.body);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/erp/connections/:id/test", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "erp.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const item = await service.testErpConnection(request.params.id);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/erp/connections/:id/sync", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "erp.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const item = await service.syncErpConnection(request.params.id);
      if (!item) return reply.status(404).send({ message: "ERP connection not found" });
      return { item };
    })
  );

  server.get("/erp/mappings", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listErpMappings() };
    })
  );

  server.patch<{ Body: ErpMapping[] }>("/erp/mappings", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "erp.write"]), async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.patchErpMappings(request.body) };
    })
  );

  server.get("/erp/logs", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listErpLogs() };
    })
  );

  server.get("/erp/templates", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listErpTemplates() };
    })
  );

  server.get("/factories", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listFactories() };
    })
  );

  server.get<{ Params: { id: string } }>("/factories/:id/stocks", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { items: service.listFactoryStocks(request.params.id) };
    })
  );

  server.post<{ Params: { id: string } }>("/factories/:id/sync-stock", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "factory.write"]), async (context) => {
      const service = new IntegrationsService(context);
      return { item: await service.syncFactoryStock(request.params.id) };
    })
  );

  server.get("/factory-orders", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      const items = service.listFactoryOrders();
      return { items, total: items.length };
    })
  );

  server.get<{ Params: { id: string } }>("/factory-orders/:id", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      const item = service.getFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Body: Partial<FactoryOrder> }>("/factory-orders", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "factory.write", "orders.write"], () => request.body?.tenantId), async (context) => {
      const service = new IntegrationsService(context);
      return reply.status(201).send({ item: service.createFactoryOrder(request.body) });
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/send", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "factory.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const item = await service.sendFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/confirm", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "factory.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const item = service.confirmFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/mark-shipped", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "factory.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const item = service.markFactoryOrderShipped(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.post<{ Params: { id: string } }>("/factory-orders/:id/complete", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "factory.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const item = service.completeFactoryOrder(request.params.id);
      if (!item) return reply.status(404).send({ message: "Factory order not found" });
      return { item };
    })
  );

  server.get("/integrations/factories/health", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { item: service.getFactoryIntegrationHealth() };
    })
  );

  server.get("/health/whatsapp", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { item: service.getWhatsAppHealth() };
    })
  );

  server.post("/health/whatsapp/test-send", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "whatsapp.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const message = await service.sendWhatsAppOutbound({
        conversationId: "wa_conv_1",
        body: "Staging test mesaji (dry-run).",
        type: "text"
      });
      return {
        item: {
          ok: message.status === "sent" || message.status === "queued",
          mode: service.getWhatsAppHealth().mode,
          messageStatus: message.status,
          reason: message.status === "sent" ? "Canli gonderim basarili." : "Fallback queue modunda calisti.",
          lastCheckedAt: new Date().toISOString(),
          details: { messageId: message.id }
        }
      };
    })
  );

  server.get("/health/erp", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { item: service.getErpHealth() };
    })
  );

  server.post<{ Body: { connectionId?: string } }>("/health/erp/test", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "erp.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const connectionId = request.body?.connectionId ?? "erp_conn_1";
      const test = await service.testErpConnection(connectionId);
      if (!test) return reply.status(404).send({ message: "ERP connection not found" });
      return {
        item: {
          ok: test.lastTestResult === "success",
          mode: service.getErpHealth().mode,
          reason: test.lastTestResult === "success" ? "ERP baglanti testi basarili." : "ERP baglanti testi basarisiz.",
          lastCheckedAt: new Date().toISOString(),
          details: test
        }
      };
    })
  );

  server.get("/health/factory", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      return { item: service.getFactoryHealth() };
    })
  );

  server.post<{ Body: { factoryId?: string } }>("/health/factory/test-sync", async (request, reply) =>
    withGuards(request, reply, requireTenantPermissionGuards(["integrations.write", "factory.write"]), async (context) => {
      const service = new IntegrationsService(context);
      const factoryId = request.body?.factoryId ?? "factory_1";
      const sync = await service.syncFactoryStock(factoryId);
      return {
        item: {
          ok: Boolean(sync),
          mode: service.getFactoryHealth().mode,
          reason: "Factory stock sync dry-run tamamlandi.",
          lastCheckedAt: new Date().toISOString(),
          details: sync
        }
      };
    })
  );

  server.get("/health/integrations", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.integrations), async (context) => {
      const service = new IntegrationsService(context);
      const aiHealth = new AiRuntimeService(context).getHealth();
      const localAgent = getLocalAgentStatus();
      const summary = service.getIntegrationsHealthSummary();
      return {
        item: {
          ...summary,
          services: [
            ...summary.services,
            aiHealth,
            {
              service: "local-agent",
              status: localAgent.status === "online" ? "healthy" : localAgent.status === "safe_mode" ? "degraded" : localAgent.status === "disabled" ? "disabled" : "error",
              mode: localAgent.status === "disabled" ? "disabled" : localAgent.status === "online" ? "live" : "fallback",
              configured: true,
              reason: localAgent.message,
              lastCheckedAt: localAgent.checkedAt,
              details: localAgent
            }
          ]
        }
      };
    })
  );
}
