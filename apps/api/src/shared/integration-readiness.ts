import type { ServiceHealthStatus, ServiceMode } from "./service-config";
import { validateLocalAiEndpointUrl } from "./local-ai-url-policy";

export type IntegrationReadinessState = "disabled" | "not_configured" | "configured" | "ready" | "error";

export interface IntegrationReadinessView {
  state: IntegrationReadinessState;
  provider: string;
  configured: boolean;
  ready: boolean;
  status: ServiceHealthStatus;
  mode: ServiceMode;
  message: string;
  reasonCode: string;
  lastCheckedAt: string;
  missingEnv: string[];
  details: Record<string, unknown>;
}

function nowIso() {
  return new Date().toISOString();
}

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

function resolveWhatsAppProviderName(): string {
  return (process.env.WHATSAPP_PROVIDER ?? "disabled").trim().toLowerCase();
}

function resolveWhatsAppLiveEnv(): { configured: boolean; missing: string[] } {
  const required = ["WHATSAPP_PHONE_NUMBER_ID"];
  const tokenKeys = ["WHATSAPP_API_TOKEN", "WHATSAPP_ACCESS_TOKEN"];
  const missing = required.filter((key) => !hasText(process.env[key]));
  const hasToken = tokenKeys.some((key) => hasText(process.env[key]));
  if (!hasToken) {
    missing.push("WHATSAPP_API_TOKEN");
  }
  const baseUrl = process.env.WHATSAPP_API_BASE_URL?.trim() || "https://graph.facebook.com/v21.0";
  if (!baseUrl.startsWith("https://")) {
    missing.push("WHATSAPP_API_BASE_URL");
  }
  return { configured: missing.length === 0, missing };
}

export function resolveWhatsAppReadiness(): IntegrationReadinessView {
  const provider = resolveWhatsAppProviderName();
  const liveEnv = resolveWhatsAppLiveEnv();
  const allowMock =
    process.env.NODE_ENV !== "production" && process.env.OMNICHANNEL_ALLOW_MOCK_PROVIDERS === "true";

  if (provider === "disabled") {
    return {
      state: "disabled",
      provider,
      configured: false,
      ready: false,
      status: "disabled",
      mode: "disabled",
      message: "WhatsApp sağlayıcısı yapılandırılmadı.",
      reasonCode: "whatsapp_provider_disabled",
      lastCheckedAt: nowIso(),
      missingEnv: ["WHATSAPP_PROVIDER"],
      details: { allowMock, runtimeLiveConfigured: false }
    };
  }

  if (provider === "mock") {
    return {
      state: "not_configured",
      provider,
      configured: false,
      ready: false,
      status: allowMock ? "fallback" : "disabled",
      mode: "mock",
      message: allowMock
        ? "Önizleme modu: canlı WhatsApp bağlantısı kapalı."
        : "WhatsApp sağlayıcısı yapılandırılmadı.",
      reasonCode: "whatsapp_mock_not_live",
      lastCheckedAt: nowIso(),
      missingEnv: [],
      details: { allowMock, runtimeLiveConfigured: false }
    };
  }

  if (provider === "live" || provider === "meta") {
    if (!liveEnv.configured) {
      return {
        state: "not_configured",
        provider,
        configured: false,
        ready: false,
        status: "misconfigured",
        mode: "fallback",
        message: "WhatsApp sağlayıcısı yapılandırılmadı. Ortam değişkenleri tamamlandığında durum burada görünecek.",
        reasonCode: "whatsapp_live_env_missing",
        lastCheckedAt: nowIso(),
        missingEnv: liveEnv.missing,
        details: {
          runtimeLiveConfigured: false,
          phoneNumberIdSet: hasText(process.env.WHATSAPP_PHONE_NUMBER_ID)
        }
      };
    }
    return {
      state: "ready",
      provider,
      configured: true,
      ready: true,
      status: "healthy",
      mode: "live",
      message: "WhatsApp sağlayıcısı yapılandırıldı. Bağlantı ve mesaj akışı canlı ortamda test edilmelidir.",
      reasonCode: "whatsapp_live_configured",
      lastCheckedAt: nowIso(),
      missingEnv: [],
      details: {
        runtimeLiveConfigured: true,
        apiBaseUrl: process.env.WHATSAPP_API_BASE_URL?.trim() || "https://graph.facebook.com/v21.0",
        webhookVerifyConfigured: hasText(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
        webhookSecretConfigured: hasText(process.env.WHATSAPP_WEBHOOK_APP_SECRET)
      }
    };
  }

  return {
    state: "not_configured",
    provider,
    configured: false,
    ready: false,
    status: "misconfigured",
    mode: "disabled",
    message: "WhatsApp sağlayıcısı tanınmıyor. WHATSAPP_PROVIDER değerini kontrol edin.",
    reasonCode: "whatsapp_provider_unknown",
    lastCheckedAt: nowIso(),
    missingEnv: ["WHATSAPP_PROVIDER"],
    details: { allowMock }
  };
}

function resolveAiProviderName(): string {
  return (process.env.AI_PROVIDER ?? "disabled").trim().toLowerCase();
}

function mapLocalAiReasonToMessage(reasonCode: string): string {
  switch (reasonCode) {
    case "ai_provider_disabled":
      return "Lokal AI yapılandırılmadı.";
    case "ai_local_disabled":
      return "Lokal AI devre dışı. AI_LOCAL_ENABLED=true ile açılabilir.";
    case "ollama_url_invalid":
    case "local_ai_url_invalid":
      return "Lokal AI uç adresi geçersiz veya eksik.";
    case "ollama_url_not_allowed":
    case "local_ai_url_not_allowed":
      return "Lokal AI uç adresi güvenlik politikasına uygun değil.";
    case "ollama_unreachable":
      return "Lokal AI uç noktasına ulaşılamıyor. Ollama veya uyumlu servisin çalıştığını doğrulayın.";
    case "sales_ai_models_not_found":
      return "Lokal AI modeli bulunamadı. Ollama pull komutu ile modeli indirin.";
    case "sales_ai_ready":
      return "Lokal AI hazır. Öneriler yalnızca inceleme içindir; kayıt otomatik değiştirilmez.";
    case "openai_compatible_configured":
      return "OpenAI uyumlu lokal uç yapılandırıldı.";
    default:
      return "Lokal AI durumu kontrol ediliyor.";
  }
}

export function resolveLocalAiReadinessBase(): IntegrationReadinessView {
  const provider = resolveAiProviderName();
  const localEnabled = process.env.AI_LOCAL_ENABLED === "true";
  const ollama = validateLocalAiEndpointUrl({
    rawUrl: process.env.OLLAMA_BASE_URL,
    fallbackUrl: "http://127.0.0.1:11434",
    allowPublicUrls: process.env.LOCAL_AI_ALLOW_PUBLIC_URLS === "true"
  });
  const openAiCompatibleBase = process.env.AI_LOCAL_BASE_URL?.trim() || process.env.OPENAI_COMPATIBLE_BASE_URL?.trim();
  const model = process.env.AI_LOCAL_MODEL?.trim() || process.env.OLLAMA_MODEL?.trim() || process.env.SALES_AI_MODEL?.trim() || "";

  if (provider === "disabled" || provider === "off") {
    return {
      state: "disabled",
      provider: "disabled",
      configured: false,
      ready: false,
      status: "disabled",
      mode: "disabled",
      message: mapLocalAiReasonToMessage("ai_provider_disabled"),
      reasonCode: "ai_provider_disabled",
      lastCheckedAt: nowIso(),
      missingEnv: ["AI_PROVIDER"],
      details: { localEnabled, reviewOnly: true }
    };
  }

  if (!localEnabled && provider !== "local" && provider !== "ollama" && provider !== "openai-compatible") {
    return {
      state: "disabled",
      provider,
      configured: false,
      ready: false,
      status: "disabled",
      mode: "disabled",
      message: mapLocalAiReasonToMessage("ai_local_disabled"),
      reasonCode: "ai_local_disabled",
      lastCheckedAt: nowIso(),
      missingEnv: ["AI_LOCAL_ENABLED"],
      details: { localEnabled, reviewOnly: true }
    };
  }

  if (provider === "openai-compatible" || (localEnabled && hasText(openAiCompatibleBase))) {
    const compatible = validateLocalAiEndpointUrl({
      rawUrl: openAiCompatibleBase,
      fallbackUrl: "",
      allowPublicUrls: process.env.LOCAL_AI_ALLOW_PUBLIC_URLS === "true"
    });
    if (!compatible.configured || !compatible.allowed) {
      return {
        state: "not_configured",
        provider: "openai-compatible",
        configured: false,
        ready: false,
        status: "misconfigured",
        mode: "fallback",
        message: mapLocalAiReasonToMessage(compatible.reason ?? "local_ai_url_invalid"),
        reasonCode: "openai_compatible_url_invalid",
        lastCheckedAt: nowIso(),
        missingEnv: ["AI_LOCAL_BASE_URL"],
        details: { model: model || undefined, reviewOnly: true }
      };
    }
    return {
      state: "configured",
      provider: "openai-compatible",
      configured: true,
      ready: false,
      status: "degraded",
      mode: "live",
      message: mapLocalAiReasonToMessage("openai_compatible_configured"),
      reasonCode: "openai_compatible_configured",
      lastCheckedAt: nowIso(),
      missingEnv: model ? [] : ["AI_LOCAL_MODEL"],
      details: {
        baseUrl: compatible.value,
        model: model || undefined,
        reviewOnly: true
      }
    };
  }

  if (provider === "openai" && hasText(process.env.OPENAI_API_KEY)) {
    return {
      state: "configured",
      provider: "openai",
      configured: true,
      ready: false,
      status: "healthy",
      mode: "live",
      message: "Harici AI sağlayıcısı yapılandırıldı. Lokal uç için AI_PROVIDER=ollama veya openai-compatible kullanın.",
      reasonCode: "external_openai_configured",
      lastCheckedAt: nowIso(),
      missingEnv: [],
      details: { reviewOnly: true }
    };
  }

  if (!ollama.configured || !ollama.allowed) {
    return {
      state: "not_configured",
      provider: "ollama",
      configured: false,
      ready: false,
      status: "misconfigured",
      mode: "fallback",
      message: mapLocalAiReasonToMessage(ollama.reason ?? "ollama_url_invalid"),
      reasonCode: ollama.reason ?? "ollama_url_invalid",
      lastCheckedAt: nowIso(),
      missingEnv: ["OLLAMA_BASE_URL"],
      details: { localEnabled, reviewOnly: true }
    };
  }

  return {
    state: "configured",
    provider: provider === "ollama" ? "ollama" : "local",
    configured: true,
    ready: false,
    status: "degraded",
    mode: "live",
    message: "Lokal AI uç adresi yapılandırıldı. Model hazırlığı için Ollama servisini çalıştırın.",
    reasonCode: "ollama_configured_pending_probe",
    lastCheckedAt: nowIso(),
    missingEnv: model ? [] : ["OLLAMA_MODEL", "AI_LOCAL_MODEL"],
    details: {
      baseUrl: ollama.value,
      model: model || undefined,
      localServiceUrl: process.env.LOCAL_AI_SERVICE_URL?.trim() || undefined,
      reviewOnly: true
    }
  };
}

export async function probeOllamaReachable(baseUrl: string, timeoutMs = 5000): Promise<boolean> {
  const normalized = baseUrl.replace(/\/+$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${normalized}/api/tags`, { method: "GET", signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveLocalAiReadinessWithProbe(): Promise<IntegrationReadinessView> {
  const base = resolveLocalAiReadinessBase();
  if (base.state !== "configured" || base.provider !== "ollama" && base.provider !== "local") {
    return base;
  }
  const url = typeof base.details.baseUrl === "string" ? base.details.baseUrl : process.env.OLLAMA_BASE_URL;
  if (!url) {
    return base;
  }
  const reachable = await probeOllamaReachable(url, Number(process.env.AI_LOCAL_TIMEOUT_MS ?? 5000));
  if (!reachable) {
    return {
      ...base,
      state: "error",
      ready: false,
      status: "error",
      message: mapLocalAiReasonToMessage("ollama_unreachable"),
      reasonCode: "ollama_unreachable"
    };
  }
  return {
    ...base,
    state: "ready",
    ready: true,
    status: "healthy",
    message: mapLocalAiReasonToMessage("sales_ai_ready"),
    reasonCode: "ollama_reachable"
  };
}

export class IntegrationNotReadyError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly userMessage: string;

  constructor(view: IntegrationReadinessView, code = "integration_not_ready") {
    super(view.message);
    this.name = "IntegrationNotReadyError";
    this.code = code;
    this.statusCode = 503;
    this.userMessage = view.message;
  }
}

export function assertWhatsAppReady(): void {
  const view = resolveWhatsAppReadiness();
  if (!view.ready) {
    throw new IntegrationNotReadyError(view, "whatsapp_not_configured");
  }
}
