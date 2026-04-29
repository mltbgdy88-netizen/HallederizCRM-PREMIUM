import type { AiInsight, AiMessage, AiProposal, Approval, ApprovalExecution } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { aiApprovals, aiInsights, aiMessages, aiProposals, approvalExecutions, getAiProposalById, getAiSettingsData } from "./ai-mock-data";

export interface AiAssistantData {
  messages: AiMessage[];
  proposals: AiProposal[];
  approvals: Approval[];
  executions: ApprovalExecution[];
  insights: AiInsight[];
}

export interface AiChatResponse {
  messages: AiMessage[];
  reply: string;
  provider: string;
  mode: string;
  classification: { mutation: boolean; text: string; parsedAt: string };
  requiresProposal: boolean;
}

export async function getAiAssistantData(): Promise<AiAssistantData> {
  if (dataSourceConfig.useDemoData) {
    return {
      messages: aiMessages,
      proposals: aiProposals,
      approvals: aiApprovals,
      executions: approvalExecutions,
      insights: aiInsights
    };
  }

  const [proposalsResponse, insightsResponse, approvalsResponse] = await Promise.all([
    sdk.ai.listProposals(),
    sdk.ai.listInsights(),
    sdk.approvals.list()
  ]);

  const aiRelatedApprovals = approvalsResponse.items.filter((approval) => approval.type === "ai_action_proposal");
  return {
    messages: [],
    proposals: proposalsResponse.items,
    approvals: aiRelatedApprovals,
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
