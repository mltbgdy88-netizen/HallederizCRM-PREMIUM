import type { WhatsAppSessionSnapshot } from "@hallederiz/types";
import { containsTechnicalUserText } from "../../../lib/user-facing-data-error";
import {
  MSG_WA_CHANNEL_READY,
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
  qrDataUrl?: string;
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

function isRenderableQr(value: string | undefined): boolean {
  if (!value?.trim()) {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.startsWith("data:image/") || /^https?:\/\//i.test(trimmed);
}

export function mapWhatsAppChannelHealthView(
  health: WhatsAppChannelHealthSnapshot | null,
  session: WhatsAppSessionSnapshot | null,
  options: { useDemoData: boolean }
): WhatsAppChannelHealthView {
  const qrDataUrl = isRenderableQr(session?.qrDataUrl) ? session?.qrDataUrl?.trim() : undefined;

  if (options.useDemoData) {
    return {
      statusLine: MSG_WA_CONNECTION_NOT_LIVE,
      note: MSG_WA_QR_PLACEHOLDER,
      dotTone: "warn"
    };
  }

  if (session?.connectionStatus === "connected") {
    return {
      statusLine: MSG_WA_CHANNEL_READY,
      note: MSG_WA_CHANNEL_WAITING,
      dotTone: "ok",
      qrDataUrl
    };
  }

  if (session?.connectionStatus === "disconnected") {
    return {
      statusLine: MSG_WA_CONNECTION_NOT_LIVE,
      note: MSG_WA_CHANNEL_WAITING,
      dotTone: "error",
      qrDataUrl
    };
  }

  if (!health) {
    return {
      statusLine: MSG_WA_LIVE_WAITING,
      note: MSG_WA_CHANNEL_WAITING,
      dotTone: "warn",
      qrDataUrl
    };
  }

  if (health.status === "healthy") {
    return {
      statusLine: MSG_WA_LIVE_WAITING,
      note: sanitizeHealthMessage(health.message),
      dotTone: "warn",
      qrDataUrl
    };
  }

  return {
    statusLine: MSG_WA_CONNECTION_NOT_LIVE,
    note: sanitizeHealthMessage(health.message),
    dotTone: health.status === "error" ? "error" : "warn",
    qrDataUrl
  };
}
