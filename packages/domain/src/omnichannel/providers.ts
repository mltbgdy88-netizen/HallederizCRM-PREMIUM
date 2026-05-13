import type { ChannelKind, ChannelProviderCapabilities, ChannelSendRequest, ChannelSendResult } from "./model";

export interface ChannelProviderAdapter {
  kind: ChannelKind;
  health(): Promise<{ ok: boolean; mode: "live" | "mock" | "degraded"; reasons: string[] }>;
  normalizeInbound(payload: unknown): Promise<{ ok: boolean; tenantId?: string; conversationId?: string; text?: string; reasons: string[] }>;
  sendMessage(request: ChannelSendRequest): Promise<ChannelSendResult>;
  validateWebhook?(request: unknown): Promise<{ ok: boolean; reasons: string[] }>;
  getCapabilities(): ChannelProviderCapabilities;
}

function mockSendResult(kind: ChannelKind, request: ChannelSendRequest): ChannelSendResult {
  return {
    ok: false,
    status: "degraded",
    channel: kind,
    conversationId: request.conversationId,
    providerMode: "mock",
    reasons: [`${kind}_provider_mock_mode_no_live_send`],
    metadata: {
      mutationExecuted: false,
      providerCallExecuted: false,
      dryRun: true
    }
  };
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

function createMockAdapter(kind: ChannelKind, caps?: Partial<ChannelProviderCapabilities>): ChannelProviderAdapter {
  return {
    kind,
    async health() {
      return { ok: false, mode: "degraded", reasons: [`${kind}_provider_not_configured`] };
    },
    async normalizeInbound(payload: unknown) {
      const objectPayload = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
      return {
        ok: true,
        tenantId: typeof objectPayload.tenantId === "string" ? objectPayload.tenantId : undefined,
        conversationId: typeof objectPayload.conversationId === "string" ? objectPayload.conversationId : undefined,
        text: typeof objectPayload.text === "string" ? objectPayload.text : undefined,
        reasons: []
      };
    },
    async sendMessage(request: ChannelSendRequest) {
      return mockSendResult(kind, request);
    },
    getCapabilities() {
      return baseCaps(caps);
    }
  };
}

export const instagramMockProvider = createMockAdapter("instagram", { requiresUserOptIn: true });
export const facebookMockProvider = createMockAdapter("facebook", { requiresUserOptIn: true });
export const webChatMockProvider = createMockAdapter("web_chat", {});
export const emailMockProvider = createMockAdapter("email", { supportsAttachments: true });
export const smsMockProvider = createMockAdapter("sms", { supportsAttachments: false });

export const internalNoteProvider: ChannelProviderAdapter = {
  kind: "internal_note",
  async health() {
    return { ok: true, mode: "mock", reasons: [] };
  },
  async normalizeInbound(payload: unknown) {
    const objectPayload = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    return {
      ok: true,
      tenantId: typeof objectPayload.tenantId === "string" ? objectPayload.tenantId : undefined,
      conversationId: typeof objectPayload.conversationId === "string" ? objectPayload.conversationId : undefined,
      text: typeof objectPayload.text === "string" ? objectPayload.text : undefined,
      reasons: []
    };
  },
  async sendMessage(request: ChannelSendRequest) {
    return {
      ok: true,
      status: "dry_run",
      channel: "internal_note",
      conversationId: request.conversationId,
      providerMode: "mock",
      reasons: ["internal_note_recorded"],
      metadata: {
        mutationExecuted: false,
        providerCallExecuted: false,
        dryRun: true
      }
    };
  },
  getCapabilities() {
    return baseCaps({ supportsInbound: false, supportsOutbound: true });
  }
};

export function getDefaultProviderAdapters() {
  const providers: ChannelProviderAdapter[] = [
    createMockAdapter("whatsapp", { requires24hWindow: true, requiresSignature: true }),
    instagramMockProvider,
    facebookMockProvider,
    webChatMockProvider,
    emailMockProvider,
    smsMockProvider,
    internalNoteProvider
  ];

  return new Map(providers.map((provider) => [provider.kind, provider] as const));
}
