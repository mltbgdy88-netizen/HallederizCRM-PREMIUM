import { buildAiProposal, buildApprovalFromAiProposal, classifyAiRequest, extractAiOperations } from "@hallederiz/domain";
import type { AiInsight, AiInputMode, AiMessage, AiProposal, Approval } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";

interface ProposalGenerationInput {
  prompt: string;
  inputMode: AiInputMode;
  targetType?: AiProposal["targetType"];
  targetId?: string;
  targetNo?: string;
}

interface VoiceTranscriptionInput {
  audioBase64: string;
  mimeType?: string;
  language?: string;
}

interface VoiceSpeakInput {
  text: string;
  voice?: string;
  speed?: number;
}

async function callOpenAiChat(params: { model: string; apiKey: string; system: string; user: string }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${params.apiKey}`
    },
    body: JSON.stringify({
      model: params.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user }
      ]
    })
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI chat failed: ${response.status} ${message}`);
  }
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string | null } }> };
  return payload.choices?.[0]?.message?.content ?? "";
}

export class AiRuntimeService {
  constructor(private readonly context: RequestContext) {}

  private get isLiveProviderEnabled() {
    return (process.env.AI_LLM_PROVIDER ?? "mock") === "openai" && Boolean(process.env.OPENAI_API_KEY);
  }

  async chat(prompt: string) {
    if (!this.isLiveProviderEnabled) {
      return {
        message: `AI (fallback): ${prompt}`,
        provider: "mock",
        mode: "fallback"
      };
    }
    const text = await callOpenAiChat({
      model: process.env.OPENAI_LLM_MODEL ?? "gpt-4.1-mini",
      apiKey: process.env.OPENAI_API_KEY as string,
      system: "Sen HallederizCRM icin kurumsal operasyon asistanisin. Turkce, net ve kisa cevap ver.",
      user: prompt
    });
    return {
      message: text,
      provider: "openai",
      mode: "live"
    };
  }

  async generateProposal(input: ProposalGenerationInput): Promise<{ proposal: AiProposal; approvalDraft?: Omit<Approval, "id" | "approvalNo"> }> {
    const classification = classifyAiRequest(input.prompt);
    const proposal = buildAiProposal({
      tenantId: this.context.tenantId,
      sessionId: `ai_session_${this.context.userId}`,
      requestText: input.prompt,
      requestedBy: this.context.userId,
      requestedByName: this.context.userId,
      inputMode: input.inputMode,
      targetType: input.targetType,
      targetId: input.targetId,
      targetNo: input.targetNo
    });
    proposal.actionType = classification.actionType;
    proposal.operations = extractAiOperations({
      actionType: classification.actionType,
      targetType: input.targetType,
      targetId: input.targetId,
      targetNo: input.targetNo,
      summary: input.prompt
    });
    proposal.summary = `${classification.reason} ${input.prompt}`;
    proposal.requiresApproval = classification.mutation;
    proposal.status = classification.mutation ? "waiting_approval" : "draft";
    proposal.channel = "crm_ui";
    proposal.inputMode = input.inputMode;

    const approvalDraft = proposal.requiresApproval ? buildApprovalFromAiProposal(proposal) : undefined;
    return { proposal, approvalDraft };
  }

  async generateInsights(): Promise<AiInsight[]> {
    const now = new Date().toISOString();
    if (!this.isLiveProviderEnabled) {
      return [
        {
          id: `ai_insight_${Date.now()}_1`,
          tenantId: this.context.tenantId,
          title: "Riskli cari sinyali",
          category: "risk",
          severity: "warning",
          confidence: 0.8,
          summary: "Geciken tahsilat nedeniyle takip onceligi onerilir.",
          targetType: "customer",
          targetId: "customer_2",
          targetNo: "CUS-002",
          suggestedAction: "create_payment",
          createdAt: now
        }
      ];
    }
    const text = await callOpenAiChat({
      model: process.env.OPENAI_LLM_MODEL ?? "gpt-4.1-mini",
      apiKey: process.env.OPENAI_API_KEY as string,
      system: "3 maddelik turkce CRM insight listesi ver. Her madde tek satir olsun.",
      user: "Risk, tahsilat ve stok sinyallerini ozetle."
    });
    return [
      {
        id: `ai_insight_${Date.now()}_live`,
        tenantId: this.context.tenantId,
        title: "Canli AI insight",
        category: "operation",
        severity: "info",
        confidence: 0.74,
        summary: text.slice(0, 400),
        targetType: "customer",
        targetId: "customer_1",
        targetNo: "CUS-001",
        suggestedAction: "read_summary",
        createdAt: now
      }
    ];
  }

  async transcribeVoice(input: VoiceTranscriptionInput) {
    if (!input.audioBase64) {
      throw new Error("Ses verisi bulunamadi.");
    }
    if ((process.env.AI_STT_PROVIDER ?? "mock") !== "openai" || !process.env.OPENAI_API_KEY) {
      return {
        transcript: "Fallback transcript: ses kaydi metne cevrildi.",
        detectedLanguage: input.language ?? "tr",
        provider: "mock"
      };
    }

    const buffer = Buffer.from(input.audioBase64, "base64");
    const form = new FormData();
    form.append("model", process.env.OPENAI_STT_MODEL ?? "gpt-4o-mini-transcribe");
    form.append("language", input.language ?? "tr");
    form.append("file", new Blob([buffer], { type: input.mimeType ?? "audio/webm" }), "voice.webm");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`STT failed: ${message}`);
    }
    const payload = (await response.json()) as { text?: string; language?: string };
    return {
      transcript: payload.text ?? "",
      detectedLanguage: payload.language ?? input.language ?? "tr",
      provider: "openai"
    };
  }

  async speakVoice(input: VoiceSpeakInput) {
    if (!input.text.trim()) {
      throw new Error("Okunacak metin bos olamaz.");
    }
    if ((process.env.AI_TTS_PROVIDER ?? "mock") !== "openai" || !process.env.OPENAI_API_KEY) {
      return {
        audioRef: `mock://tts/${Date.now()}`,
        provider: "mock",
        mimeType: "audio/mpeg"
      };
    }
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
        input: input.text,
        voice: input.voice ?? "alloy",
        speed: input.speed ?? 1
      })
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`TTS failed: ${message}`);
    }
    const audio = Buffer.from(await response.arrayBuffer()).toString("base64");
    return {
      audioRef: `data:audio/mpeg;base64,${audio}`,
      provider: "openai",
      mimeType: "audio/mpeg"
    };
  }

  buildAssistantMessage(prompt: string, reply: string, inputMode: AiInputMode): AiMessage[] {
    const now = new Date().toISOString();
    return [
      {
        id: `ai_msg_user_${Date.now()}`,
        tenantId: this.context.tenantId,
        sessionId: `ai_session_${this.context.userId}`,
        role: "user",
        inputMode,
        body: prompt,
        createdAt: now
      },
      {
        id: `ai_msg_assistant_${Date.now()}`,
        tenantId: this.context.tenantId,
        sessionId: `ai_session_${this.context.userId}`,
        role: "assistant",
        inputMode,
        body: reply,
        createdAt: now
      }
    ];
  }
}

