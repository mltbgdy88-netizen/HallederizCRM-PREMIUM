import { containsTechnicalUserText } from "../../../lib/user-facing-data-error";
import type { LocalAiHealthSnapshot } from "./normalize-local-ai-health";

export type SalesAssistantHealthSnapshot = {
  status: "healthy" | "degraded" | "not_configured" | "blocked";
  reason: string;
  model: string;
  fallbackModel: string;
  modelReady: boolean;
  fallbackReady: boolean;
};

export type LocalAiChannelHealthView = {
  statusLine: string;
  note: string;
  dotTone: "warn" | "ok" | "error";
};

function sanitizeMessage(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed || containsTechnicalUserText(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export function mapLocalAiChannelHealthView(
  localHealth: LocalAiHealthSnapshot | null,
  salesHealth: SalesAssistantHealthSnapshot | null,
  options: { useDemoData: boolean }
): LocalAiChannelHealthView {
  if (options.useDemoData) {
    return {
      statusLine: "Demo modu",
      note: "Canlı yerel yapay zekâ bağlantısı kapalı; örnek veriler gösteriliyor.",
      dotTone: "warn"
    };
  }

  if (localHealth?.ready === true || localHealth?.state === "ready") {
    return {
      statusLine: "Yerel yapay zekâ hazır",
      note: sanitizeMessage(localHealth.message, "Ollama uç noktasına erişim doğrulandı."),
      dotTone: "ok"
    };
  }

  if (salesHealth?.status === "healthy" && (salesHealth.modelReady || salesHealth.fallbackReady)) {
    return {
      statusLine: "Satış asistanı modeli hazır",
      note: "Yerel model veya yedek model yanıt üretebilir.",
      dotTone: "ok"
    };
  }

  if (localHealth?.state === "not_configured" || localHealth?.configured === false) {
    return {
      statusLine: "Yerel yapay zekâ yapılandırılmadı",
      note: sanitizeMessage(
        localHealth?.message,
        "OLLAMA_BASE_URL ve model ortam değişkenleri tanımlandığında durum burada görünür."
      ),
      dotTone: "warn"
    };
  }

  if (localHealth?.state === "error" || localHealth?.status === "error") {
    return {
      statusLine: "Yerel yapay zekâ erişilemiyor",
      note: sanitizeMessage(localHealth?.message, "Ollama uç noktasına ulaşılamadı veya model hazır değil."),
      dotTone: "error"
    };
  }

  if (salesHealth?.status === "degraded") {
    return {
      statusLine: "Model kısıtlı",
      note: "Birincil model hazır değil; yedek model veya salt okunur mod devrede olabilir.",
      dotTone: "warn"
    };
  }

  if (!localHealth && !salesHealth) {
    return {
      statusLine: "Yerel yapay zekâ durumu bekleniyor",
      note: "Sağlık kontrolü yükleniyor.",
      dotTone: "warn"
    };
  }

  return {
    statusLine: "Yerel yapay zekâ bağlantısı bekleniyor",
    note: sanitizeMessage(localHealth?.message ?? salesHealth?.reason, "Model hazır değil."),
    dotTone: "warn"
  };
}

export function canRunLocalAiInsights(
  localHealth: LocalAiHealthSnapshot | null,
  salesHealth: SalesAssistantHealthSnapshot | null,
  useDemoData: boolean
): boolean {
  if (useDemoData) {
    return true;
  }
  if (localHealth?.ready === true) {
    return true;
  }
  if (!salesHealth) {
    return false;
  }
  if (salesHealth.status === "blocked" || salesHealth.status === "not_configured") {
    return false;
  }
  return salesHealth.modelReady || salesHealth.fallbackReady;
}
