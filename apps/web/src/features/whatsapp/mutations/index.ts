import type { WhatsAppActionRequest, WhatsAppOutboundPayload } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";
import { runWhatsAppOutboundSend } from "../utils/whatsapp-outbound-feedback";
import type { WhatsAppChannelHealthSnapshot } from "../utils/whatsapp-channel-health";
import type { WhatsAppSessionSnapshot } from "@hallederiz/types";

export async function sendWhatsAppOutboundMutation(
  payload: WhatsAppOutboundPayload,
  options: {
    useDemoData: boolean;
    session: WhatsAppSessionSnapshot | null;
    health?: WhatsAppChannelHealthSnapshot | null;
  }
) {
  if (!payload.conversationId?.trim() || !payload.body?.trim()) {
    throw new Error("conversation_required");
  }
  const result = await runWhatsAppOutboundSend({
    useDemoData: options.useDemoData,
    session: options.session,
    health: options.health,
    conversationId: payload.conversationId,
    body: payload.body
  });
  if (!result.ok) {
    throw new Error(result.toast);
  }
  return result;
}

export async function createWhatsAppActionRequestMutation(payload: Partial<WhatsAppActionRequest>) {
  const response = await sdk.whatsapp.createActionRequest(payload);
  return response.item;
}

export async function confirmWhatsAppActionRequestMutation(id: string) {
  const response = await sdk.whatsapp.confirmActionRequest(id);
  return response.item;
}

export async function rejectWhatsAppActionRequestMutation(id: string) {
  const response = await sdk.whatsapp.rejectActionRequest(id);
  return response.item;
}
