// @ts-nocheck
export type KrmPermLevel = "full" | "limited" | "none";

export type KrmModule = { id: string; label: string };

export type KrmRole = {
  id: string;
  name: string;
  description: string;
  permissions: KrmPermLevel[];
};

export const KRM_TITLE = "Rol ve Yetki Matrisi";
export const KRM_SUBTITLE =
  "Rollerin modül ve işlemlere göre yetkilerini yönetin. Değişiklikler anında kaydedilir.";

export const KRM_MODULES: KrmModule[] = [
  { id: "dash", label: "Gösterge Paneli" },
  { id: "cari", label: "Cariler" },
  { id: "stok", label: "Ürün Stok" },
  { id: "sales", label: "Satış" },
  { id: "buy", label: "Alış" },
  { id: "order", label: "Teklif & Sipariş" },
  { id: "invoice", label: "Faturalar" },
  { id: "collect", label: "Tahsilatlar" },
  { id: "report", label: "Raporlar" },
  { id: "settings", label: "Ayarlar" },
  { id: "users", label: "Kullanıcılar" },
  { id: "archive", label: "Arşiv" }
];

export const KRM_ROLES: KrmRole[] = [
  {
    id: "admin",
    name: "Yönetici",
    description: "Tüm modüllere tam erişim",
    permissions: Array(12).fill("full") as KrmPermLevel[]
  },
  {
    id: "gm",
    name: "Genel Müdür",
    description: "Yönetim ve raporlama odaklı",
    permissions: ["full", "full", "full", "full", "full", "full", "full", "full", "full", "limited", "limited", "full"]
  },
  {
    id: "finance",
    name: "Finans Sorumlusu",
    description: "Finans ve muhasebe modülleri",
    permissions: ["none", "none", "none", "full", "full", "full", "full", "full", "limited", "none", "none", "none"]
  },
  {
    id: "sales",
    name: "Satış Sorumlusu",
    description: "Satış ve müşteri yönetimi",
    permissions: ["none", "full", "full", "full", "full", "full", "full", "none", "limited", "none", "limited", "none"]
  },
  {
    id: "warehouse",
    name: "Depo Sorumlusu",
    description: "Stok ve depo operasyonları",
    permissions: ["limited", "none", "full", "none", "full", "none", "none", "none", "limited", "none", "none", "none"]
  },
  {
    id: "accounting",
    name: "Muhasebe Personeli",
    description: "Fatura ve tahsilat işlemleri",
    permissions: ["limited", "none", "none", "none", "none", "none", "full", "full", "full", "none", "none", "none"]
  },
  {
    id: "support",
    name: "Destek Personeli",
    description: "Sınırlı görüntüleme yetkisi",
    permissions: ["limited", "limited", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none"]
  },
  {
    id: "guest",
    name: "Misafir",
    description: "Yalnızca gösterge paneli",
    permissions: ["limited", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none"]
  }
];

export const KRM_LEGEND = [
  { level: "full" as const, label: "Tam Yetki", detail: "Görüntüle, Ekle, Düzenle, Sil" },
  { level: "limited" as const, label: "Kısıtlı Yetki", detail: "Görüntüle ve sınırlı işlem" },
  { level: "none" as const, label: "Yetki Yok", detail: "Erişim yok" }
];

export const KRM_FILTERS = [
  { id: "group", label: "Modül Grubu", options: [{ label: "Tümü", value: "all" }] },
  { id: "module", label: "Modül", options: [{ label: "Tümü", value: "all" }] },
  { id: "role", label: "Rol", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Aktif", value: "active" }] }
];

export const KRM_FOOTER_NOTE =
  "Yetki değişiklikleri anında kaydedilir. Tarayıcı önbelleğini temizlemeniz gerekebilir.";
