const PROVIDER_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  web_chat: "Web sohbet",
  email: "E-posta",
  sms: "SMS",
  internal_note: "Dahili not"
};

const HEALTH_LABELS: Record<string, string> = {
  connection_ready: "Bağlantı hazır",
  configuration_required: "Yapılandırma gerekli",
  connection_pending: "Bağlantı bekleniyor",
  temporarily_unavailable: "Geçici olarak alınamıyor"
};

const TECHNICAL_PATTERN =
  /mock|fallback|adapter|webhook|provider[-_ ]?error|failed to fetch|econnrefused|outbox|worker|mutation|omnichannel_|provider_not_configured/i;

export function channelLabel(channel: string): string {
  return PROVIDER_LABELS[channel] ?? channel;
}

export function mapProviderHealthLabel(input: { ok: boolean; mode?: string; label?: string; reasons?: string[] }) {
  if (input.ok) return HEALTH_LABELS.connection_ready;
  if (input.label && HEALTH_LABELS[input.label]) return HEALTH_LABELS[input.label];
  if (input.mode === "mock") return HEALTH_LABELS.configuration_required;
  return HEALTH_LABELS.temporarily_unavailable;
}

export function sanitizeUserErrorMessage(raw: string | null | undefined): string {
  if (!raw?.trim()) return "İletişim merkezi şu anda kullanılamıyor.";
  if (TECHNICAL_PATTERN.test(raw)) return "İletişim merkezi şu anda kullanılamıyor.";
  return "İletişim merkezi şu anda kullanılamıyor.";
}

export function sanitizeProviderReasons(reasons: string[] | undefined): string {
  if (!reasons?.length) return "";
  const safe = reasons.filter((reason) => !TECHNICAL_PATTERN.test(reason));
  if (!safe.length) return "";
  return safe.join(", ");
}
