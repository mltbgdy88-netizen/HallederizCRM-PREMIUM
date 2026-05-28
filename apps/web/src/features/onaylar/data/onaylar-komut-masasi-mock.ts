// @ts-nocheck
export type OkmKpiTone = "green" | "gold";

export type OkmKpi = {
  id: string;
  label: string;
  value: string;
  tone: OkmKpiTone;
  icon: "hourglass" | "cart" | "user" | "document" | "finance";
};

export type OkmPendingItem = {
  id: string;
  title: string;
  ref: string;
  requester: string;
  dateTime: string;
  status: "Bekliyor";
  icon: "stock" | "customer" | "document" | "finance";
};

export type OkmProductField = { label: string; value: string };

export type OkmHistoryItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type OkmApprovalMeta = {
  label: string;
  value: string;
};

export const OKM_PAGE = {
  title: "Onaylar Komut Masası",
  subtitle: "Sistem genelindeki tüm bekleyen onay taleplerini yönetin.",
  historyBtn: "Onay Geçmişi"
};

export const OKM_KPIS: OkmKpi[] = [
  { id: "total", label: "Toplam Bekleyen", value: "7", tone: "green", icon: "hourglass" },
  { id: "stock", label: "Stok Onayı", value: "3", tone: "gold", icon: "cart" },
  { id: "customer", label: "Müşteri Onayı", value: "2", tone: "green", icon: "user" },
  { id: "document", label: "Belge Onayı", value: "1", tone: "green", icon: "document" },
  { id: "finance", label: "Finans Onayı", value: "1", tone: "gold", icon: "finance" }
];

export const OKM_PENDING: OkmPendingItem[] = [
  {
    id: "1",
    title: "Stok Seviyesi Onayı",
    ref: "UR-10001 • Rulman 6205 2RS",
    requester: "Depo Sorumlusu",
    dateTime: "20.05.2025 10:30",
    status: "Bekliyor",
    icon: "stock"
  },
  {
    id: "2",
    title: "Müşteri Limit Artışı",
    ref: "CAR-8745 • ABC Makina A.Ş.",
    requester: "Satış Temsilcisi",
    dateTime: "20.05.2025 09:15",
    status: "Bekliyor",
    icon: "customer"
  },
  {
    id: "3",
    title: "Belge Onayı",
    ref: "BLG-2951 • Satış Sözleşmesi",
    requester: "Muhasebe",
    dateTime: "20.05.2025 08:45",
    status: "Bekliyor",
    icon: "document"
  },
  {
    id: "4",
    title: "Finans Onayı",
    ref: "FIN-1208 • Ödeme Planı",
    requester: "Finans",
    dateTime: "19.05.2025 16:20",
    status: "Bekliyor",
    icon: "finance"
  },
  {
    id: "5",
    title: "Stok Transfer Onayı",
    ref: "UR-10042 • V Kayış Seti",
    requester: "Depo Sorumlusu",
    dateTime: "19.05.2025 14:10",
    status: "Bekliyor",
    icon: "stock"
  },
  {
    id: "6",
    title: "Müşteri Bilgi Güncelleme",
    ref: "CAR-9012 • Delta Otomasyon",
    requester: "Satış Temsilcisi",
    dateTime: "19.05.2025 11:30",
    status: "Bekliyor",
    icon: "customer"
  },
  {
    id: "7",
    title: "Stok Sayım Onayı",
    ref: "UR-10088 • Merkez Depo Sayım",
    requester: "Depo Sorumlusu",
    dateTime: "19.05.2025 10:00",
    status: "Bekliyor",
    icon: "stock"
  }
];

export const OKM_PAGINATION = {
  totalLabel: "Toplam 7 kayıt",
  pageSize: "10",
  page: 1
};

export const OKM_DETAIL = {
  title: "Stok Seviyesi Onayı",
  ref: "UR-10001 • Rulman 6205 2RS",
  dateTime: "20.05.2025 10:30",
  priority: "Orta",
  requesterLabel: "Talep Eden",
  requester: "Depo Sorumlusu",
  requesterRole: "Depo Sorumlusu",
  departmentLabel: "Departman",
  department: "Depo",
  description:
    "Rulman 6205 2RS ürününün stok seviyesinin artırılması talep edilmektedir.",
  productTitle: "Ürün Bilgileri",
  productFields: [
    { label: "Ürün Kodu", value: "UR-10001" },
    { label: "Ürün Adı", value: "Rulman 6205 2RS" },
    { label: "Mevcut Stok", value: "850 adet" },
    { label: "Önerilen Miktar", value: "1.600 adet" },
    { label: "Birim Fiyat", value: "₺85,00" },
    { label: "Tahmini Toplam", value: "₺136.000,00" }
  ] as OkmProductField[],
  extraTitle: "Ek Bilgiler",
  extraFields: [
    { label: "Depo", value: "Merkez Depo" },
    { label: "Tedarikçi", value: "SKF Rulmanları" },
    { label: "Teslim Süresi", value: "2-3 Gün" },
    { label: "Oluşturan", value: "Ahmet Yılmaz" },
    { label: "Oluşturma Tarihi", value: "20.05.2025 10:30" },
    { label: "Son Güncelleme", value: "20.05.2025 10:30" }
  ] as OkmProductField[],
  historyTitle: "İşlem Geçmişi",
  history: [
    {
      id: "h1",
      title: "Talep oluşturuldu",
      detail: "Ahmet Yılmaz tarafından stok seviyesi onay talebi oluşturuldu.",
      time: "20.05.2025 10:30"
    },
    {
      id: "h2",
      title: "Onay sürecine gönderildi",
      detail: "Talep yönetici onayına iletildi.",
      time: "20.05.2025 10:31"
    }
  ] as OkmHistoryItem[]
};

export const OKM_ACTIONS = {
  title: "Onay İşlemleri",
  info: "Bu onay talebi için karar vermeniz gerekmektedir.",
  approve: "Onayla",
  reject: "Reddet",
  review: "İncele",
  metaTitle: "Onay Bilgileri",
  meta: [
    { label: "Onay Süreci", value: "Stok Onay Süreci" },
    { label: "Mevcut Aşama", value: "Yönetici Onayı" },
    { label: "Sıra", value: "2 / 2" },
    { label: "Onaylayan", value: "Yusuf Kaya (Siz)" },
    { label: "Yetki Seviyesi", value: "Yönetici" }
  ] as OkmApprovalMeta[],
  commentLabel: "Açıklama (Opsiyonel)",
  commentPlaceholder: "Onay veya red gerekçenizi yazın…",
  notifyLabel: "E-posta ile bilgilendir"
};

export function getOkmDetailForId(id: string) {
  const item = OKM_PENDING.find((p) => p.id === id) ?? OKM_PENDING[0];
  if (item.id === "1") return OKM_DETAIL;
  return {
    ...OKM_DETAIL,
    title: item.title,
    ref: item.ref,
    dateTime: item.dateTime,
    requester: item.requester.split(" (")[0] ?? item.requester,
    requesterRole: item.requester.match(/\(([^)]+)\)/)?.[1] ?? item.requester
  };
}

