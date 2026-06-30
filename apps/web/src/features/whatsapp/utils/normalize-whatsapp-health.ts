import type { WhatsAppChannelHealthSnapshot } from "./whatsapp-channel-health";

/** Maps GET /health/whatsapp item to the channel health view model. */
export function normalizeWhatsAppHealthSnapshot(item: unknown): WhatsAppChannelHealthSnapshot | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const record = item as Record<string, unknown>;
  const status = typeof record.status === "string" ? record.status : "unknown";
  const message = typeof record.message === "string" ? record.message : "";
  const mode = typeof record.mode === "string" ? record.mode : undefined;
  const details =
    record.details && typeof record.details === "object" && !Array.isArray(record.details)
      ? (record.details as Record<string, unknown>)
      : undefined;
  const state = typeof details?.state === "string" ? details.state : undefined;
  const ready = details?.ready === true;

  return {
    status,
    message,
    mode,
    state,
    ready
  };
}
