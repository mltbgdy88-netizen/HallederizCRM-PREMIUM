// @ts-nocheck
export type AhbCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: "general" | "users" | "integration" | "whatsapp" | "ai" | "approvals" | "print";
};

export const AHB_TITLE = "Ayarlar";
export const AHB_SUBTITLE = "Sistem ayarlarını yönetebilir ve yapılandırabilirsiniz.";

export const AHB_CARDS: AhbCard[] = [
  {
    id: "general",
    title: "Genel",
    description: "Genel sistem ayarları, dil, para birimi ve tercihleri yönetin.",
    href: "#",
    icon: "general"
  },
  {
    id: "users",
    title: "Kullanıcılar",
    description: "Kullanıcı hesapları, roller ve yetkilendirme ayarlarını yönetin.",
    href: "/kullanicilar",
    icon: "users"
  },
  {
    id: "integration",
    title: "Entegrasyonlar",
    description: "ERP bağlantısı, fabrika API, eşleme, kuyruk izleme ve senkron ayarları.",
    href: "/erp",
    icon: "integration"
  },
  {
    id: "whatsapp",
    title: "Kanal ve WhatsApp",
    description: "WhatsApp bağlantısı, intent kuralları ve mesaj politikaları.",
    href: "#",
    icon: "whatsapp"
  },
  {
    id: "ai",
    title: "Yapay Zeka",
    description: "Öneri politikaları, içgörü ayarları ve operatör modu yapılandırması.",
    href: "/ai",
    icon: "ai"
  },
  {
    id: "approvals",
    title: "Onaylar",
    description: "Onay akışları, limitler ve yetkilendirme kontrollerini yapılandırın.",
    href: "/onaylar/kurallar",
    icon: "approvals"
  },
  {
    id: "print",
    title: "Yazdırma",
    description: "Yazıcı tanımları, şablonlar ve barkod ayarlarını yönetin.",
    href: "#",
    icon: "print"
  }
];

