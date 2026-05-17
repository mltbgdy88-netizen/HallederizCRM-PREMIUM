import type { Customer, WhatsAppActionRequest, WhatsAppContact, WhatsAppConversation, WhatsAppMessage } from "@hallederiz/types";
import { buildWhatsAppSuggestedReply, resolveWhatsAppIntent } from "@hallederiz/domain";
import type { WaRichBlock } from "../queries/whatsapp-mock-data";
import { waSyntheticContact } from "./wa-conversation-helpers";

export type WhatsAppPageDetail = {
  conversation: WhatsAppConversation | null;
  contact: WhatsAppContact | null;
  messages: WhatsAppMessage[];
  richBlocks: WaRichBlock[] | undefined;
  customer: Customer | null;
  suggestedReply: string;
  actionRequests: WhatsAppActionRequest[];
  detectedIntent: ReturnType<typeof resolveWhatsAppIntent>;
};

export function buildWhatsAppApiPageDetail(
  conversation: WhatsAppConversation | undefined,
  messages: WhatsAppMessage[]
): WhatsAppPageDetail {
  if (!conversation) {
    return {
      conversation: null,
      contact: null,
      messages: [],
      richBlocks: undefined,
      customer: null,
      suggestedReply: "",
      actionRequests: [],
      detectedIntent: resolveWhatsAppIntent("")
    };
  }
  const lastBody = messages.at(-1)?.body ?? "";
  return {
    conversation,
    contact: waSyntheticContact(conversation),
    messages,
    richBlocks: undefined,
    customer: null,
    suggestedReply: buildWhatsAppSuggestedReply(conversation.ruleResolution, undefined),
    actionRequests: [],
    detectedIntent: resolveWhatsAppIntent(lastBody)
  };
}
