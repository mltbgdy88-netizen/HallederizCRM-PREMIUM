import type { AiInsight, AiProposal } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class AiClient {
  constructor(private readonly api: ApiClient) {}

  chat(message: string) {
    return this.api.post<
      ItemResponse<{
        messages: Array<{ id: string; role: "user" | "assistant" | "system"; inputMode: "text" | "voice"; body: string; tenantId: string; sessionId: string; createdAt: string }>;
        reply: string;
        provider: string;
        mode: string;
        classification: { mutation: boolean; text: string; parsedAt: string };
        requiresProposal: boolean;
      }>
    >("/ai/chat", { message });
  }

  parseCommand(text: string) {
    return this.api.post<ItemResponse<unknown>>("/ai/commands/parse", { text });
  }

  createProposal(input: { prompt: string; inputMode?: "text" | "voice"; targetType?: string; targetId?: string; targetNo?: string }) {
    return this.api.post<ItemResponse<{ proposal: AiProposal }>>("/ai/proposals", input);
  }

  listProposals() {
    return this.api.get<ListResponse<AiProposal>>("/ai/proposals");
  }

  detailProposal(id: string) {
    return this.api.get<ItemResponse<AiProposal>>(`/ai/proposals/${id}`);
  }

  confirmProposal(id: string) {
    return this.api.post<ItemResponse<AiProposal>>(`/ai/proposals/${id}/confirm`);
  }

  rejectProposal(id: string) {
    return this.api.post<ItemResponse<AiProposal>>(`/ai/proposals/${id}/reject`);
  }

  listInsights() {
    return this.api.get<ListResponse<AiInsight>>("/ai/insights");
  }

  runInsights() {
    return this.api.post<ItemResponse<unknown>>("/ai/insights/run");
  }

  transcribeVoice(input: { audioBase64: string; mimeType?: string; language?: string }) {
    return this.api.post<ItemResponse<{ transcript: string; detectedLanguage: string; provider: string }>>("/ai/voice/transcribe", input);
  }

  speakVoice(input: { text: string; voice?: string; speed?: number }) {
    return this.api.post<ItemResponse<{ audioRef: string; provider: string; mimeType: string }>>("/ai/voice/speak", input);
  }
}
