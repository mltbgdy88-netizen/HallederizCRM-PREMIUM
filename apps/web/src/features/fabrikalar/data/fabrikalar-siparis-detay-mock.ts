// @ts-nocheck
export type FsdLineRow = {
  id: string;
  productCode: string;
  productName: string;
  qty: string;
  unit: string;
  unitPrice: string;
  total: string;
  status: "Üretimde" | "Planlandı";
};

export type FsdTimelineItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export const FSD_BREADCRUMB = "Fabrika Siparişleri > Sipariş Detayı";
export const FSD_TITLE = "Fabrika Sipariş Detayı";

export const FSD_STATUS_CARDS = [
  { label: "Senkronizasyon Durumu", value: "Senkronize", sub: "24.05.2025 14:32:18", tone: "green" },
  { label: "Kaynak Sistem", value: "Premium Satış", sub: "Aktif bağlantı", tone: "blue" },
  { label: "Bağlı Satış Siparişi", value: "SS-2025-00078", sub: "Harici bağlantı", tone: "gold" }
] as const;

export const FSD_FIELDS = [
  { label: "Sipariş No", value: "FO-2025-00124" },
  { label: "Sipariş Tarihi", value: "24.05.2025 14:20" },
  { label: "Talep Tarihi", value: "27.05.2025" },
  { label: "Durum", value: "Onaylandı", badge: true },
  { label: "Öncelik", value: "Normal", badgePriority: true },
  { label: "Fabrika", value: "Merkez Fabrika" },
  { label: "Depo", value: "Üretim Deposu" },
  { label: "Sorumlu", value: "Yusuf Kaya" },
  {
    label: "Açıklama",
    value: "Haziran üretim planı kapsamında teslim edilmesi planlanan ürünler."
  },
  { label: "Notlar", value: "—" }
] as const;

export const FSD_LINES: FsdLineRow[] = [
  {
    id: "1",
    productCode: "UR-10001",
    productName: "Rulman 6205 2RS",
    qty: "1.250",
    unit: "Adet",
    unitPrice: "₺85,00",
    total: "₺106.250,00",
    status: "Üretimde"
  },
  {
    id: "2",
    productCode: "UR-10002",
    productName: "V Kayışı SPB 1600",
    qty: "640",
    unit: "Adet",
    unitPrice: "₺124,50",
    total: "₺79.680,00",
    status: "Üretimde"
  },
  {
    id: "3",
    productCode: "UR-10003",
    productName: "Elektrik Motoru 7.5 kW",
    qty: "320",
    unit: "Adet",
    unitPrice: "₺8.750,00",
    total: "₺2.800.000,00",
    status: "Planlandı"
  },
  {
    id: "4",
    productCode: "UR-10004",
    productName: "Hava Filtresi AF-261",
    qty: "1.200",
    unit: "Adet",
    unitPrice: "₺92,00",
    total: "₺110.400,00",
    status: "Planlandı"
  },
  {
    id: "5",
    productCode: "UR-10005",
    productName: "Redüktör 1:30",
    qty: "1.310",
    unit: "Adet",
    unitPrice: "₺680,00",
    total: "₺890.800,00",
    status: "Planlandı"
  }
];

export const FSD_GRAND_TOTAL = "₺3.993.750,00";

export const FSD_SUMMARY = [
  { label: "Toplam Kalem", value: "5" },
  { label: "Toplam Miktar", value: "4.720" },
  { label: "Toplam Tutar", value: "₺3.993.750,00" },
  { label: "Üretilen Miktar", value: "2.150 (%45,55)" },
  { label: "Kalan Miktar", value: "2.570 (%54,45)" }
];

export const FSD_TIMELINE: FsdTimelineItem[] = [
  { id: "1", title: "Sipariş Oluşturuldu", detail: "Yusuf Kaya", time: "24.05.2025 14:20" },
  { id: "2", title: "Onaylandı", detail: "Yusuf Kaya", time: "24.05.2025 14:22" },
  { id: "3", title: "Üretime Aktarıldı", detail: "Sistem", time: "24.05.2025 14:25" },
  { id: "4", title: "Kısmi Üretim Tamamlandı", detail: "Sistem", time: "24.05.2025 14:30" }
];

export const FSD_CONTEXT = {
  factory: "Merkez Fabrika",
  integration: "Aktif",
  type: "Çift Yönlü",
  source: "Premium Satış ERP",
  connection: "Bağlantı Aktif",
  errors: [
    { id: "1", text: "Ham madde eşleşmesi yok — UR-10003", time: "24.05.2025 14:28" },
    { id: "2", text: "Birim dönüşüm hatası — UR-10005", time: "24.05.2025 14:26" }
  ],
  logs: [
    { id: "1", text: "5 kalem başarıyla aktarıldı", time: "24.05.2025 14:32" },
    { id: "2", text: "UR-10001 güncellendi", time: "24.05.2025 14:30" },
    { id: "3", text: "Sipariş onayı ERP'ye iletildi", time: "24.05.2025 14:22" }
  ]
};

