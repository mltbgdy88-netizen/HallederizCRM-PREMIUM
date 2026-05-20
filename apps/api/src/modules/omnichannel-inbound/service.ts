import type { OmnichannelInboundNormalizedMessage } from "@hallederiz/types";
import { normalizeMetaInbound } from "@hallederiz/domain";
import type { OmnichannelRuntimeResolution } from "../../shared/omnichannel-runtime";
import {
  mapInboundToConversationId,
  mapInboundToMessageId,
  OmnichannelAiService
} from "../omnichannel-ai/service";

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class OmnichannelInboundService {
  constructor(private readonly runtime: OmnichannelRuntimeResolution) {}

  async processNormalizedInbound(normalized: OmnichannelInboundNormalizedMessage) {
    if (!this.runtime.conversationRepository || !this.runtime.messageRepository) {
      return { ok: false, reason: "omnichannel_repository_unavailable" };
    }

    const conversationId = mapInboundToConversationId(normalized);
    const messageId = mapInboundToMessageId(normalized);
    const at = normalized.timestamp || nowIso();

    await this.runtime.conversationRepository.save({
      id: conversationId,
      tenantId: normalized.tenantId,
      channel: normalized.channel as any,
      externalConversationId: normalized.externalConversationId,
      contactHandle: normalized.contactUsername ?? normalized.externalUserId,
      contactDisplayName: normalized.contactDisplayName ?? normalized.externalUserId,
      status: "open",
      tags: [],
      lastMessageAt: at,
      createdAt: at,
      updatedAt: at,
      metadata: normalized.metadata ?? {}
    });

    if (this.runtime.socialContactRepository) {
      await this.runtime.socialContactRepository.upsertContact({
        id: createId("social_contact"),
        tenantId: normalized.tenantId,
        provider: normalized.provider,
        externalUserId: normalized.externalUserId,
        displayName: normalized.contactDisplayName,
        username: normalized.contactUsername,
        metadata: {},
        createdAt: at,
        updatedAt: at
      });
    }

    await this.runtime.messageRepository.append({
      id: messageId,
      tenantId: normalized.tenantId,
      conversationId,
      channel: normalized.channel as any,
      externalMessageId: normalized.externalMessageId,
      direction: "inbound",
      authorType: "customer",
      authorId: normalized.externalUserId,
      text: normalized.text,
      attachments: normalized.attachments ?? [],
      status: "received",
      metadata: normalized.metadata ?? {},
      createdAt: at
    });

    if (this.runtime.aiChatSessionRepository) {
      await this.runtime.aiChatSessionRepository.getOrCreateForConversation({
        id: createId("ai_session"),
        tenantId: normalized.tenantId,
        conversationId,
        channel: normalized.channel,
        status: "open",
        metadata: {},
        createdAt: at,
        updatedAt: at
      });
    }

    const ai = new OmnichannelAiService(this.runtime);
    await ai.enqueueAiJobsForInboundMessage({
      tenantId: normalized.tenantId,
      conversationId,
      messageId,
      channel: normalized.channel,
      text: normalized.text
    });

    return { ok: true, conversationId, messageId, duplicate: false };
  }

  resolveMetaProvider(objectType: string | undefined): "facebook" | "instagram" | null {
    if (objectType === "page") return "facebook";
    if (objectType === "instagram") return "instagram";
    return null;
  }

  async routeMetaTenant(payload: unknown, devTenantFallback?: string) {
    const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const entries = Array.isArray(body.entry) ? body.entry : [];
    const entry = entries[0] as Record<string, unknown> | undefined;
    const pageId = typeof entry?.id === "string" ? entry.id : "";

    if (pageId && this.runtime.socialMediaAccountRepository) {
      const facebook = await this.runtime.socialMediaAccountRepository.findByExternalAccount("facebook", pageId);
      if (facebook) return { tenantId: facebook.tenantId, provider: "facebook" as const };
      const instagram = await this.runtime.socialMediaAccountRepository.findByExternalAccount("instagram", pageId);
      if (instagram) return { tenantId: instagram.tenantId, provider: "instagram" as const };
    }

    if (process.env.NODE_ENV !== "production" && devTenantFallback) {
      const provider = this.resolveMetaProvider(typeof body.object === "string" ? body.object : undefined) ?? "facebook";
      return { tenantId: devTenantFallback, provider };
    }

    return null;
  }

  normalizeMeta(payload: unknown, tenantId: string, provider: "facebook" | "instagram") {
    return normalizeMetaInbound(payload, { tenantId, provider });
  }

  async bridgeWhatsAppInbound(input: {
    tenantId: string;
    from: string;
    messageId: string;
    text: string;
  }) {
    const normalized: OmnichannelInboundNormalizedMessage = {
      tenantId: input.tenantId,
      provider: "whatsapp",
      externalAccountId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "whatsapp",
      externalConversationId: `whatsapp:${input.from}`,
      externalMessageId: input.messageId,
      externalUserId: input.from,
      channel: "whatsapp",
      text: input.text,
      attachments: [],
      timestamp: nowIso(),
      metadata: { bridge: "whatsapp_webhook" }
    };
    return this.processNormalizedInbound(normalized);
  }
}
