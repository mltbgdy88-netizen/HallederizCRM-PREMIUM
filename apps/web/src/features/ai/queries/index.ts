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

