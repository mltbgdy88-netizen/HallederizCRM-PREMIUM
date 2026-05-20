import type { OmnichannelInboundNormalizedMessage } from "@hallederiz/types";
import type { ChannelKind, ChannelProviderCapabilities, ChannelSendRequest, ChannelSendResult } from "./model";

export interface ChannelProviderAdapter {
  kind: ChannelKind;
  health(): Promise<{ ok: boolean; mode: "live" | "mock" | "degraded"; reasons: string[]; label?: string }>;
  normalizeInbound(payload: unknown): Promise<{ ok: boolean; normalized?: OmnichannelInboundNormalizedMessage; reasons: string[] }>;
  sendMessage(request: ChannelSendRequest): Promise<ChannelSendResult>;
  validateWebhook?(request: unknown): Promise<{ ok: boolean; reasons: string[] }>;
  getCapabilities(): ChannelProviderCapabilities;
}

export interface ProviderAccountBinding {
  tenantId: string;
  accountId: string;
  provider: ChannelKind;
  externalAccountId: string;
  status: string;
  hasAccessToken: boolean;
  hasAppSecret: boolean;
}

export interface ProviderFactoryConfig {
  isProduction: boolean;
  allowMock: boolean;
  metaAppSecret?: string;
  whatsappAccessTokenRef?: string;
  whatsappPhoneNumberId?: string;
  accounts: ProviderAccountBinding[];
}

function baseCaps(overrides?: Partial<ChannelProviderCapabilities>): ChannelProviderCapabilities {
  return {
    supportsInbound: true,
    supportsOutbound: true,
    supportsTemplates: false,
    supportsAttachments: true,
    supportsReadReceipts: false,
    ...overrides
  };
}

function degradedSendResult(kind: ChannelKind, request: ChannelSendRequest, reasons: string[]): ChannelSendResult {
  return {
    ok: false,
    status: "failed",
    channel: kind,
    conversationId: request.conversationId,
    providerMode: "degraded",
    reasons,
    metadata: { mutationExecuted: false, providerCallExecuted: false }
  };
}

function mockSendResult(kind: ChannelKind, request: ChannelSendRequest): ChannelSendResult {
  return {
    ok: false,
    status: "degraded",
    channel: kind,
    conversationId: request.conversationId,
    providerMode: "mock",
    reasons: [`${kind}_demo_mode_no_live_send`],
    metadata: { mutationExecuted: false, providerCallExecuted: false, dryRun: true }
  };
}

function userFacingReason(kind: ChannelKind, configured: boolean): string {
  if (configured) return "connection_ready";
  return `${kind}_configuration_required`;
}

function accountForProvider(config: ProviderFactoryConfig, kind: ChannelKind) {
  return config.accounts.find((item) => item.provider === kind && item.status === "connected");
}

export function normalizeMetaInbound(
  payload: unknown,
  defaults: { tenantId: string; provider: "facebook" | "instagram" }
): { ok: boolean; normalized?: OmnichannelInboundNormalizedMessage; reasons: string[] } {
  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const entries = Array.isArray(body.entry) ? body.entry : [];
  const entry = entries[0] as Record<string, unknown> | undefined;
  if (!entry) return { ok: false, reasons: ["meta_entry_missing"] };

  const pageId = typeof entry.id === "string" ? entry.id : "";
  const messaging = Array.isArray(entry.messaging) ? entry.messaging : [];
  const messageEvent = messaging[0] as Record<string, unknown> | undefined;
  const message = messageEvent?.message as Record<string, unknown> | undefined;
  if (!message) return { ok: false, reasons: ["meta_message_missing"] };

  const sender = messageEvent?.sender as Record<string, unknown> | undefined;
  const senderId = typeof sender?.id === "string" ? sender.id : "";
  const externalMessageId = typeof message.mid === "string" ? message.mid : `meta_${Date.now()}`;
  const text = typeof message.text === "string" ? message.text : "";
  const timestamp =
    typeof messageEvent?.timestamp === "number"
      ? new Date(messageEvent.timestamp).toISOString()
      : new Date().toISOString();

  if (!pageId || !senderId) return { ok: false, reasons: ["meta_routing_incomplete"] };

  return {
    ok: true,
    reasons: [],
    normalized: {
      tenantId: defaults.tenantId,
      provider: defaults.provider,
      externalAccountId: pageId,
      externalConversationId: `${defaults.provider}:${pageId}:${senderId}`,
      externalMessageId,
      externalUserId: senderId,
      channel: defaults.provider,
      text,
      attachments: Array.isArray(message.attachments) ? (message.attachments as Array<Record<string, unknown>>) : [],
      timestamp,
      metadata: { object: body.object }
    }
  };
}

export function createMetaGraphProvider(
  kind: "facebook" | "instagram",
  config: ProviderFactoryConfig
): ChannelProviderAdapter {
  const account = accountForProvider(config, kind);
  const liveReady = Boolean(account?.hasAccessToken && account?.hasAppSecret && config.metaAppSecret);

  return {
    kind,
    async health() {
      if (liveReady) {
        return { ok: true, mode: "live", reasons: [], label: "connection_ready" };
      }
      if (config.allowMock && !config.isProduction) {
        return { ok: false, mode: "mock", reasons: [userFacingReason(kind, false)], label: "configuration_required" };
      }
      return { ok: false, mode: "degraded", reasons: [userFacingReason(kind, false)], label: "configuration_required" };
    },
    async normalizeInbound(payload) {
      const tenantId = account?.tenantId;
      if (!tenantId) return { ok: false, reasons: ["tenant_routing_missing"] };
      return normalizeMetaInbound(payload, { tenantId, provider: kind });
    },
    async sendMessage(request) {
      if (!liveReady) {
        if (config.allowMock && !config.isProduction) return mockSendResult(kind, request);
        return degradedSendResult(kind, request, [userFacingReason(kind, false)]);
      }
      return degradedSendResult(kind, request, ["live_send_not_enabled_in_foundation"]);
    },
    getCapabilities() {
      return baseCaps({ requiresUserOptIn: true, requires24hWindow: true });
    }
  };
}

export function createWhatsAppBusinessProvider(config: ProviderFactoryConfig): ChannelProviderAdapter {
  const account = accountForProvider(config, "whatsapp");
  const liveReady = Boolean(
    account?.hasAccessToken && config.whatsappAccessTokenRef && config.whatsappPhoneNumberId
  );

  return {
    kind: "whatsapp",
    async health() {
      if (liveReady) return { ok: true, mode: "live", reasons: [], label: "connection_ready" };
      if (config.allowMock && !config.isProduction) {
        return { ok: false, mode: "mock", reasons: [userFacingReason("whatsapp", false)], label: "configuration_required" };
      }
      return { ok: false, mode: "degraded", reasons: [userFacingReason("whatsapp", false)], label: "configuration_required" };
    },
    async normalizeInbound(payload) {
      const objectPayload = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
      const tenantId = account?.tenantId ?? (typeof objectPayload.tenantId === "string" ? objectPayload.tenantId : "");
      if (!tenantId) return { ok: false, reasons: ["tenant_routing_missing"] };
      const entry = Array.isArray(objectPayload.entry) ? objectPayload.entry[0] : undefined;
      const value = entry && typeof entry === "object" ? (entry as Record<string, unknown>).changes : undefined;
      const change = Array.isArray(value) ? value[0] : undefined;
      const changeValue =
        change && typeof change === "object" ? ((change as Record<string, unknown>).value as Record<string, unknown>) : undefined;
      const messages = changeValue && Array.isArray(changeValue.messages) ? changeValue.messages : [];
      const message = messages[0] as Record<string, unknown> | undefined;
      const from = typeof message?.from === "string" ? message.from : "";
      const textBody =
        message?.text && typeof message.text === "object"
          ? String((message.text as Record<string, unknown>).body ?? "")
          : typeof objectPayload.text === "string"
            ? objectPayload.text
            : "";
      const messageId = typeof message?.id === "string" ? message.id : `wa_${Date.now()}`;
      if (!from) return { ok: false, reasons: ["whatsapp_message_missing"] };
      return {
        ok: true,
        reasons: [],
        normalized: {
          tenantId,
          provider: "whatsapp",
          externalAccountId: config.whatsappPhoneNumberId ?? "whatsapp",
          externalConversationId: `whatsapp:${from}`,
          externalMessageId: messageId,
          externalUserId: from,
          channel: "whatsapp",
          text: textBody,
          attachments: [],
          timestamp: new Date().toISOString(),
          metadata: {}
        }
      };
    },
    async sendMessage(request) {
      if (!liveReady) {
        if (config.allowMock && !config.isProduction) return mockSendResult("whatsapp", request);
        return degradedSendResult("whatsapp", request, [userFacingReason("whatsapp", false)]);
      }
      return degradedSendResult("whatsapp", request, ["live_send_not_enabled_in_foundation"]);
    },
    getCapabilities() {
      return baseCaps({ requires24hWindow: true, requiresSignature: true, supportsTemplates: true });
    }
  };
}

export function createMockProvider(kind: ChannelKind, caps?: Partial<ChannelProviderCapabilities>): ChannelProviderAdapter {
  return {
    kind,
    async health() {
      return { ok: false, mode: "mock", reasons: [userFacingReason(kind, false)], label: "configuration_required" };
    },
    async normalizeInbound(payload) {
      const objectPayload = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
      const tenantId = typeof objectPayload.tenantId === "string" ? objectPayload.tenantId : "";
      if (!tenantId) return { ok: false, reasons: ["tenant_routing_missing"] };
      return {
        ok: true,
        reasons: [],
        normalized: {
          tenantId,
          provider: kind,
          externalAccountId: `${kind}_demo`,
          externalConversationId: typeof objectPayload.conversationId === "string" ? objectPayload.conversationId : `${kind}:demo`,
          externalMessageId: `mock_${Date.now()}`,
          externalUserId: "demo_user",
          channel: kind,
          text: typeof objectPayload.text === "string" ? objectPayload.text : "",
          attachments: [],
          timestamp: new Date().toISOString(),
          metadata: {}
        }
      };
    },
    async sendMessage(request) {
      return mockSendResult(kind, request);
    },
    getCapabilities() {
      return baseCaps(caps);
    }
  };
}

export const internalNoteProvider: ChannelProviderAdapter = {
  kind: "internal_note",
  async health() {
    return { ok: true, mode: "mock", reasons: [], label: "connection_ready" };
  },
  async normalizeInbound(payload) {
    const objectPayload = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const tenantId = typeof objectPayload.tenantId === "string" ? objectPayload.tenantId : "";
    if (!tenantId) return { ok: false, reasons: ["tenant_routing_missing"] };
    return {
      ok: true,
      reasons: [],
      normalized: {
        tenantId,
        provider: "internal_note",
        externalAccountId: "internal",
        externalConversationId: typeof objectPayload.conversationId === "string" ? objectPayload.conversationId : "internal:note",
        externalMessageId: `note_${Date.now()}`,
        externalUserId: "system",
        channel: "internal_note",
        text: typeof objectPayload.text === "string" ? objectPayload.text : "",
        attachments: [],
        timestamp: new Date().toISOString(),
        metadata: {}
      }
    };
  },
  async sendMessage(request) {
    return {
      ok: true,
      status: "dry_run",
      channel: "internal_note",
      conversationId: request.conversationId,
      providerMode: "mock",
      reasons: ["internal_note_recorded"],
      metadata: { mutationExecuted: false, providerCallExecuted: false, dryRun: true }
    };
  },
  getCapabilities() {
    return baseCaps({ supportsInbound: false, supportsOutbound: true });
  }
};

export function createProviderAdapters(config: ProviderFactoryConfig): Map<string, ChannelProviderAdapter> {
  const providers: ChannelProviderAdapter[] = [
    createWhatsAppBusinessProvider(config),
    createMetaGraphProvider("instagram", config),
    createMetaGraphProvider("facebook", config),
    createMockProvider("web_chat"),
    createMockProvider("email", { supportsAttachments: true }),
    createMockProvider("sms", { supportsAttachments: false }),
    internalNoteProvider
  ];

  if (config.allowMock && !config.isProduction) {
    // Explicit demo mock path only; never used as silent production fallback.
  }

  return new Map(providers.map((provider) => [provider.kind, provider] as const));
}

/** @deprecated Use createProviderAdapters with explicit config */
export function getDefaultProviderAdapters() {
  return createProviderAdapters({
    isProduction: process.env.NODE_ENV === "production",
    allowMock: process.env.OMNICHANNEL_ALLOW_MOCK_PROVIDERS === "true",
    metaAppSecret: process.env.META_WEBHOOK_APP_SECRET,
    whatsappAccessTokenRef: process.env.WHATSAPP_ACCESS_TOKEN_REF,
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accounts: []
  });
}

export const instagramMockProvider = createMockProvider("instagram", { requiresUserOptIn: true });
export const facebookMockProvider = createMockProvider("facebook", { requiresUserOptIn: true });
export const webChatMockProvider = createMockProvider("web_chat", {});
export const emailMockProvider = createMockProvider("email", { supportsAttachments: true });
export const smsMockProvider = createMockProvider("sms", { supportsAttachments: false });
