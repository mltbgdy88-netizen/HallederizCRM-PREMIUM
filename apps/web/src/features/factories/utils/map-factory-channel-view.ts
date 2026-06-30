import { containsTechnicalUserText } from "../../../lib/user-facing-data-error";
import type { FactoryHealthSnapshot } from "./normalize-factory-health";

export type FactoryChannelHealthView = {
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

export function mapFactoryChannelHealthView(
  health: FactoryHealthSnapshot | null,
  options: { useDemoData: boolean }
): FactoryChannelHealthView {
  if (options.useDemoData) {
    return {
      statusLine: "Demo modu",
      note: "Canlı fabrika bağlantısı kapalı; örnek stok ve sipariş verileri gösteriliyor.",
      dotTone: "warn"
    };
  }

  if (health?.mode === "live" && health.configured) {
    return {
      statusLine: "Fabrika canlı bağlantı hazır",
      note: sanitizeMessage(health.reason, "Sağlayıcı yapılandırması tamamlandı."),
      dotTone: "ok"
    };
  }

  if (health?.status === "misconfigured" || health?.configured === false) {
    return {
      statusLine: "Fabrika yapılandırması eksik",
      note: sanitizeMessage(health?.reason, "FACTORY_API_BASE_URL tanımlandığında durum güncellenir."),
      dotTone: "warn"
    };
  }

  if (health?.status === "error") {
    return {
      statusLine: "Fabrika bağlantı hatası",
      note: sanitizeMessage(health?.reason, "Sağlayıcıya ulaşılamıyor veya kimlik doğrulama başarısız."),
      dotTone: "error"
    };
  }

  if (health?.mode === "mock" || health?.mode === "fallback") {
    return {
      statusLine: "Fabrika mock / fallback modu",
      note: sanitizeMessage(health?.reason, "Stok senkronu ve sipariş iletimi önizleme modunda çalışır."),
      dotTone: "warn"
    };
  }

  if (!health) {
    return {
      statusLine: "Fabrika durumu bekleniyor",
      note: "Sağlık kontrolü yükleniyor.",
      dotTone: "warn"
    };
  }

  return {
    statusLine: "Fabrika entegrasyonu izleniyor",
    note: sanitizeMessage(health.reason, "Stok senkronu ve sipariş iletimi bu ekrandan başlatılabilir."),
    dotTone: health.status === "healthy" ? "ok" : "warn"
  };
}

export function canOperateFactoryIntegration(health: FactoryHealthSnapshot | null, useDemoData: boolean): boolean {
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

export function canOperateFactoryRecord(
  record: { active?: boolean } | null | undefined,
  useDemoData: boolean
): boolean {
  if (!record) {
    return false;
  }
  if (useDemoData) {
    return true;
  }
  return record.active !== false;
}
