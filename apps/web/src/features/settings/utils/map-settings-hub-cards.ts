export type AhbCardIcon = "general" | "users" | "integration" | "whatsapp" | "ai" | "approvals" | "print";

export type SettingsHubCardAction =
  | { kind: "navigate"; href: string }
  | { kind: "toast"; message: string };

export type SettingsHubCard = {
  id: string;
  title: string;
  description: string;
  icon: AhbCardIcon;
  action: SettingsHubCardAction;
};

export const AHB_PAGE_COPY = {
  title: "Ayarlar",
  subtitle: "Sistem ayarlarını yönetebilir ve yapılandırabilirsiniz."
} as const;

export function buildSettingsHubCards(): SettingsHubCard[] {
  return [
    {
      id: "general",
      title: "Genel",
      description: "Genel sistem ayarları, dil, para birimi ve tercihleri yönetin.",
      icon: "general",
      action: { kind: "navigate", href: "/ayarlar/genel" }
    },
    {
      id: "users",
      title: "Kullanıcılar",
      description: "Kullanıcı hesapları, davetler ve erişim kapsamlarını yönetin.",
      icon: "users",
      action: { kind: "navigate", href: "/kullanicilar" }
    },
    {
      id: "roles",
      title: "Roller ve Yetkiler",
      description: "Rol şablonları, izin matrisi ve onay yetkilerini yönetin.",
      icon: "approvals",
      action: { kind: "navigate", href: "/kullanicilar/roller" }
    },
    {
      id: "integration",
      title: "ERP Entegrasyonları",
      description: "ERP bağlantıları, eşlemeler ve senkron paneline erişin.",
      icon: "integration",
      action: { kind: "navigate", href: "/erp" }
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "WhatsApp Business API bağlantısı ve otomasyon ayarlarını yönetin.",
      icon: "whatsapp",
      action: {
        kind: "toast",
        message:
          "WhatsApp Business bağlantı ve otomasyon ayarları tam editörde yapılandırılır. Operasyon paneli için sol menüden WhatsApp'ı açın."
      }
    },
    {
      id: "ai",
      title: "Yapay Zekâ",
      description: "AI asistan, onay ve içgörü panellerine erişin.",
      icon: "ai",
      action: { kind: "navigate", href: "/ai" }
    },
    {
      id: "setup",
      title: "Kurulum / Veri Yükleme",
      description: "CSV içe aktarma ve kurulum adımlarını yönetin.",
      icon: "general",
      action: { kind: "navigate", href: "/kurulum/veri-yukleme" }
    },
    {
      id: "ops-observability",
      title: "Operasyon Gözlem",
      description: "İz kaydı, kiracı korelasyonu ve operasyon gözlem paneli.",
      icon: "integration",
      action: { kind: "navigate", href: "/ayarlar/operasyon-gozlem" }
    },
    {
      id: "approvals",
      title: "Onaylar",
      description: "Onay akışları, limitler ve yetkilendirme kontrollerini yapılandırın.",
      icon: "approvals",
      action: { kind: "navigate", href: "/onaylar/kurallar" }
    },
    {
      id: "print",
      title: "Yazdırma",
      description: "Yazıcı tanımları, şablonlar ve barkod ayarlarını yönetin.",
      icon: "print",
      action: { kind: "navigate", href: "/print-export" }
    }
  ];
}
