import type { AiReplySuggestion } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export interface OmnichannelConversation {
  id: string;
  tenantId: string;
  channel: string;
  status: string;
  contactDisplayName?: string;
  contactHandle?: string;
  externalConversationId?: string;
  lastMessageAt?: string;
}

export interface OmnichannelMessage {
  id: string;
  conversationId: string;
  channel: string;
  direction: string;
  authorType: string;
  text: string;
  status: string;
  createdAt: string;
}

export interface OmnichannelProviderHealthItem {
  kind: string;
  ok: boolean;
  mode: string;
  label?: string;
  reasons: string[];
  capabilities?: Record<string, unknown>;
}

export class OmnichannelClient {
  constructor(private readonly api: ApiClient) {}

  listConversations(query?: { channel?: string; status?: string }) {
    const params = new URLSearchParams();
    if (query?.channel) params.set("channel", query.channel);
    if (query?.status) params.set("status", query.status);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return this.api.get<ListResponse<OmnichannelConversation> & { providerHealth?: OmnichannelProviderHealthItem[] }>(
      `/platform/omnichannel/conversations${suffix}`
    );
  }

  getConversation(id: string) {
    return this.api.get<{ item: OmnichannelConversation; persistenceMode?: string }>(`/platform/omnichannel/conversations/${id}`);
  }

  listMessages(conversationId: string) {
    return this.api.get<ListResponse<OmnichannelMessage>>(`/platform/omnichannel/conversations/${conversationId}/messages`);
  }

  listAiSuggestions(conversationId: string) {
    return this.api.get<ListResponse<AiReplySuggestion>>(`/platform/omnichannel/conversations/${conversationId}/ai-suggestions`);
  }

  reply(conversationId: string, payload: { text?: string; channel?: string; idempotencyKey?: string; source?: "web" | "api" | "ai" }) {
    return this.api.post<Record<string, unknown>>(`/platform/omnichannel/conversations/${conversationId}/reply`, payload);
  }

  assign(conversationId: string, assignedUserId: string) {
    return this.api.post<Record<string, unknown>>(`/platform/omnichannel/conversations/${conversationId}/assign`, { assignedUserId });
  }

  resolve(conversationId: string) {
    return this.api.post<Record<string, unknown>>(`/platform/omnichannel/conversations/${conversationId}/resolve`, {});
  }

  health() {
    return this.api.get<{
      ok: boolean;
      persistenceMode: string;
      reasons: string[];
      providers: OmnichannelProviderHealthItem[];
    }>("/platform/omnichannel/health");
  }
}
