import { buildAiInsightCard, classifyAiRequest, extractAiOperations } from "@hallederiz/domain";
import type { AiInsight } from "@hallederiz/types";
import type {
  GenerateInsightsInput,
  GenerateProposalInput,
  GenerateReplyInput,
  GenerateReplyResult,
  GeneratedProposalPayload,
  LlmProvider,
  SummarizeContextInput,
  SummarizeContextResult
} from "../../contracts";

function mockInsights(input: GenerateInsightsInput): AiInsight[] {
  const now = new Date().toISOString();
  const entries: AiInsight[] = [
    {
      id: `ai_insight_mock_1_${Date.now()}`,
      tenantId: input.runtime.tenantId,
      title: "Riskli cari sinyali",
      category: "risk",
      severity: "warning",
      confidence: 0.78,
      summary: "Geciken tahsilatlar nedeniyle takip onceligi onerilir.",
      targetType: "customer",
      targetId: "customer_2",
      targetNo: "CUS-002",
      suggestedAction: "create_payment",
      createdAt: now
    },
    {
      id: `ai_insight_mock_2_${Date.now()}`,
      tenantId: input.runtime.tenantId,
      title: "Kritik stok egilimi",
      category: "stock",
      severity: "critical",
      confidence: 0.81,
      summary: "DK-2022 urununde tuketim hizi stoktan yuksek.",
      targetType: "product",
      targetId: "prod_2",
      targetNo: "DK-2022",
      suggestedAction: "create_order",
      createdAt: now
    }
  ];

  if (entries[0]) {
    void buildAiInsightCard(entries[0]);
  }
  return entries;
}

export const mockLlmProvider: LlmProvider = {
  providerName: "mock",
  modelName: "mock-tr-crm",
  async generateReply(input: GenerateReplyInput): Promise<GenerateReplyResult> {
    return {
      text: `AI (mock): ${input.prompt}`,
      confidence: 0.72,
      provider: "mock",
      model: "mock-tr-crm"
    };
  },
  async generateProposal(input: GenerateProposalInput): Promise<GeneratedProposalPayload> {
    const classification = classifyAiRequest(input.prompt);
    return {
      summary: `${classification.reason} ${input.prompt}`,
      intent: classification.actionType,
      riskNotes: classification.mutation ? ["Mutation islemi insan onayi gerektirir."] : [],
      requiredApprovals: classification.mutation ? ["Yonetici"] : [],
      operations: extractAiOperations({
        actionType: classification.actionType,
        targetType: input.targetType,
        targetId: input.targetId,
        targetNo: input.targetNo,
        summary: input.prompt
      }),
      confidence: 0.67,
      channelType: input.runtime.channelType,
      inputMode: input.runtime.inputMode
    };
  },
  async generateInsights(input: GenerateInsightsInput): Promise<AiInsight[]> {
    return mockInsights(input);
  },
  async summarizeContext(input: SummarizeContextInput): Promise<SummarizeContextResult> {
    return {
      summary: input.records.map((record) => `${record.key}: ${String(record.value)}`).join(" | "),
      sourceCount: input.records.length
    };
  }
};
