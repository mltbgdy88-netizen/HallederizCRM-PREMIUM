import { recordAiRequestUsage } from "@hallederiz/domain";
import type { SalesAiTrainingScope } from "@hallederiz/ai-contracts";
import type { FastifyInstance } from "fastify";
import { AiRuntimeService } from "../../modules/ai-runtime/service";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { enforcePolicyForRoute } from "../../shared/policy-route-enforcement";
import { resolveSalesAiKnowledgeRepository } from "../../shared/sales-ai-runtime";
import { resolveTenantUsageLedger } from "../../shared/tenant-usage-runtime";

const knowledgeReadPermissions = ["ai.settings.read", "platform.settings.read", "settings.read"] as const;
const knowledgeWritePermissions = ["ai.settings.write", "platform.settings.write", "settings.manage"] as const;
const assistantPermissions = ["ai.actions.write", "ai.actions.read", "platform.settings.read"] as const;

function sanitizeKnowledgePayload(body: Partial<SalesAiTrainingScope>, tenantId: string) {
  return {
    tenantId,
    productId: body.productId,
    productName: body.productName?.trim() ?? "",
    category: body.category?.trim(),
    description: body.description?.trim(),
    salesNotes: body.salesNotes?.trim(),
    allowedClaims: Array.isArray(body.allowedClaims) ? body.allowedClaims.map(String) : [],
    blockedClaims: Array.isArray(body.blockedClaims) ? body.blockedClaims.map(String) : [],
    priceVisibility: body.priceVisibility === "visible" ? "visible" : "hidden",
    stockVisibility: body.stockVisibility === "visible" ? "visible" : "hidden",
    faqSnippets: Array.isArray(body.faqSnippets) ? body.faqSnippets.map(String) : [],
    selectedDocuments: Array.isArray(body.selectedDocuments) ? body.selectedDocuments.map(String) : []
  } as Omit<SalesAiTrainingScope, "id" | "createdAt" | "updatedAt">;
}

function sanitizeKnowledgePatch(body: Partial<SalesAiTrainingScope>) {
  const patch: Partial<Omit<SalesAiTrainingScope, "id" | "tenantId" | "createdAt" | "updatedAt">> = {};
  if (body.productId !== undefined) patch.productId = body.productId;
  if (body.productName !== undefined) patch.productName = body.productName.trim();
  if (body.category !== undefined) patch.category = body.category?.trim();
  if (body.description !== undefined) patch.description = body.description?.trim();
  if (body.salesNotes !== undefined) patch.salesNotes = body.salesNotes?.trim();
  if (body.allowedClaims !== undefined) patch.allowedClaims = Array.isArray(body.allowedClaims) ? body.allowedClaims.map(String) : [];
  if (body.blockedClaims !== undefined) patch.blockedClaims = Array.isArray(body.blockedClaims) ? body.blockedClaims.map(String) : [];
  if (body.priceVisibility !== undefined) patch.priceVisibility = body.priceVisibility === "visible" ? "visible" : "hidden";
  if (body.stockVisibility !== undefined) patch.stockVisibility = body.stockVisibility === "visible" ? "visible" : "hidden";
  if (body.faqSnippets !== undefined) patch.faqSnippets = Array.isArray(body.faqSnippets) ? body.faqSnippets.map(String) : [];
  if (body.selectedDocuments !== undefined) patch.selectedDocuments = Array.isArray(body.selectedDocuments) ? body.selectedDocuments.map(String) : [];
  return patch;
}

export async function registerAiSalesRoutes(server: FastifyInstance) {
  server.get("/platform/ai/sales-assistant/health", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, assistantPermissions)], async (context) => {
      const service = new AiRuntimeService(context);
      const health = await service.getSalesAssistantHealth();
      return {
        item: health
      };
    })
  );

  server.post<{ Body: { message?: string } }>("/platform/ai/sales-assistant/classify-intent", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, assistantPermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.ai.sales_assistant.classify_intent",
        requiredPermissions: assistantPermissions
      });
      if (policy.handled) {
        return reply.status(policy.statusCode).send(policy.body);
      }
      const message = request.body?.message?.trim() ?? "";
      if (!message) {
        return reply.status(400).send({ message: "message alani zorunludur." });
      }
      const service = new AiRuntimeService(context);
      const item = await service.classifySalesIntent({ message });
      return { item };
    })
  );

  server.post<{ Body: { message?: string; customerId?: string; channel?: "web" | "whatsapp" | "omnichannel" | "api" } }>(
    "/platform/ai/sales-assistant/chat",
    async (request, reply) =>
      withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, assistantPermissions)], async (context) => {
        const policy = await enforcePolicyForRoute(context, {
          actionKey: "platform.ai.sales_assistant.chat",
          requiredPermissions: assistantPermissions
        });
        if (policy.handled) {
          return reply.status(policy.statusCode).send(policy.body);
        }

        const message = request.body?.message?.trim() ?? "";
        if (!message) {
          return reply.status(400).send({ message: "message alani zorunludur." });
        }

        const repositoryResolution = resolveSalesAiKnowledgeRepository(context);
        if (!repositoryResolution.repository) {
          return reply.status(503).send({
            ok: false,
            status: "not_configured",
            message: "Sales AI knowledge persistence is unavailable.",
            knowledgePersistenceMode: repositoryResolution.mode,
            knowledgePersistenceSkipped: repositoryResolution.skipped,
            reasons: repositoryResolution.reasons,
            mutationExecuted: false,
            externalProviderCallExecuted: false
          });
        }

        const knowledge = await repositoryResolution.repository.listByTenant(context.tenantId);
        const service = new AiRuntimeService(context);
        const item = await service.chatSalesAssistant({
          message,
          customerId: request.body?.customerId,
          channel: request.body?.channel ?? "api",
          knowledge
        });

        const usageResolution = resolveTenantUsageLedger(context);
        if (usageResolution.ledger) {
          try {
            await recordAiRequestUsage(usageResolution.ledger, {
              tenantId: context.tenantId,
              source: "sales_assistant_chat",
              metadata: {
                intent: item.intent,
                status: item.status,
                provider: item.provider.provider,
                model: item.provider.effectiveModel ?? item.provider.model
              }
            });
          } catch {
            // usage yazimi kritik akisi fail-open etmez; metadata ile raporlanir.
          }
        }

        return {
          item,
          knowledgeCount: knowledge.length,
          knowledgePersistenceMode: repositoryResolution.mode
        };
      })
  );

  server.post<{ Body: { audioBase64?: string; mimeType?: string; language?: string } }>(
    "/platform/ai/sales-assistant/voice/transcribe",
    async (request, reply) =>
      withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, assistantPermissions)], async (context) => {
        const policy = await enforcePolicyForRoute(context, {
          actionKey: "platform.ai.sales_assistant.voice.transcribe",
          requiredPermissions: assistantPermissions
        });
        if (policy.handled) {
          return reply.status(policy.statusCode).send(policy.body);
        }
        const service = new AiRuntimeService(context);
        const item = await service.transcribeSalesVoice({
          audioBase64: request.body?.audioBase64 ?? "",
          mimeType: request.body?.mimeType,
          language: request.body?.language ?? "tr"
        });
        return { item };
      })
  );

  server.post<{ Body: { text?: string; voice?: string; speed?: number } }>(
    "/platform/ai/sales-assistant/voice/speak",
    async (request, reply) =>
      withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, assistantPermissions)], async (context) => {
        const policy = await enforcePolicyForRoute(context, {
          actionKey: "platform.ai.sales_assistant.voice.speak",
          requiredPermissions: assistantPermissions
        });
        if (policy.handled) {
          return reply.status(policy.statusCode).send(policy.body);
        }
        const text = request.body?.text?.trim() ?? "";
        if (!text) {
          return reply.status(400).send({ message: "text alani zorunludur." });
        }
        const service = new AiRuntimeService(context);
        const item = await service.speakSalesVoice({
          text,
          voice: request.body?.voice,
          speed: request.body?.speed
        });
        return { item };
      })
  );

  server.get("/platform/ai/sales-knowledge", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, knowledgeReadPermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.ai.sales_knowledge.read",
        requiredPermissions: knowledgeReadPermissions
      });
      if (policy.handled) {
        return reply.status(policy.statusCode).send(policy.body);
      }
      const resolution = resolveSalesAiKnowledgeRepository(context);
      if (!resolution.repository) {
        return reply.status(503).send({
          ok: false,
          message: "Sales AI knowledge repository unavailable.",
          knowledgePersistenceMode: resolution.mode,
          knowledgePersistenceSkipped: resolution.skipped,
          reasons: resolution.reasons
        });
      }
      const items = await resolution.repository.listByTenant(context.tenantId);
      return {
        items,
        total: items.length,
        knowledgePersistenceMode: resolution.mode
      };
    })
  );

  server.post<{ Body: Partial<SalesAiTrainingScope> }>("/platform/ai/sales-knowledge", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, knowledgeWritePermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.ai.sales_knowledge.write",
        requiredPermissions: knowledgeWritePermissions
      });
      if (policy.handled) {
        return reply.status(policy.statusCode).send(policy.body);
      }
      const resolution = resolveSalesAiKnowledgeRepository(context);
      if (!resolution.repository) {
        return reply.status(503).send({
          ok: false,
          message: "Sales AI knowledge repository unavailable.",
          knowledgePersistenceMode: resolution.mode,
          knowledgePersistenceSkipped: resolution.skipped,
          reasons: resolution.reasons
        });
      }
      const payload = sanitizeKnowledgePayload(request.body ?? {}, context.tenantId);
      if (!payload.productName) {
        return reply.status(400).send({ message: "productName alani zorunludur." });
      }
      const item = await resolution.repository.create(payload);
      return reply.status(201).send({
        item,
        knowledgePersistenceMode: resolution.mode
      });
    })
  );

  server.patch<{ Params: { id: string }; Body: Partial<SalesAiTrainingScope> }>("/platform/ai/sales-knowledge/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, knowledgeWritePermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.ai.sales_knowledge.write",
        requiredPermissions: knowledgeWritePermissions
      });
      if (policy.handled) {
        return reply.status(policy.statusCode).send(policy.body);
      }
      const resolution = resolveSalesAiKnowledgeRepository(context);
      if (!resolution.repository) {
        return reply.status(503).send({
          ok: false,
          message: "Sales AI knowledge repository unavailable.",
          knowledgePersistenceMode: resolution.mode,
          knowledgePersistenceSkipped: resolution.skipped,
          reasons: resolution.reasons
        });
      }
      const patch = sanitizeKnowledgePatch(request.body ?? {});
      const item = await resolution.repository.patch(context.tenantId, request.params.id, patch);
      if (!item) {
        return reply.status(404).send({ message: "Sales AI knowledge kaydi bulunamadi." });
      }
      return {
        item,
        knowledgePersistenceMode: resolution.mode
      };
    })
  );

  server.delete<{ Params: { id: string } }>("/platform/ai/sales-knowledge/:id", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, knowledgeWritePermissions)], async (context) => {
      const policy = await enforcePolicyForRoute(context, {
        actionKey: "platform.ai.sales_knowledge.write",
        requiredPermissions: knowledgeWritePermissions
      });
      if (policy.handled) {
        return reply.status(policy.statusCode).send(policy.body);
      }
      const resolution = resolveSalesAiKnowledgeRepository(context);
      if (!resolution.repository) {
        return reply.status(503).send({
          ok: false,
          message: "Sales AI knowledge repository unavailable.",
          knowledgePersistenceMode: resolution.mode,
          knowledgePersistenceSkipped: resolution.skipped,
          reasons: resolution.reasons
        });
      }
      const deleted = await resolution.repository.delete(context.tenantId, request.params.id);
      if (!deleted) {
        return reply.status(404).send({ message: "Sales AI knowledge kaydi bulunamadi." });
      }
      return {
        ok: true,
        id: request.params.id,
        knowledgePersistenceMode: resolution.mode
      };
    })
  );
}
