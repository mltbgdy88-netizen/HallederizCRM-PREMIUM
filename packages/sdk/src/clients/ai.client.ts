import type { AiInsight, AiProposal } from "@hallederiz/types";
import type { SalesAiTrainingScope } from "@hallederiz/ai-contracts";
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

  getSalesAssistantHealth() {
    return this.api.get<ItemResponse<{
      ok: boolean;
      status: "healthy" | "degraded" | "not_configured" | "blocked";
      provider: "ollama";
      model: string;
      fallbackModel: string;
      modelReady: boolean;
      fallbackReady: boolean;
      reason: string;
      availableModels: string[];
      localService?: {
        status: "healthy" | "degraded" | "not_configured" | "blocked";
        reason: string;
        speakerReady: boolean;
        whisperModel?: string;
      };
      voice?: {
        status: "healthy" | "degraded" | "not_configured" | "blocked";
        sttReady: boolean;
        ttsReady: boolean;
        whisperModel?: string;
      };
    }>>("/platform/ai/sales-assistant/health");
  }

  classifySalesIntent(input: { message: string }) {
    return this.api.post<ItemResponse<{ intent: string; confidence: number }>>("/platform/ai/sales-assistant/classify-intent", input);
  }

  chatSalesAssistant(input: { message: string; customerId?: string; channel?: "web" | "whatsapp" | "omnichannel" | "api" }) {
    return this.api.post<ItemResponse<{
      ok: boolean;
      status: "live" | "degraded" | "not_configured" | "blocked";
      intent: string;
      confidence: number;
      reply: string;
      usedSources: Array<{ type: string; id: string; title: string; confidence: number }>;
      suggestedActions: Array<{ actionKey: string; label: string; requiresApproval: boolean; suggestedOnly: true }>;
      provider: { provider: "ollama"; model: string; fallbackModel: string; effectiveModel?: string; fallbackUsed: boolean };
      mutationExecuted: false;
      externalProviderCallExecuted: false;
    }>>("/platform/ai/sales-assistant/chat", input);
  }

  transcribeSalesVoice(input: { audioBase64: string; mimeType?: string; language?: string }) {
    return this.api.post<ItemResponse<{ ok: boolean; status: "live" | "degraded" | "not_configured" | "blocked"; transcript: string; provider: string; reason: string }>>(
      "/platform/ai/sales-assistant/voice/transcribe",
      input
    );
  }

  speakSalesVoice(input: { text: string; voice?: string; speed?: number }) {
    return this.api.post<ItemResponse<{ ok: boolean; status: "live" | "degraded" | "not_configured" | "blocked"; provider: string; reason?: string; audioRef?: string; mimeType?: string }>>(
      "/platform/ai/sales-assistant/voice/speak",
      input
    );
  }

  listSalesKnowledge() {
    return this.api.get<{ items: SalesAiTrainingScope[]; total: number; knowledgePersistenceMode: string }>("/platform/ai/sales-knowledge");
  }

  createSalesKnowledge(payload: Partial<SalesAiTrainingScope>) {
    return this.api.post<ItemResponse<SalesAiTrainingScope>>("/platform/ai/sales-knowledge", payload);
  }

  patchSalesKnowledge(id: string, payload: Partial<SalesAiTrainingScope>) {
    return this.api.patch<ItemResponse<SalesAiTrainingScope>>(`/platform/ai/sales-knowledge/${id}`, payload);
  }

  deleteSalesKnowledge(id: string) {
    return this.api.delete<{ ok: boolean; id: string }>(`/platform/ai/sales-knowledge/${id}`);
  }
}
