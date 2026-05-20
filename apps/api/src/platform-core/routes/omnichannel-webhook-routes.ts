import type { FastifyInstance } from "fastify";
import { Readable } from "node:stream";
import { hashToken } from "@hallederiz/domain";
import { verifyHmacSha256Signature } from "../../shared/webhook-security";
import { resolveOmnichannelRuntime } from "../../shared/omnichannel-runtime";
import { OmnichannelInboundService } from "../../modules/omnichannel-inbound/service";
import { resolveMetaVerifyTokenHash } from "../../modules/omnichannel-ai/service";

type RequestWithRawBody = {
  rawBody?: string;
  method: string;
  url: string;
};

const memoryWebhookKeys = new Set<string>();

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function collectRawBody(payload: AsyncIterable<Buffer | string>) {
  const chunks: Buffer[] = [];
  for await (const chunk of payload) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function createWebhookEventId() {
  return `wh_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function registerOmnichannelWebhookRoutes(server: FastifyInstance) {
  server.addHook("preParsing", async (request, _reply, payload) => {
    if (request.method !== "POST" || request.url.split("?")[0] !== "/platform/omnichannel/webhooks/meta") {
      return payload;
    }
    const buffer = await collectRawBody(payload as AsyncIterable<Buffer | string>);
    (request as unknown as RequestWithRawBody).rawBody = buffer.toString("utf8");
    const replay = Readable.from([buffer]);
    (replay as Readable & { receivedEncodedLength?: number }).receivedEncodedLength = buffer.length;
    return replay;
  });

  server.get("/platform/omnichannel/webhooks/meta", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const mode = query["hub.mode"];
    const challenge = query["hub.challenge"];
    const verifyToken = query["hub.verify_token"];

    if (mode !== "subscribe" || !challenge) {
      return reply.status(400).send({ ok: false, message: "Webhook verification parameters invalid." });
    }

    const runtime = resolveOmnichannelRuntime();
    const tokenHash = resolveMetaVerifyTokenHash(verifyToken);
    let verified = false;

    if (tokenHash && runtime.channelCredentialRepository) {
      const credential = await runtime.channelCredentialRepository.findByVerifyTokenHash(tokenHash);
      verified = Boolean(credential);
    }

    if (!verified && process.env.NODE_ENV !== "production") {
      const envHash = resolveMetaVerifyTokenHash(process.env.META_WEBHOOK_VERIFY_TOKEN);
      verified = Boolean(envHash && tokenHash && envHash === tokenHash);
    }

    if (!verified && process.env.NODE_ENV === "production") {
      return reply.status(403).send({ ok: false, message: "Webhook verify token mismatch." });
    }

    if (!verified) {
      return reply.status(403).send({ ok: false, message: "Webhook verify token mismatch." });
    }

    return reply.type("text/plain").send(challenge);
  });

  server.post<{ Body: Record<string, unknown> }>("/platform/omnichannel/webhooks/meta", async (request, reply) => {
    const rawBody = (request as unknown as RequestWithRawBody).rawBody ?? JSON.stringify(request.body ?? {});
    const signature = getHeaderValue(request.headers["x-hub-signature-256"]);
    const secret = process.env.META_WEBHOOK_APP_SECRET;

    if (process.env.NODE_ENV === "production" && !secret) {
      return reply.status(503).send({ ok: false, message: "Meta webhook secret is not configured." });
    }

    if (process.env.NODE_ENV === "production" && !signature) {
      return reply.status(403).send({ ok: false, message: "Webhook signature missing." });
    }

    if (secret && signature && !verifyHmacSha256Signature(rawBody, signature, secret)) {
      return reply.status(403).send({ ok: false, message: "Webhook signature mismatch." });
    }

    const runtime = resolveOmnichannelRuntime();
    const inbound = new OmnichannelInboundService(runtime);
    const body = request.body as Record<string, unknown>;
    const devTenant = typeof body.tenantId === "string" ? body.tenantId : "tenant_1";
    const routing = await inbound.routeMetaTenant(body, devTenant);

    if (!routing) {
      return reply.status(400).send({ ok: false, message: "Tenant routing failed." });
    }

    const idempotencyKey = hashToken(rawBody).slice(0, 48);
    const eventId = createWebhookEventId();

    if (runtime.webhookEventRepository) {
      const reserved = await runtime.webhookEventRepository.reserveEvent({
        id: eventId,
        tenantId: routing.tenantId,
        provider: routing.provider,
        eventType: "meta_inbound",
        rawPayload: body,
        signatureValid: Boolean(secret && signature),
        processingStatus: "received",
        idempotencyKey,
        receivedAt: new Date().toISOString()
      });
      if (!reserved.reserved) {
        return { ok: true, duplicate: true };
      }
    } else if (runtime.mode === "memory") {
      const memoryKey = `${routing.tenantId}:meta:${idempotencyKey}`;
      if (memoryWebhookKeys.has(memoryKey)) {
        return { ok: true, duplicate: true };
      }
      memoryWebhookKeys.add(memoryKey);
    }

    const normalizedResult = inbound.normalizeMeta(body, routing.tenantId, routing.provider);
    if (!normalizedResult.ok || !normalizedResult.normalized) {
      if (runtime.webhookEventRepository) {
        await runtime.webhookEventRepository.markFailed(eventId, normalizedResult.reasons.join(","));
      }
      return reply.status(400).send({ ok: false, reasons: normalizedResult.reasons });
    }

    try {
      const processed = await inbound.processNormalizedInbound(normalizedResult.normalized);
      if (runtime.webhookEventRepository) {
        await runtime.webhookEventRepository.markProcessed(eventId);
      }
      return { duplicate: false, ...processed };
    } catch (error) {
      const message = error instanceof Error ? error.message : "processing_failed";
      if (runtime.webhookEventRepository) {
        await runtime.webhookEventRepository.markFailed(eventId, message);
      }
      return reply.status(500).send({ ok: false, message: "Inbound processing failed." });
    }
  });
}

export function resetOmnichannelWebhookMemoryForTests() {
  memoryWebhookKeys.clear();
}
