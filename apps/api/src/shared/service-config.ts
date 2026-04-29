export type ServiceHealthStatus = "healthy" | "degraded" | "fallback" | "disabled" | "misconfigured" | "error";
export type ServiceMode = "live" | "fallback" | "disabled" | "mock";

export interface ServiceHealthResult {
  service: "ai" | "whatsapp" | "erp" | "factory" | "local-agent";
  status: ServiceHealthStatus;
  mode: ServiceMode;
  configured: boolean;
  reason: string;
  lastCheckedAt: string;
  details: Record<string, unknown>;
}

interface ValidationResult {
  configured: boolean;
  missing: string[];
}

function validateRequired(keys: string[]) {
  const missing = keys.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === null || `${value}`.trim().length === 0;
  });
  return {
    configured: missing.length === 0,
    missing
  } satisfies ValidationResult;
}

function nowIso() {
  return new Date().toISOString();
}

export function validateAiConfig() {
  const llmProvider = process.env.AI_LLM_PROVIDER ?? "local";
  const sttProvider = process.env.AI_STT_PROVIDER ?? "local";
  const ttsProvider = process.env.AI_TTS_PROVIDER ?? "local";
  const externalRequested = [llmProvider, sttProvider, ttsProvider].includes("openai");
  const localRequested = [llmProvider, sttProvider, ttsProvider].includes("local");
  const required = externalRequested
    ? validateRequired([
        "OPENAI_API_KEY",
        "AI_MODEL",
        "AI_STT_MODEL",
        "AI_TTS_MODEL",
        "AI_TTS_VOICE",
        "AI_TIMEOUT_MS",
        "AI_RETRY_COUNT"
      ])
    : { configured: true, missing: [] };

  const externalConfigured = required.configured;
  const activeMode: "local" | "external" | "fallback" = localRequested
    ? "local"
    : externalRequested && externalConfigured
      ? "external"
      : "fallback";
  const status: ServiceHealthStatus = activeMode === "local"
    ? externalRequested && !externalConfigured
      ? "degraded"
      : "healthy"
    : activeMode === "external"
      ? "healthy"
      : externalRequested
        ? "misconfigured"
        : "fallback";

  return {
    service: "ai" as const,
    status,
    mode: activeMode === "fallback" ? "fallback" : "live",
    configured: activeMode !== "fallback",
    reason:
      activeMode === "local"
        ? externalRequested && !externalConfigured
          ? "Lokal AI aktif. Harici provider eksik ayar nedeniyle opsiyonel modda bekliyor."
          : "Lokal AI aktif ve birincil modda hazir."
        : activeMode === "external"
          ? "Harici AI provider aktif. Lokal provider opsiyonel olarak acilabilir."
          : externalRequested
            ? `Harici AI icin eksik env: ${required.missing.join(", ")}`
            : "AI fallback modunda calisiyor.",
    lastCheckedAt: nowIso(),
    details: {
      providers: { llmProvider, sttProvider, ttsProvider },
      localStatus: localRequested ? "ready" : "missing",
      externalStatus: externalRequested ? (externalConfigured ? "ready" : "missing") : "optional",
      activeProviderMode: activeMode,
      missing: required.missing
    }
  } satisfies ServiceHealthResult;
}

export function validateWhatsAppConfig() {
  const provider = process.env.WHATSAPP_PROVIDER ?? "mock";
  const liveRequested = provider === "live";
  const required = liveRequested
    ? validateRequired([
        "WHATSAPP_API_BASE_URL",
        "WHATSAPP_API_TOKEN",
        "WHATSAPP_PHONE_NUMBER_ID",
        "WHATSAPP_BUSINESS_ACCOUNT_ID",
        "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
        "WHATSAPP_WEBHOOK_APP_SECRET"
      ])
    : { configured: true, missing: [] };
  return {
    service: "whatsapp" as const,
    status: liveRequested ? (required.configured ? "healthy" : "misconfigured") : "fallback",
    mode: liveRequested ? (required.configured ? "live" : "fallback") : "mock",
    configured: required.configured,
    reason: required.configured ? (liveRequested ? "WhatsApp canli baglanti hazir." : "WhatsApp mock/fallback modunda.") : `Eksik env: ${required.missing.join(", ")}`,
    lastCheckedAt: nowIso(),
    details: {
      provider,
      missing: required.missing
    }
  } satisfies ServiceHealthResult;
}

export function validateErpConfig() {
  const provider = process.env.ERP_PROVIDER ?? "mock";
  const liveRequested = provider === "live";
  const required = liveRequested
    ? validateRequired(["ERP_API_BASE_URL", "ERP_TIMEOUT_MS"])
    : { configured: true, missing: [] };
  const authModes = [process.env.ERP_API_KEY ? "api_key" : null, process.env.ERP_USERNAME && process.env.ERP_PASSWORD ? "username_password" : null].filter(Boolean);
  const authConfigured = !liveRequested || authModes.length > 0;
  const configured = required.configured && authConfigured;
  const missing = [...required.missing, ...(authConfigured ? [] : ["ERP_API_KEY veya ERP_USERNAME+ERP_PASSWORD"])];
  return {
    service: "erp" as const,
    status: liveRequested ? (configured ? "healthy" : "misconfigured") : "fallback",
    mode: liveRequested ? (configured ? "live" : "fallback") : "mock",
    configured,
    reason: configured ? (liveRequested ? "ERP canli baglanti hazir." : "ERP mock/fallback modunda.") : `Eksik env: ${missing.join(", ")}`,
    lastCheckedAt: nowIso(),
    details: {
      provider,
      authModes,
      missing
    }
  } satisfies ServiceHealthResult;
}

export function validateFactoryConfig() {
  const provider = process.env.FACTORY_PROVIDER ?? "mock";
  const liveRequested = provider === "live";
  const required = liveRequested ? validateRequired(["FACTORY_API_BASE_URL", "FACTORY_API_KEY", "FACTORY_TIMEOUT_MS"]) : { configured: true, missing: [] };
  return {
    service: "factory" as const,
    status: liveRequested ? (required.configured ? "healthy" : "misconfigured") : "fallback",
    mode: liveRequested ? (required.configured ? "live" : "fallback") : "mock",
    configured: required.configured,
    reason: required.configured ? (liveRequested ? "Factory canli baglanti hazir." : "Factory mock/fallback modunda.") : `Eksik env: ${required.missing.join(", ")}`,
    lastCheckedAt: nowIso(),
    details: {
      provider,
      missing: required.missing
    }
  } satisfies ServiceHealthResult;
}

export function validateLocalAgentConfig() {
  const mode = (process.env.LOCAL_AGENT_MODE ?? "enabled") as "enabled" | "disabled";
  const required = mode === "enabled" ? validateRequired(["LOCAL_OUTPUT_ROOT", "DEFAULT_PRINTER_NAME", "LOCAL_AGENT_POLL_INTERVAL_MS"]) : { configured: true, missing: [] };
  const hasHealthSecret = Boolean(process.env.LOCAL_AGENT_HEALTH_SECRET);
  return {
    service: "local-agent" as const,
    status: mode === "disabled" ? "disabled" : required.configured ? "healthy" : "misconfigured",
    mode: mode === "disabled" ? "disabled" : required.configured ? "live" : "fallback",
    configured: required.configured,
    reason: mode === "disabled" ? "Local agent disabled modunda." : required.configured ? "Local agent canli moda hazir." : `Eksik env: ${required.missing.join(", ")}`,
    lastCheckedAt: nowIso(),
    details: {
      mode,
      hasHealthSecret,
      missing: required.missing
    }
  } satisfies ServiceHealthResult;
}

export function buildIntegrationsHealthSummary(healthItems: ServiceHealthResult[]) {
  const severityRank: Record<ServiceHealthStatus, number> = {
    healthy: 0,
    degraded: 1,
    fallback: 2,
    disabled: 3,
    misconfigured: 4,
    error: 5
  };
  const highest = healthItems.reduce<ServiceHealthStatus>((acc, item) => {
    return severityRank[item.status] > severityRank[acc] ? item.status : acc;
  }, "healthy");
  return {
    status: highest,
    configuredCount: healthItems.filter((item) => item.configured).length,
    liveCount: healthItems.filter((item) => item.mode === "live").length,
    fallbackCount: healthItems.filter((item) => item.mode === "fallback" || item.mode === "mock").length,
    disabledCount: healthItems.filter((item) => item.mode === "disabled").length,
    lastCheckedAt: nowIso(),
    services: healthItems
  };
}
