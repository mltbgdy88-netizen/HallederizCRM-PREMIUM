import type { WhatsAppActionRequest, WhatsAppMessage } from "@hallederiz/types";
import type { RequestContext } from "../../../shared/request-context";
import {
  createWhatsAppActionRequest,
  getWhatsAppConversation,
  listWhatsAppConversations,
  listWhatsAppTemplates,
  receiveWhatsAppInbound,
  sendWhatsAppOutbound,
  updateWhatsAppActionRequest
} from "../../../integrations/mock-store";
import { assertWhatsAppReady, IntegrationNotReadyError, resolveWhatsAppReadiness } from "../../../shared/integration-readiness";
import { validateWhatsAppConfig } from "../../../shared/service-config";
import { verifyHmacSha256Signature } from "../../../shared/webhook-security";

function requiresStrictPolicy(message: Partial<WhatsAppMessage>): boolean {
  const text = `${message.body ?? ""}`.toLocaleLowerCase("tr-TR");
  return /fiyat|ekstre|odeme|fatura|iade/.test(text);
}

function withTimeout(signalTimeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), signalTimeoutMs);
  return { controller, clear: () => clearTimeout(timeout) };
}

function resolveApiToken(): string | undefined {
  return process.env.WHATSAPP_API_TOKEN?.trim() || process.env.WHATSAPP_ACCESS_TOKEN?.trim();
}

export class WhatsAppAdapter {
  constructor(private readonly context: RequestContext) {}

  private get readiness() {
    return resolveWhatsAppReadiness();
  }

  private get provider() {
    return this.readiness.provider;
  }

  private get hasLiveConfig() {
    return this.readiness.ready;
  }

  private async sendLiveMessage(payload: Partial<WhatsAppMessage>) {
    const apiBaseUrl = (process.env.WHATSAPP_API_BASE_URL ?? "https://graph.facebook.com/v21.0").trim();
    const token = resolveApiToken();
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const testRecipient = process.env.WHATSAPP_TEST_RECIPIENT?.trim();
    if (!token || !phoneNumberId) {
      throw new IntegrationNotReadyError(this.readiness, "whatsapp_not_configured");
    }
    if (!testRecipient) {
      throw new Error("WHATSAPP_TEST_RECIPIENT tanimsiz.");
    }
    const { controller, clear } = withTimeout(Number(process.env.WHATSAPP_TIMEOUT_MS ?? 12000));

    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: testRecipient,
          type: "text",
          text: payload.type === "template" ? undefined : { body: payload.body ?? "" },
          template: undefined
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`whatsapp_outbound_failed_${response.status}`);
      }
      return { ok: true as const };
    } finally {
      clear();
    }
  }

  listConversations() {
    return listWhatsAppConversations().filter((item) => item.tenantId === this.context.tenantId);
  }

  getConversation(id: string) {
    const payload = getWhatsAppConversation(id);
    if (payload.conversation?.tenantId !== this.context.tenantId) {
      return { conversation: undefined, messages: [] };
    }
    return payload;
  }

  inbound(message: Partial<WhatsAppMessage>) {
    const next = receiveWhatsAppInbound(message);
    if (requiresStrictPolicy(message)) {
      next.status = "queued";
    }
    return next;
  }

  async outbound(message: Partial<WhatsAppMessage>) {
    assertWhatsAppReady();
    const next = sendWhatsAppOutbound(message);
    if (requiresStrictPolicy(message)) {
      next.status = "queued";
    }
    if (this.hasLiveConfig && (this.provider === "live" || this.provider === "meta")) {
      try {
        await this.sendLiveMessage(next);
        next.status = "sent";
      } catch {
        next.status = "failed";
      }
    }
    return next;
  }

  createActionRequest(payload: Partial<WhatsAppActionRequest>) {
    return createWhatsAppActionRequest({
      ...payload,
      status: "pending",
      createdAt: new Date().toISOString()
    });
  }

  confirmActionRequest(id: string) {
    return updateWhatsAppActionRequest(id, "confirmed");
  }

  rejectActionRequest(id: string) {
    return updateWhatsAppActionRequest(id, "rejected");
  }

  listTemplates() {
    return listWhatsAppTemplates().filter((item) => item.tenantId === this.context.tenantId);
  }

  verifyWebhookToken(token?: string) {
    const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    if (!expected) return false;
    return token === expected;
  }

  verifyWebhookSignature(rawBody: string, signature?: string) {
    const secret = process.env.WHATSAPP_WEBHOOK_APP_SECRET;
    if (!secret) return false;
    return verifyHmacSha256Signature(rawBody, signature, secret);
  }

  getHealth() {
    const config = validateWhatsAppConfig();
    return {
      ...config,
      message: config.reason,
      details: {
        ...config.details,
        runtimeProvider: this.provider,
        runtimeLiveConfigured: this.hasLiveConfig
      }
    };
  }
}
