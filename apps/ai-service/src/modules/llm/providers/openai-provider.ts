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
import { parseProposalPayload } from "../parsers";
import { buildProposalPrompt, buildReplyPrompt } from "../prompt-builders";

interface OpenAiChatResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

async function callOpenAiChat(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${params.apiKey}`
    },
    body: JSON.stringify({
      model: params.model,
      temperature: params.temperature ?? 0.2,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI chat failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as OpenAiChatResponse;
  return payload.choices?.[0]?.message?.content ?? "";
}

export class OpenAiLlmProvider implements LlmProvider {
  readonly providerName = "openai";

  constructor(
    private readonly apiKey: string,
    readonly modelName: string
  ) {}

  async generateReply(input: GenerateReplyInput): Promise<GenerateReplyResult> {
    const text = await callOpenAiChat({
      apiKey: this.apiKey,
      model: this.modelName,
      systemPrompt: "Sen Turkce kurumsal CRM asistanisin. Cevabi net, kisa ve operasyon odakli ver.",
      userPrompt: buildReplyPrompt(input.prompt, input.contextSummary)
    });

    return {
      text,
      confidence: 0.83,
      provider: this.providerName,
      model: this.modelName
    };
  }

  async generateProposal(input: GenerateProposalInput): Promise<GeneratedProposalPayload> {
    const raw = await callOpenAiChat({
      apiKey: this.apiKey,
      model: this.modelName,
      temperature: 0.1,
      systemPrompt: "Yanitin yalnizca gecerli JSON olsun.",
      userPrompt: buildProposalPrompt(input)
    });

    return parseProposalPayload(raw, input);
  }

  async generateInsights(input: GenerateInsightsInput): Promise<AiInsight[]> {
    const raw = await callOpenAiChat({
      apiKey: this.apiKey,
      model: this.modelName,
      systemPrompt: "En fazla 5 maddelik CRM operasyon insight listesi ver. JSON array don.",
      userPrompt: `Baglam: ${input.contextSummary ?? "yok"}`
    });

    try {
      const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
      const now = new Date().toISOString();
      return parsed.slice(0, 5).map((item, index) => ({
        id: `ai_insight_live_${Date.now()}_${index}`,
        tenantId: input.runtime.tenantId,
        title: String(item.title ?? "AI Insight"),
        category: (item.category as AiInsight["category"]) ?? "operation",
        severity: (item.severity as AiInsight["severity"]) ?? "info",
        confidence: Number(item.confidence ?? 0.7),
        summary: String(item.summary ?? "AI operasyon ozeti."),
        targetType: (item.targetType as AiInsight["targetType"]) ?? "customer",
        targetId: String(item.targetId ?? "customer_1"),
        targetNo: String(item.targetNo ?? "CUS-001"),
        suggestedAction: item.suggestedAction as AiInsight["suggestedAction"],
        createdAt: now
      }));
    } catch {
      return [];
    }
  }

  async summarizeContext(input: SummarizeContextInput): Promise<SummarizeContextResult> {
    const text = await callOpenAiChat({
      apiKey: this.apiKey,
      model: this.modelName,
      systemPrompt: "Verilen kayit listesini 3-4 cumle ile Turkce ozetle.",
      userPrompt: input.records.map((record) => `${record.key}: ${String(record.value)}`).join("\n")
    });
    return {
      summary: text,
      sourceCount: input.records.length
    };
  }
}

