import type { PlatformSettings } from "@hallederiz/types";
import type { WhatsAppChannelHealthSnapshot } from "../../whatsapp/utils/whatsapp-channel-health";

export type WhatsAppConnectionMethodId = "meta-cloud" | "embedded-signup" | "qr-web" | "alternate-provider";

export type WhatsAppMethodBadgeTone = "ok" | "warn" | "neutral" | "planned" | "beta";

export type WhatsAppMethodBadge = {
  label: string;
  tone: WhatsAppMethodBadgeTone;
};

export function resolveMetaCloudBadge(
  health: WhatsAppChannelHealthSnapshot | null,
  useDemoData: boolean
): WhatsAppMethodBadge {
  if (useDemoData) {
    return { label: "Önizleme modu", tone: "warn" };
  }
  if (health?.ready === true && health.state === "ready") {
    return { label: "Canlı hazır", tone: "ok" };
  }
  if (health?.state === "disabled" || health?.state === "not_configured") {
    return { label: "Yapılandırılmadı", tone: "warn" };
  }
  if (health?.state === "error" || health?.status === "error") {
    return { label: "Hata", tone: "warn" };
  }
  return { label: "Kurulum bekleniyor", tone: "neutral" };
}

export function isAlternateProviderSelected(provider: PlatformSettings["whatsapp"]["provider"]): boolean {
  return provider === "twilio" || provider === "custom";
}

export function resolveAlternateProviderLabel(provider: PlatformSettings["whatsapp"]["provider"]): string {
  if (provider === "twilio") return "Twilio";
  if (provider === "custom") return "Özel sağlayıcı";
  return "Seçilmedi";
}
