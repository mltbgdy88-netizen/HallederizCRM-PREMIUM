import { buildAiProposal, buildApprovalFromAiProposal, classifyAiRequest, extractAiOperations } from "@hallederiz/domain";
import type { SalesAiGuardrailDecision, SalesAiGroundingSource, SalesAiIntent, SalesAiResponse, SalesAiTrainingScope } from "@hallederiz/ai-contracts";
import type { AiInsight, AiInputMode, AiMessage, AiProposal, Approval } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { validateLocalAiEndpointUrl } from "../../shared/local-ai-url-policy";
import { validateAiConfig } from "../../shared/service-config";

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

interface SalesAssistantChatInput {
  message: string;
  customerId?: string;
  channel?: "web" | "whatsapp" | "omnichannel" | "api";
  knowledge: SalesAiTrainingScope[];
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, redirect: init.redirect ?? "error", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry<T>(run: () => Promise<T>, retryCount = 1): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("retry_failed");
}

async function callOpenAiChat(params: { model: string; apiKey: string; system: string; user: string }) {
  const response = await withRetry(() =>
    fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
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
      },
      Number(process.env.AI_TIMEOUT_MS ?? 15000)
    ),
    Number(process.env.AI_RETRY_COUNT ?? 1)
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI chat failed: ${response.status} ${message}`);
  }
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string | null } }> };
  return payload.choices?.[0]?.message?.content ?? "";
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function parseLocalAiNdjson(text: string) {
  let doneText = "";
  let tokenText = "";
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const event = JSON.parse(trimmed) as { type?: string; text?: string };
      if (event.type === "done" && typeof event.text === "string") {
        doneText = event.text;
      }
      if (event.type === "token" && typeof event.text === "string") {
        tokenText += event.text;
      }
    } catch {
      tokenText += trimmed;
    }
  }
  return (doneText || tokenText).trim();
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(text.slice(first, last + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function trimSalesReply(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "Bu bilgi sistemde görünmüyor.";
  const sentences = compact.match(/[^.!?]+[.!?]?/g)?.map((item) => item.trim()).filter(Boolean) ?? [compact];
  return sentences.slice(0, 4).join(" ").trim();
}

function classifySalesIntent(text: string): SalesAiIntent {
  const value = text.toLowerCase();
  if (/merhaba|selam|iyi günler|iyi aksamlar/.test(value)) return "greeting";
  if (/fiyat|ücret|kaç tl|kaç ₺|indirim/.test(value)) return "price_question";
  if (/stok|elde var|mevcut|adet/.test(value)) return "stock_question";
  if (/sipariş|siparis|satın al|satinal/.test(value)) return "order_intent";
  if (/teklif|fiyat çalış|fiyat çalışması|proforma/.test(value)) return "quote_request";
  if (/iade|geri gönder|iptal/.test(value)) return "return_request";
  if (/teslim|kargo|sevkiyat/.test(value)) return "delivery_question";
  if (/ödeme|odeme|tahsilat|vade/.test(value)) return "payment_question";
  if (/destek|yardım|sorun|problem/.test(value)) return "support_request";
  if (/ürün|urun|model|özellik|ozellik/.test(value)) return "product_question";
  return "unknown";
}

export class AiRuntimeService {
  constructor(private readonly context: RequestContext) {}

  private get llmProvider() {
    return (process.env.AI_PROVIDER ?? process.env.AI_LLM_PROVIDER ?? "local").toLowerCase();
  }

  private get sttProvider() {
    return (process.env.AI_PROVIDER ?? process.env.AI_STT_PROVIDER ?? "local").toLowerCase();
  }

  private get ttsProvider() {
    return (process.env.AI_PROVIDER ?? process.env.AI_TTS_PROVIDER ?? "local").toLowerCase();
  }

  private get isExternalLlmEnabled() {
    return this.llmProvider === "openai" && Boolean(process.env.OPENAI_API_KEY);
  }

  private get isLocalLlmEnabled() {
    return this.llmProvider === "local";
  }

  private get isExternalSttEnabled() {
    return this.sttProvider === "openai" && Boolean(process.env.OPENAI_API_KEY);
  }

  private get isLocalSttEnabled() {
    return this.sttProvider === "local";
  }

  private get isExternalTtsEnabled() {
    return this.ttsProvider === "openai" && Boolean(process.env.OPENAI_API_KEY);
  }

  private get isLocalTtsEnabled() {
    return this.ttsProvider === "local";
  }

  private get llmModel() {
    return process.env.AI_MODEL ?? process.env.OPENAI_LLM_MODEL ?? "gpt-4.1-mini";
  }

  private get sttModel() {
    return process.env.AI_STT_MODEL ?? process.env.OPENAI_STT_MODEL ?? "gpt-4o-mini-transcribe";
  }

  private get ttsModel() {
    return process.env.AI_TTS_MODEL ?? process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
  }

  private get localAiServiceUrl() {
    return this.localAiServiceValidation.value;
  }

  private get localAiTimeoutMs() {
    const parsed = Number(process.env.LOCAL_AI_TIMEOUT_MS ?? 30000);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30000;
  }

  private get ollamaServiceUrl() {
    return this.ollamaServiceValidation.value;
  }

  private get allowPublicLocalAiUrls() {
    return process.env.LOCAL_AI_ALLOW_PUBLIC_URLS === "true";
  }

  private get localAiServiceValidation() {
    return validateLocalAiEndpointUrl({
      rawUrl: process.env.LOCAL_AI_SERVICE_URL,
      fallbackUrl: "http://127.0.0.1:8008",
      allowPublicUrls: this.allowPublicLocalAiUrls
    });
  }

  private get ollamaServiceValidation() {
    return validateLocalAiEndpointUrl({
      rawUrl: process.env.OLLAMA_BASE_URL,
      fallbackUrl: "http://127.0.0.1:11434",
      allowPublicUrls: this.allowPublicLocalAiUrls
    });
  }

  private get salesAssistantModel() {
    return process.env.SALES_AI_MODEL ?? "RefinedNeuro/Turkcell-LLM-7b-v1:latest";
  }

  private get salesAssistantFallbackModel() {
    return process.env.SALES_AI_FALLBACK_MODEL ?? "llama3.2:3b";
  }

  private get salesAssistantTemperature() {
    const parsed = Number(process.env.SALES_AI_TEMPERATURE ?? 0.2);
    return Number.isFinite(parsed) ? parsed : 0.2;
  }

  private get salesAssistantTopP() {
    const parsed = Number(process.env.SALES_AI_TOP_P ?? 0.8);
    return Number.isFinite(parsed) ? parsed : 0.8;
  }

  private get salesAssistantRepeatPenalty() {
    const parsed = Number(process.env.SALES_AI_REPEAT_PENALTY ?? 1.15);
    return Number.isFinite(parsed) ? parsed : 1.15;
  }

  private get salesAssistantNumPredict() {
    const parsed = Number(process.env.SALES_AI_NUM_PREDICT ?? 160);
    return Number.isFinite(parsed) ? parsed : 160;
  }

  private buildSalesSystemPrompt() {
    return [
      "Sen Hallederiz CRM içinde çalışan Türkçe satış asistanısın.",
      "Sadece sistemde izin verilen ürün, stok, fiyat, teklif, sipariş, belge ve firma bilgilerini kullanırsın.",
      "Bilmediğin şeyi uydurmazsın.",
      "Fiyat veya stok bilgisi yoksa açıkça “Bu bilgi sistemde görünmüyor” dersin.",
      "Müşteriyi kısa, net ve profesyonel karşılarsın.",
      "Sipariş, teklif, ödeme, belge gönderimi veya kritik işlem yapmazsın; sadece öneri/taslak/onay akışına yönlendirirsin.",
      "Cevapların en fazla 2-4 kısa cümle olur.",
      "Gereksiz selamlama, İngilizce kelime, emoji ve anlamsız kapanış kullanma."
    ].join("\n");
  }

  private buildSalesGuardrail(
    status: SalesAiGuardrailDecision["status"],
    reasons: string[],
    usedSources: SalesAiGroundingSource[]
  ): SalesAiGuardrailDecision {
    return {
      tenantIdRequired: true,
      contextRequired: true,
      dataSourcesAllowed: usedSources.map((source) => source.type),
      criticalMutationBlocked: true,
      hallucinationRisk: usedSources.length > 0 ? "low" : "medium",
      status,
      reasons
    };
  }

  private buildBlockedSalesResponse(
    intent: SalesAiIntent,
    usedSources: SalesAiGroundingSource[],
    suggestedActions: SalesAiResponse["suggestedActions"],
    reason: string
  ): SalesAiResponse {
    return {
      ok: false,
      status: "blocked",
      intent,
      confidence: 0.1,
      reply: "Yerel AI servis adresi guvenlik politikasi nedeniyle engellendi. Lutfen sistem yoneticisine basvurun.",
      usedSources,
      suggestedActions,
      guardrail: this.buildSalesGuardrail("blocked_not_configured", [reason], usedSources),
      provider: {
        provider: "ollama",
        model: this.salesAssistantModel,
        fallbackModel: this.salesAssistantFallbackModel,
        fallbackUsed: false
      },
      mutationExecuted: false,
      externalProviderCallExecuted: false
    };
  }

  private async fetchOllamaModelNames(): Promise<string[]> {
    const response = await fetchWithTimeout(
      `${this.ollamaServiceUrl}/api/tags`,
      { method: "GET", headers: { accept: "application/json" } },
      this.localAiTimeoutMs
    );
    if (!response.ok) {
      throw new Error(`ollama_tags_failed_${response.status}`);
    }
    const payload = (await response.json()) as { models?: Array<{ name?: string }> };
    return (payload.models ?? []).map((item) => item.name?.trim() ?? "").filter(Boolean);
  }

  private async callOllamaGenerate(model: string, prompt: string): Promise<string> {
    const response = await fetchWithTimeout(
      `${this.ollamaServiceUrl}/api/generate`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: this.salesAssistantTemperature,
            top_p: this.salesAssistantTopP,
            repeat_penalty: this.salesAssistantRepeatPenalty,
            num_predict: this.salesAssistantNumPredict
          }
        })
      },
      this.localAiTimeoutMs
    );
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`ollama_generate_failed_${response.status}:${message}`);
    }
    const payload = (await response.json()) as { response?: string };
    return trimSalesReply(payload.response ?? "");
  }

  async getSalesAssistantHealth() {
    const provider = "ollama" as const;
    const primaryModel = this.salesAssistantModel;
    const fallbackModel = this.salesAssistantFallbackModel;
    if (!this.ollamaServiceValidation.configured) {
      return {
        ok: false,
        status: "not_configured" as const,
        provider,
        model: primaryModel,
        fallbackModel,
        modelReady: false,
        fallbackReady: false,
        reason: this.ollamaServiceValidation.reason ?? "local_ai_url_invalid",
        availableModels: [] as string[]
      };
    }
    if (!this.ollamaServiceValidation.allowed) {
      return {
        ok: false,
        status: "blocked" as const,
        provider,
        model: primaryModel,
        fallbackModel,
        modelReady: false,
        fallbackReady: false,
        reason: this.ollamaServiceValidation.reason ?? "local_ai_url_not_allowed",
        availableModels: [] as string[]
      };
    }
    try {
      const modelNames = await this.fetchOllamaModelNames();
      const primaryReady = modelNames.includes(primaryModel);
      const fallbackReady = modelNames.includes(fallbackModel);
      if (!primaryReady && !fallbackReady) {
        return {
          ok: false,
          status: "not_configured" as const,
          provider,
          model: primaryModel,
          fallbackModel,
          modelReady: false,
          fallbackReady: false,
          reason: "sales_ai_models_not_found",
          availableModels: modelNames
        };
      }
      return {
        ok: true,
        status: primaryReady ? ("healthy" as const) : ("degraded" as const),
        provider,
        model: primaryModel,
        fallbackModel,
        modelReady: primaryReady,
        fallbackReady,
        reason: primaryReady ? "sales_ai_ready" : "sales_ai_primary_missing_fallback_ready",
        availableModels: modelNames
      };
    } catch (error) {
      return {
        ok: false,
        status: "degraded" as const,
        provider,
        model: primaryModel,
        fallbackModel,
        modelReady: false,
        fallbackReady: false,
        reason: error instanceof Error ? error.message : "ollama_unavailable",
        availableModels: [] as string[]
      };
    }
  }

  async classifySalesIntent(input: { message: string }) {
    const intent = classifySalesIntent(input.message);
    return {
      intent,
      confidence: intent === "unknown" ? 0.45 : 0.82
    };
  }

  async chatSalesAssistant(input: SalesAssistantChatInput): Promise<SalesAiResponse> {
    const intent = classifySalesIntent(input.message);
    const lowered = input.message.toLowerCase();
    const matchedKnowledge = input.knowledge.filter((item) =>
      [item.productName, item.productId, item.category].filter(Boolean).some((field) => lowered.includes(String(field).toLowerCase()))
    );

    const usedSources: SalesAiGroundingSource[] = matchedKnowledge.slice(0, 3).map((item) => ({
      type: "product",
      id: item.id,
      title: item.productName,
      confidence: 0.9
    }));

    const blockedPrice = intent === "price_question" && matchedKnowledge.some((item) => item.priceVisibility === "hidden");
    const blockedStock = intent === "stock_question" && matchedKnowledge.some((item) => item.stockVisibility === "hidden");

    if ((intent === "price_question" || intent === "stock_question") && (matchedKnowledge.length === 0 || blockedPrice || blockedStock)) {
      return {
        ok: true,
        status: "live",
        intent,
        confidence: 0.84,
        reply: "Bu bilgi sistemde görünmüyor. Dilerseniz yetkili ekip için onay/talep kaydı oluşturabilirim.",
        usedSources,
        suggestedActions: [
          {
            actionKey: "platform.ai.propose",
            label: "Onay akışı için taslak oluştur",
            requiresApproval: true,
            suggestedOnly: true
          }
        ],
        guardrail: this.buildSalesGuardrail("allow_response", ["price_or_stock_not_visible"], usedSources),
        provider: {
          provider: "ollama",
          model: this.salesAssistantModel,
          fallbackModel: this.salesAssistantFallbackModel,
          effectiveModel: this.salesAssistantModel,
          fallbackUsed: false
        },
        mutationExecuted: false,
        externalProviderCallExecuted: false
      };
    }

    const suggestedActions =
      intent === "order_intent" ||
      intent === "quote_request" ||
      intent === "payment_question" ||
      intent === "return_request" ||
      intent === "delivery_question"
        ? [
            {
              actionKey: "platform.ai.propose",
              label: "Taslak oluştur ve onaya yönlendir",
              requiresApproval: true,
              suggestedOnly: true as const
            }
          ]
        : [];

    const health = await this.getSalesAssistantHealth();
    if (health.status === "not_configured") {
      return {
        ok: false,
        status: "not_configured",
        intent,
        confidence: 0.4,
        reply: "Yerel satış AI modeli henüz hazır değil. Bu işlem için sistem not_configured durumda.",
        usedSources,
        suggestedActions,
        guardrail: this.buildSalesGuardrail("blocked_not_configured", ["sales_ai_model_not_configured"], usedSources),
        provider: {
          provider: "ollama",
          model: this.salesAssistantModel,
          fallbackModel: this.salesAssistantFallbackModel,
          fallbackUsed: false
        },
        mutationExecuted: false,
        externalProviderCallExecuted: false
      };
    }
    if (health.status === "blocked") {
      return this.buildBlockedSalesResponse(intent, usedSources, suggestedActions, health.reason ?? "local_ai_url_not_allowed");
    }

    const modelNames = health.availableModels as string[];
    const primaryReady = modelNames.includes(this.salesAssistantModel);
    const fallbackReady = modelNames.includes(this.salesAssistantFallbackModel);
    const effectiveModel = primaryReady ? this.salesAssistantModel : fallbackReady ? this.salesAssistantFallbackModel : undefined;
    if (!effectiveModel) {
      return {
        ok: false,
        status: "degraded",
        intent,
        confidence: 0.3,
        reply: "Yerel satış AI servisi şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.",
        usedSources,
        suggestedActions,
        guardrail: this.buildSalesGuardrail("degraded", ["sales_ai_model_unavailable"], usedSources),
        provider: {
          provider: "ollama",
          model: this.salesAssistantModel,
          fallbackModel: this.salesAssistantFallbackModel,
          fallbackUsed: false
        },
        mutationExecuted: false,
        externalProviderCallExecuted: false
      };
    }

    const knowledgeContext = matchedKnowledge
      .slice(0, 4)
      .map(
        (item, index) =>
          `${index + 1}) Ürün: ${item.productName}; Kategori: ${item.category ?? "-"}; Açıklama: ${item.description ?? "-"}; Not: ${item.salesNotes ?? "-"}; İzinli iddialar: ${(item.allowedClaims ?? []).join(", ") || "-"}; Yasak iddialar: ${(item.blockedClaims ?? []).join(", ") || "-"}`
      )
      .join("\n");

    const prompt = [
      this.buildSalesSystemPrompt(),
      "",
      `Tenant: ${this.context.tenantId}`,
      `Müşteri: ${input.customerId ?? "-"}`,
      `Niyet: ${intent}`,
      "İzinli bilgi kaynakları:",
      knowledgeContext || "Bu mesaj için eşleşen bilgi bulunamadı.",
      "",
      `Kullanıcı mesajı: ${input.message}`
    ].join("\n");

    try {
      const reply = await this.callOllamaGenerate(effectiveModel, prompt);
      return {
        ok: true,
        status: primaryReady ? "live" : "degraded",
        intent,
        confidence: intent === "unknown" ? 0.55 : 0.86,
        reply: reply || "Bu bilgi sistemde görünmüyor.",
        usedSources,
        suggestedActions,
        guardrail: this.buildSalesGuardrail("allow_response", primaryReady ? ["sales_ai_primary_model"] : ["sales_ai_fallback_model"], usedSources),
        provider: {
          provider: "ollama",
          model: this.salesAssistantModel,
          fallbackModel: this.salesAssistantFallbackModel,
          effectiveModel,
          fallbackUsed: !primaryReady
        },
        mutationExecuted: false,
        externalProviderCallExecuted: false
      };
    } catch (error) {
      return {
        ok: false,
        status: "degraded",
        intent,
        confidence: 0.3,
        reply: "Yerel satış AI servisi şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.",
        usedSources,
        suggestedActions,
        guardrail: this.buildSalesGuardrail("degraded", [error instanceof Error ? error.message : "sales_ai_generate_failed"], usedSources),
        provider: {
          provider: "ollama",
          model: this.salesAssistantModel,
          fallbackModel: this.salesAssistantFallbackModel,
          effectiveModel,
          fallbackUsed: !primaryReady
        },
        mutationExecuted: false,
        externalProviderCallExecuted: false
      };
    }
  }

  async transcribeSalesVoice(input: VoiceTranscriptionInput) {
    if (!input.audioBase64) {
      return {
        ok: false,
        status: "degraded" as const,
        transcript: "",
        provider: "local",
        reason: "audio_missing"
      };
    }
    if (!this.localAiServiceValidation.configured) {
      return {
        ok: false,
        status: "not_configured" as const,
        transcript: "",
        provider: "local",
        reason: this.localAiServiceValidation.reason ?? "local_ai_url_invalid"
      };
    }
    if (!this.localAiServiceValidation.allowed) {
      return {
        ok: false,
        status: "blocked" as const,
        transcript: "",
        provider: "local",
        reason: this.localAiServiceValidation.reason ?? "local_ai_url_not_allowed"
      };
    }
    try {
      const body = new FormData();
      const buffer = Buffer.from(input.audioBase64, "base64");
      body.append("audio", new Blob([buffer], { type: input.mimeType ?? "audio/webm" }), "voice.webm");
      body.append("transcript_only", "true");
      const response = await fetchWithTimeout(
        `${this.localAiServiceUrl}/api/v1/chat/voice-stream`,
        {
          method: "POST",
          body
        },
        this.localAiTimeoutMs
      );
      if (!response.ok) {
        return {
          ok: false,
          status: "degraded" as const,
          transcript: "",
          provider: "local",
          reason: `local_voice_stream_${response.status}`
        };
      }
      const text = await response.text();
      const transcriptMatch = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line) as { type?: string; text?: string };
          } catch {
            return { type: "", text: "" };
          }
        })
        .find((item) => item.type === "transcript" || item.type === "done");
      const transcript = transcriptMatch?.text?.trim() ?? "";
      return {
        ok: transcript.length > 0,
        status: transcript.length > 0 ? ("live" as const) : ("degraded" as const),
        transcript,
        provider: "local",
        reason: transcript.length > 0 ? "ok" : "transcript_empty"
      };
    } catch (error) {
      return {
        ok: false,
        status: "degraded" as const,
        transcript: "",
        provider: "local",
        reason: error instanceof Error ? error.message : "local_voice_unavailable"
      };
    }
  }

  async speakSalesVoice(input: VoiceSpeakInput) {
    if (!input.text.trim()) {
      return {
        ok: false,
        status: "degraded" as const,
        provider: "local",
        reason: "text_missing"
      };
    }
    if (!this.localAiServiceValidation.configured) {
      return {
        ok: false,
        status: "not_configured" as const,
        provider: "local",
        reason: this.localAiServiceValidation.reason ?? "local_ai_url_invalid"
      };
    }
    if (!this.localAiServiceValidation.allowed) {
      return {
        ok: false,
        status: "blocked" as const,
        provider: "local",
        reason: this.localAiServiceValidation.reason ?? "local_ai_url_not_allowed"
      };
    }
    try {
      const response = await fetchWithTimeout(
        `${this.localAiServiceUrl}/api/v1/tts/stream`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: input.text, temperature: 0.2 })
        },
        this.localAiTimeoutMs
      );
      if (!response.ok) {
        return {
          ok: false,
          status: "degraded" as const,
          provider: "local",
          reason: `local_tts_stream_${response.status}`
        };
      }
      const lines = (await response.text())
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const audioEvent = lines
        .map((line) => {
          try {
            return JSON.parse(line) as { type?: string; audioBase64?: string };
          } catch {
            return { type: "" };
          }
        })
        .find((event) => event.type === "audio" && typeof event.audioBase64 === "string");
      if (!audioEvent?.audioBase64) {
        return {
          ok: false,
          status: "degraded" as const,
          provider: "local",
          reason: "tts_audio_missing"
        };
      }
      return {
        ok: true,
        status: "live" as const,
        provider: "local",
        audioRef: `data:audio/wav;base64,${audioEvent.audioBase64}`,
        mimeType: "audio/wav"
      };
    } catch (error) {
      return {
        ok: false,
        status: "degraded" as const,
        provider: "local",
        reason: error instanceof Error ? error.message : "local_tts_unavailable"
      };
    }
  }

  private async callLocalAiText(prompt: string) {
    if (!this.localAiServiceValidation.configured) {
      throw new Error(this.localAiServiceValidation.reason ?? "local_ai_url_invalid");
    }
    if (!this.localAiServiceValidation.allowed) {
      throw new Error(this.localAiServiceValidation.reason ?? "local_ai_url_not_allowed");
    }
    const response = await fetchWithTimeout(
      `${this.localAiServiceUrl}/api/v1/chat/text-stream`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          session_id: `crm_${this.context.tenantId}_${this.context.userId}`,
          temperature: 0.2
        })
      },
      this.localAiTimeoutMs
    );
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Local AI chat failed: ${response.status} ${message}`);
    }
    return parseLocalAiNdjson(await response.text());
  }

  async checkLocalProviderHealth() {
    if (!this.localAiServiceValidation.configured) {
      return {
        status: "degraded" as const,
        configured: false,
        reason: this.localAiServiceValidation.reason ?? "local_ai_url_invalid",
        details: { serviceUrl: this.localAiServiceValidation.value }
      };
    }
    if (!this.localAiServiceValidation.allowed) {
      return {
        status: "degraded" as const,
        configured: false,
        reason: this.localAiServiceValidation.reason ?? "local_ai_url_not_allowed",
        details: { serviceUrl: this.localAiServiceValidation.value }
      };
    }
    try {
      const response = await fetchWithTimeout(
        `${this.localAiServiceUrl}/health`,
        {
          method: "GET",
          headers: { accept: "application/json" }
        },
        this.localAiTimeoutMs
      );
      if (!response.ok) {
        return {
          status: "degraded" as const,
          configured: true,
          reason: `Lokal AI servisi ${response.status} dondu.`,
          details: { serviceUrl: this.localAiServiceUrl }
        };
      }
      const payload = (await response.json()) as Record<string, unknown>;
      return {
        status: "healthy" as const,
        configured: true,
        reason: "Lokal AI servisi erisilebilir.",
        details: { serviceUrl: this.localAiServiceUrl, ...payload }
      };
    } catch (error) {
      return {
        status: "degraded" as const,
        configured: true,
        reason: error instanceof Error ? error.message : "Lokal AI servisine erisilemedi.",
        details: { serviceUrl: this.localAiServiceUrl }
      };
    }
  }

  async chat(prompt: string) {
    if (this.isLocalLlmEnabled) {
      try {
        const text = await this.callLocalAiText(prompt);
        return {
          message: text || `Lokal AI yaniti bos dondu. Komut: ${prompt}`,
          provider: "local",
          mode: "live"
        };
      } catch (error) {
        return {
          message: `Lokal AI servisine ulasilamadi. Guvenli fallback: ${prompt}`,
          provider: "local",
          mode: "degraded",
          reason: error instanceof Error ? error.message : "local_ai_unavailable"
        };
      }
    }
    if (this.llmProvider === "mock") {
      return {
        message: `AI (guvenli fallback): ${prompt}`,
        provider: "mock",
        mode: "fallback"
      };
    }
    if (!this.isExternalLlmEnabled) {
      return {
        message: `AI (guvenli fallback): ${prompt}`,
        provider: "mock",
        mode: "fallback"
      };
    }
    const text = await callOpenAiChat({
      model: this.llmModel,
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

    if (this.isExternalLlmEnabled) {
      type ProposalPayload = {
        summary?: string;
        intent?: string;
        confidence?: number;
        riskNotes?: string[];
        requiredApprovals?: string[];
        operations?: Array<{ type?: string; summary?: string }>;
      };
      const llmText = await callOpenAiChat({
        model: this.llmModel,
        apiKey: process.env.OPENAI_API_KEY as string,
        system:
          "Sen CRM operator asistanisin. Yanitin sadece JSON olsun. Alanlar: summary, intent, confidence, riskNotes[], requiredApprovals[], operations[]. Her operation icin type ve summary ver.",
        user: `Kullanici komutu: ${input.prompt}\nMutation: ${classification.mutation ? "evet" : "hayir"}\nAksiyon tipi: ${classification.actionType}`
      });
      const parsed = safeJsonParse<ProposalPayload>(llmText);
      if (parsed) {
        proposal.summary = String(parsed.summary ?? proposal.summary);
        const riskNotes = Array.isArray(parsed.riskNotes) ? parsed.riskNotes.map((item) => String(item)) : [];
        const requiredApprovals = Array.isArray(parsed.requiredApprovals)
          ? parsed.requiredApprovals.map((item) => String(item))
          : [];
        proposal.title = `${String(parsed.intent ?? classification.actionType)} | guven ${Number.isFinite(parsed.confidence) ? Number(parsed.confidence).toFixed(2) : "0.70"}`;
        if (Array.isArray(parsed.operations) && parsed.operations.length > 0) {
          proposal.operations = parsed.operations.map((operation, index) => ({
            id: `${proposal.id}_op_${index + 1}`,
            type: (operation.type as AiProposal["operations"][number]["type"]) ?? classification.actionType,
            targetType: input.targetType ?? "order",
            targetId: input.targetId ?? proposal.targetId ?? "order_1",
            targetNo: input.targetNo ?? proposal.targetNo ?? "N/A",
            mutation: classification.mutation,
            summary: String(operation.summary ?? proposal.summary),
            payload: {
              requestText: input.prompt,
              source: "external_openai_live",
              riskNotes,
              requiredApprovals
            }
          }));
        }
      } else {
        proposal.summary = `${proposal.summary} [Structured parse fallback]`;
      }
    }

    const approvalDraft = proposal.requiresApproval ? buildApprovalFromAiProposal(proposal) : undefined;
    return { proposal, approvalDraft };
  }

  async generateInsights(): Promise<AiInsight[]> {
    const now = new Date().toISOString();
    if (this.isLocalLlmEnabled) {
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
    if (!this.isExternalLlmEnabled) {
      return [
        {
          id: `ai_insight_${Date.now()}_fallback`,
          tenantId: this.context.tenantId,
          title: "Fallback AI insight",
          category: "operation",
          severity: "warning",
          confidence: 0.55,
          summary: "Harici AI baglantisi aktif degil. Lokal stack secimi veya provider ayarlari kontrol edilmeli.",
          targetType: "customer",
          targetId: "customer_1",
          targetNo: "CUS-001",
          suggestedAction: "read_summary",
          createdAt: now
        }
      ];
    }
    const text = await callOpenAiChat({
      model: this.llmModel,
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
    if (this.isLocalSttEnabled) {
      return {
        transcript: "Lokal STT sonucu: sesli komut metne cevrildi.",
        detectedLanguage: input.language ?? "tr",
        provider: "local"
      };
    }
    if (!this.isExternalSttEnabled) {
      return {
        transcript: "Fallback transcript: ses kaydi metne cevrildi.",
        detectedLanguage: input.language ?? "tr",
        provider: "mock"
      };
    }

    const buffer = Buffer.from(input.audioBase64, "base64");
    const form = new FormData();
    form.append("model", this.sttModel);
    form.append("language", input.language ?? "tr");
    form.append("file", new Blob([buffer], { type: input.mimeType ?? "audio/webm" }), "voice.webm");

    const response = await withRetry(
      () =>
        fetchWithTimeout(
          "https://api.openai.com/v1/audio/transcriptions",
          {
            method: "POST",
            headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            body: form
          },
          Number(process.env.AI_TIMEOUT_MS ?? 15000)
        ),
      Number(process.env.AI_RETRY_COUNT ?? 1)
    );
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
    if (this.isLocalTtsEnabled) {
      return {
        audioRef: `local://tts/${Date.now()}`,
        provider: "local",
        mimeType: "audio/mpeg"
      };
    }
    if (!this.isExternalTtsEnabled) {
      return {
        audioRef: `mock://tts/${Date.now()}`,
        provider: "mock",
        mimeType: "audio/mpeg"
      };
    }
    const response = await withRetry(
      () =>
        fetchWithTimeout(
          "https://api.openai.com/v1/audio/speech",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: this.ttsModel,
              input: input.text,
              voice: input.voice ?? process.env.AI_TTS_VOICE ?? "alloy",
              speed: input.speed ?? 1
            })
          },
          Number(process.env.AI_TIMEOUT_MS ?? 15000)
        ),
      Number(process.env.AI_RETRY_COUNT ?? 1)
    );
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

  getHealth() {
    const config = validateAiConfig();
    return {
      ...config,
      details: {
        ...config.details,
        llmModel: this.llmModel,
        sttModel: this.sttModel,
        ttsModel: this.ttsModel
      }
    };
  }
}
