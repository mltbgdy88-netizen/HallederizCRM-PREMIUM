// @ts-nocheck
export type SiparisYeniCard = {
  id: string;
  title: string;
  description: string;
  icon: "quick" | "quote" | "manual";
};

export type SiparisYeniFeature = {
  id: string;
  title: string;
  subtitle: string;
};

export const SYH_TITLE = "Yeni Sipariş";
export const SYH_SUBTITLE = "Sipariş oluşturmanın en hızlı ve kolay yolları";

export const SYH_CARDS: SiparisYeniCard[] = [
  {
    id: "quick",
    title: "Hızlı Sipariş",
    description: "Ürünleri hızlıca seçin, siparişinizi hemen oluşturun.",
    icon: "quick"
  },
  {
    id: "quote",
    title: "Tekliften Aktar",
    description: "Mevcut teklifinizden sipariş oluşturun.",
    icon: "quote"
  },
  {
    id: "manual",
    title: "Manuel",
    description: "Tüm bilgileri manuel olarak girerek yeni bir sipariş oluşturun.",
    icon: "manual"
  }
];

export const SYH_FEATURES: SiparisYeniFeature[] = [
  { id: "secure", title: "Güvenli & Hızlı", subtitle: "Verileriniz güvende" },
  { id: "smart", title: "Akıllı Yönetim", subtitle: "Verimli iş süreçleri" },
  { id: "support", title: "7/24 Destek", subtitle: "Her zaman yanınızdayız" }
];
