import type { AiInsight, AiMessage, AiProposal, Approval, ApprovalExecution } from "@hallederiz/types";
import type { SalesAiTrainingScope } from "@hallederiz/ai-contracts";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import type { ApprovalClientConfig } from "../../approvals/api/approval-client";
import { fetchAiPlatformApprovals } from "../api/fetch-ai-platform-approvals";
import { aiApprovals, aiInsights, aiMessages, aiProposals, approvalExecutions, getAiProposalById, getAiSettingsData } from "./ai-mock-data";

export interface AiAssistantData {
  messages: AiMessage[];
  proposals: AiProposal[];
  approvals: Approval[];
  executions: ApprovalExecution[];
  insights: AiInsight[];
}

export interface GetAiAssistantDataOptions {
  approvalClientConfig?: ApprovalClientConfig;
}

export interface AiChatResponse {
  messages: AiMessage[];
  reply: string;
  provider: string;
  mode: string;
  classification: { mutation: boolean; text: string; parsedAt: string };
  requiresProposal: boolean;
}

export async function getAiAssistantData(options?: GetAiAssistantDataOptions): Promise<AiAssistantData> {
  if (dataSourceConfig.useDemoData) {
    return {
      messages: aiMessages,
      proposals: aiProposals,
      approvals: aiApprovals,
      executions: approvalExecutions,
      insights: aiInsights
    };
  }

  const approvalsPromise = options?.approvalClientConfig
    ? fetchAiPlatformApprovals(options.approvalClientConfig)
    : sdk.approvals.list().then((response) => response.items.filter((approval) => approval.type === "ai_action_proposal"));

  const [proposalsResponse, insightsResponse, approvals] = await Promise.all([
    sdk.ai.listProposals(),
    sdk.ai.listInsights(),
    approvalsPromise
  ]);

  return {
    messages: [],
    proposals: proposalsResponse.items,
    approvals,
    executions: [],
    insights: insightsResponse.items
  };
}

export async function createAiProposal(input: { prompt: string; inputMode?: "text" | "voice"; targetType?: string; targetId?: string; targetNo?: string }) {
  if (dataSourceConfig.useDemoData) {
    return {
      item: {
        proposal: getAiProposalById()
      }
    };
  }
  return sdk.ai.createProposal(input);
}

export async function runAiChat(message: string): Promise<AiChatResponse> {
  if (dataSourceConfig.useDemoData) {
    const now = new Date().toISOString();
    return {
      messages: [
        {
          id: `demo_user_${Date.now()}`,
          tenantId: dataSourceConfig.tenantId,
          sessionId: "ai_session_demo",
          role: "user",
          inputMode: "text",
          body: message,
          createdAt: now
        },
        {
          id: `demo_assistant_${Date.now()}`,
          tenantId: dataSourceConfig.tenantId,
          sessionId: "ai_session_demo",
          role: "assistant",
          inputMode: "text",
          body: "Demo fallback cevabi: komutunuz alindi.",
          createdAt: now
        }
      ],
      reply: "Demo fallback cevabi: komutunuz alindi.",
      provider: "mock",
      mode: "fallback",
      classification: { mutation: false, text: message, parsedAt: now },
      requiresProposal: false
    };
  }
  const response = await sdk.ai.chat(message);
  return response.item;
}

export async function confirmAiProposal(id: string) {
  if (dataSourceConfig.useDemoData) {
    return { item: getAiProposalById(id) };
  }
  return sdk.ai.confirmProposal(id);
}

export async function rejectAiProposal(id: string) {
  if (dataSourceConfig.useDemoData) {
    return { item: getAiProposalById(id) };
  }
  return sdk.ai.rejectProposal(id);
}

export async function transcribeAiVoice(input: { audioBase64: string; mimeType?: string; language?: string }) {
  if (dataSourceConfig.useDemoData) {
    return { item: { transcript: "Fallback transcript", detectedLanguage: "tr", provider: "mock" } };
  }
  return sdk.ai.transcribeVoice(input);
}

export async function speakAiText(input: { text: string; voice?: string; speed?: number }) {
  if (dataSourceConfig.useDemoData) {
    return { item: { audioRef: "mock://tts/audio", provider: "mock", mimeType: "audio/mpeg" } };
  }
  return sdk.ai.speakVoice(input);
}

export async function runAiInsights() {
  if (dataSourceConfig.useDemoData) {
    return { item: { generatedAt: new Date().toISOString(), items: aiInsights } };
  }
  return sdk.ai.runInsights();
}

export { getAiSettingsData };

export async function getSalesAssistantHealth() {
  if (dataSourceConfig.useDemoData) {
    return {
      item: {
        ok: false,
        status: "degraded",
        provider: "ollama",
        model: "RefinedNeuro/Turkcell-LLM-7b-v1:latest",
        fallbackModel: "llama3.2:3b",
        modelReady: false,
        fallbackReady: true,
        reason: "demo_mode",
        availableModels: ["llama3.2:3b"],
        localService: {
          status: "degraded",
          reason: "demo_mode",
          speakerReady: false
        },
        voice: {
          status: "degraded",
          sttReady: false,
          ttsReady: false
        }
      }
    };
  }
  return sdk.ai.getSalesAssistantHealth();
}

export async function classifySalesIntent(input: { message: string }) {
  if (dataSourceConfig.useDemoData) {
    return { item: { intent: "unknown", confidence: 0.5 } };
  }
  return sdk.ai.classifySalesIntent(input);
}

export async function chatSalesAssistant(input: { message: string; customerId?: string; channel?: "web" | "whatsapp" | "omnichannel" | "api" }) {
  if (dataSourceConfig.useDemoData) {
    return {
      item: {
        ok: true,
        status: "degraded",
        intent: "unknown",
        confidence: 0.5,
        reply: "Demo modunda local sales AI canlı yanıt üretmiyor.",
        usedSources: [],
        suggestedActions: [],
        provider: {
          provider: "ollama",
          model: "RefinedNeuro/Turkcell-LLM-7b-v1:latest",
          fallbackModel: "llama3.2:3b",
          fallbackUsed: true
        },
        mutationExecuted: false,
        externalProviderCallExecuted: false
      }
    };
  }
  return sdk.ai.chatSalesAssistant(input);
}

export async function transcribeSalesVoice(input: { audioBase64: string; mimeType?: string; language?: string }) {
  if (dataSourceConfig.useDemoData) {
    return { item: { ok: false, status: "degraded", transcript: "", provider: "local", reason: "demo_mode" } };
  }
  return sdk.ai.transcribeSalesVoice(input);
}

export async function speakSalesVoice(input: { text: string; voice?: string; speed?: number }) {
  if (dataSourceConfig.useDemoData) {
    return { item: { ok: false, status: "degraded", provider: "local", reason: "demo_mode" } };
  }
  return sdk.ai.speakSalesVoice(input);
}

export async function listSalesKnowledge() {
  if (dataSourceConfig.useDemoData) {
    return { items: [] as SalesAiTrainingScope[], total: 0, knowledgePersistenceMode: "memory" };
  }
  return sdk.ai.listSalesKnowledge();
}

export async function createSalesKnowledge(payload: Partial<SalesAiTrainingScope>) {
  if (dataSourceConfig.useDemoData) {
    return {
      item: {
        id: `demo_sales_kb_${Date.now()}`,
        tenantId: dataSourceConfig.tenantId,
        productId: payload.productId,
        productName: payload.productName ?? "Demo Ürün",
        category: payload.category,
        description: payload.description,
        salesNotes: payload.salesNotes,
        allowedClaims: payload.allowedClaims ?? [],
        blockedClaims: payload.blockedClaims ?? [],
        priceVisibility: payload.priceVisibility === "visible" ? "visible" : "hidden",
        stockVisibility: payload.stockVisibility === "visible" ? "visible" : "hidden",
        faqSnippets: payload.faqSnippets ?? [],
        selectedDocuments: payload.selectedDocuments ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } satisfies SalesAiTrainingScope
    };
  }
  return sdk.ai.createSalesKnowledge(payload);
}

export async function updateSalesKnowledge(id: string, payload: Partial<SalesAiTrainingScope>) {
  if (dataSourceConfig.useDemoData) {
    return {
      item: {
        id,
        tenantId: dataSourceConfig.tenantId,
        productId: payload.productId,
        productName: payload.productName ?? "Demo Ürün",
        category: payload.category,
        description: payload.description,
        salesNotes: payload.salesNotes,
        allowedClaims: payload.allowedClaims ?? [],
        blockedClaims: payload.blockedClaims ?? [],
        priceVisibility: payload.priceVisibility === "visible" ? "visible" : "hidden",
        stockVisibility: payload.stockVisibility === "visible" ? "visible" : "hidden",
        faqSnippets: payload.faqSnippets ?? [],
        selectedDocuments: payload.selectedDocuments ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } satisfies SalesAiTrainingScope
    };
  }
  return sdk.ai.patchSalesKnowledge(id, payload);
}

export async function removeSalesKnowledge(id: string) {
  if (dataSourceConfig.useDemoData) {
    return { ok: true, id };
  }
  return sdk.ai.deleteSalesKnowledge(id);
}
