import { containsTechnicalUserText } from "../../../lib/user-facing-data-error";
import {
  MSG_WA_CHANNEL_WAITING,
  MSG_WA_CONNECTION_NOT_LIVE,
  MSG_WA_LIVE_WAITING,
  MSG_WA_QR_PLACEHOLDER
} from "../data/whatsapp-action-messages";

export type WhatsAppChannelHealthSnapshot = {
  status: string;
  message: string;
  mode?: string;
};

export type WhatsAppChannelHealthView = {
  statusLine: string;
  note: string;
  dotTone: "warn" | "ok" | "error";
};

function sanitizeHealthMessage(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed || containsTechnicalUserText(trimmed)) {
    return MSG_WA_CHANNEL_WAITING;
  }
  return trimmed
    .replace(/\bbağlandı\b/gi, "bağlantı bekleniyor")
    .replace(/\bbaglandi\b/gi, "bağlantı bekleniyor")
    .replace(/\bgönderildi\b/gi, "iletilecek")
    .replace(/\bgonderildi\b/gi, "iletilecek");
}

export function mapWhatsAppChannelHealthView(
  health: WhatsAppChannelHealthSnapshot | null,
  options: { useDemoData: boolean }
): WhatsAppChannelHealthView {
  if (options.useDemoData) {
    return {
      statusLine: MSG_WA_CONNECTION_NOT_LIVE,
      note: MSG_WA_QR_PLACEHOLDER,
      dotTone: "warn"
    };
  }

  if (!health) {
    return {
      statusLine: MSG_WA_LIVE_WAITING,
      note: MSG_WA_CHANNEL_WAITING,
      dotTone: "warn"
    };
  }

  if (health.status === "healthy") {
    return {
      statusLine: MSG_WA_LIVE_WAITING,
      note: sanitizeHealthMessage(health.message),
      dotTone: "warn"
    };
  }

  return {
    statusLine: MSG_WA_CONNECTION_NOT_LIVE,
    note: sanitizeHealthMessage(health.message),
    dotTone: health.status === "error" ? "error" : "warn"
  };
}
