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
import crypto from "node:crypto";
import { validateWhatsAppConfig } from "../../../shared/service-config";

function requiresStrictPolicy(message: Partial<WhatsAppMessage>): boolean {
  const text = `${message.body ?? ""}`.toLocaleLowerCase("tr-TR");
  return /fiyat|ekstre|odeme|fatura|iade/.test(text);
}

function withTimeout(signalTimeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), signalTimeoutMs);
  return { controller, clear: () => clearTimeout(timeout) };
}

export class WhatsAppAdapter {
  constructor(private readonly context: RequestContext) {}

  private get provider() {
    return process.env.WHATSAPP_PROVIDER ?? "mock";
  }

  private get hasLiveConfig() {
    return Boolean(
      process.env.WHATSAPP_API_BASE_URL &&
      process.env.WHATSAPP_API_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID
    );
  }

  private async sendLiveMessage(payload: Partial<WhatsAppMessage>) {
    const apiBaseUrl = process.env.WHATSAPP_API_BASE_URL as string;
    const token = process.env.WHATSAPP_API_TOKEN as string;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID as string;
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
        const reason = await response.text();
        throw new Error(`WhatsApp outbound failed: ${response.status} ${reason}`);
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
    const next = sendWhatsAppOutbound(message);
    if (requiresStrictPolicy(message)) {
      next.status = "queued";
    }
    if (this.provider === "live" && this.hasLiveConfig) {
      try {
        await this.sendLiveMessage(next);
        next.status = "sent";
      } catch (error) {
        next.status = "failed";
        next.body = `${next.body ?? ""}\n[provider-error] ${error instanceof Error ? error.message : "unknown"}`;
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
    if (!secret || !signature) return true;
    const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return signature.replace("sha256=", "") === digest;
  }

  getHealth() {
    const config = validateWhatsAppConfig();
    return {
      ...config,
      details: {
        ...config.details,
        runtimeProvider: this.provider,
        runtimeLiveConfigured: this.hasLiveConfig
      }
    };
  }
}
    const testRecipient = process.env.WHATSAPP_TEST_RECIPIENT;
    if (!testRecipient) {
      throw new Error("WHATSAPP_TEST_RECIPIENT tanimsiz.");
    }
