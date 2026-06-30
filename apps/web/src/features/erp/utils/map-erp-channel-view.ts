import { containsTechnicalUserText } from "../../../lib/user-facing-data-error";
import type { ErpHealthSnapshot } from "./normalize-erp-health";

export type ErpChannelHealthView = {
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

export function mapErpChannelHealthView(
  health: ErpHealthSnapshot | null,
  options: { useDemoData: boolean }
): ErpChannelHealthView {
  if (options.useDemoData) {
    return {
      statusLine: "Demo modu",
      note: "Canlı ERP bağlantısı kapalı; örnek entegrasyon verileri gösteriliyor.",
      dotTone: "warn"
    };
  }

  if (health?.mode === "live" && health.configured) {
    return {
      statusLine: "ERP canlı bağlantı hazır",
      note: sanitizeMessage(health.reason, "Sağlayıcı yapılandırması tamamlandı."),
      dotTone: "ok"
    };
  }

  if (health?.status === "misconfigured" || health?.configured === false) {
    return {
      statusLine: "ERP yapılandırması eksik",
      note: sanitizeMessage(health?.reason, "ERP_API_BASE_URL ve kimlik bilgileri tanımlandığında durum güncellenir."),
      dotTone: "warn"
    };
  }

  if (health?.status === "error") {
    return {
      statusLine: "ERP bağlantı hatası",
      note: sanitizeMessage(health?.reason, "Sağlayıcıya ulaşılamıyor veya kimlik doğrulama başarısız."),
      dotTone: "error"
    };
  }

  if (health?.mode === "mock" || health?.mode === "fallback") {
    return {
      statusLine: "ERP mock / fallback modu",
      note: sanitizeMessage(health?.reason, "Test ve senkron önizleme modunda çalışır."),
      dotTone: "warn"
    };
  }

  if (!health) {
    return {
      statusLine: "ERP durumu bekleniyor",
      note: "Sağlık kontrolü yükleniyor.",
      dotTone: "warn"
    };
  }

  return {
    statusLine: "ERP entegrasyonu izleniyor",
    note: sanitizeMessage(health.reason, "Bağlantı testi ve senkron bu ekrandan başlatılabilir."),
    dotTone: health.status === "healthy" ? "ok" : "warn"
  };
}

export function canOperateErpIntegration(health: ErpHealthSnapshot | null, useDemoData: boolean): boolean {
  if (useDemoData) {
    return true;
  }
  if (!health) {
    return false;
  }
  if (health.status === "error") {
    return false;
  }
  return true;
}

export function canOperateErpConnection(
  connection: { active: boolean; status: string } | null | undefined,
  useDemoData: boolean
): boolean {
  if (!connection) {
    return false;
  }
  if (useDemoData) {
    return true;
  }
  return connection.active && connection.status !== "passive";
}
