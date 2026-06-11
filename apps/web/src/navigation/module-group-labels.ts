import type { ProductModuleGroup } from "./product-route-types";

/** Kullanıcıya görünen modül grup etiketleri; enum anahtarları değişmez. */
export const MODULE_GROUP_LABELS: Record<ProductModuleGroup, string> = {
  Panel: "Panel",
  Omnichannel: "Çok Kanallı",
  "AI Operator": "Yapay Zekâ Operatörü",
  "Core CRM": "Temel CRM",
  Operations: "Operasyonlar",
  "Field & WMS": "Saha ve Depo Yönetimi",
  Approvals: "Onaylar",
  Tasks: "Görevler",
  Workflows: "İş Akışları",
  Integrations: "Entegrasyonlar",
  Analytics: "Analitik",
  Compliance: "Uyumluluk",
  Setup: "Kurulum",
  Settings: "Ayarlar"
};

export function getModuleGroupLabel(group: ProductModuleGroup): string {
  return MODULE_GROUP_LABELS[group] ?? group;
}
