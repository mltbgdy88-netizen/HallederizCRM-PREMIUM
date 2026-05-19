import type { WhatsAppConversation, WhatsAppMessage } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export interface WhatsAppConversationDetail {
  conversation: WhatsAppConversation | undefined;
  messages: WhatsAppMessage[];
}

export class WhatsAppClient {
  constructor(private readonly api: ApiClient) {}

  listConversations() {
    return this.api.get<ListResponse<WhatsAppConversation>>("/whatsapp/conversations");
  }

  getConversation(id: string) {
    return this.api.get<ItemResponse<WhatsAppConversationDetail>>(`/whatsapp/conversations/${id}`);
  }

  getChannelHealth() {
    return this.api.get<
      ItemResponse<{
        status: string;
        message: string;
        mode?: string;
        details?: Record<string, unknown>;
      }>
    >("/health/whatsapp");
  }
}
