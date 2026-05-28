import type { WhatsAppMessage, WhatsAppSessionSnapshot } from "@hallederiz/types";
import {
  MSG_WA_CONNECTION_REQUIRED,
  MSG_WA_INBOX_UNAVAILABLE,
  MSG_WA_OUTBOUND_QUEUE
} from "../data/whatsapp-action-messages";
import { mapWhatsAppActionError } from "./whatsapp-action-feedback";

export function canSendWhatsAppOutbound(
  session: WhatsAppSessionSnapshot | null,
  useDemoData: boolean,
  health?: { ready?: boolean; state?: string } | null
): boolean {
  if (useDemoData) {
    return false;
  }
  if (health?.state === "disabled" || health?.state === "not_configured") {
    return false;
  }
  return health?.ready === true && session?.connectionStatus === "connected";
}

export function mapWhatsAppOutboundOutcome(message: WhatsAppMessage | undefined): string {
  if (!message) {
    return MSG_WA_CONNECTION_REQUIRED;
  }
  if (message.status === "delivered") {
    return "Mesaj iletildi.";
  }
  if (message.status === "failed") {
    return MSG_WA_INBOX_UNAVAILABLE;
  }
  if (message.status === "sent" || message.status === "queued") {
    return MSG_WA_OUTBOUND_QUEUE;
  }
  return MSG_WA_OUTBOUND_QUEUE;
}

export async function runWhatsAppOutboundSend(options: {
  useDemoData: boolean;
  session: WhatsAppSessionSnapshot | null;
  health?: { ready?: boolean; state?: string } | null;
  conversationId: string;
  body: string;
}): Promise<{ ok: boolean; toast: string }> {
  if (options.useDemoData) {
    return { ok: false, toast: MSG_WA_CONNECTION_REQUIRED };
  }
  if (!canSendWhatsAppOutbound(options.session, false, options.health)) {
    return { ok: false, toast: MSG_WA_CONNECTION_REQUIRED };
  }
  const trimmed = options.body.trim();
  if (!trimmed) {
    return { ok: false, toast: MSG_WA_CONNECTION_REQUIRED };
  }

  try {
    const { sdk } = await import("../../../lib/data-source");
    const response = await sdk.whatsapp.sendOutbound({
      conversationId: options.conversationId,
      type: "text",
      body: trimmed
    });
    return { ok: true, toast: mapWhatsAppOutboundOutcome(response.item) };
  } catch (error) {
    return { ok: false, toast: mapWhatsAppActionError(error, MSG_WA_CONNECTION_REQUIRED) };
  }
}
