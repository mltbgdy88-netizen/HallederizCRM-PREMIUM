// @ts-nocheck
export type IadelerKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "orange" | "red";
};

export type IadelerFilterOption = {
  label: string;
  value: string;
};

export type IadelerStatus = "Bekliyor" | "Onaylandı" | "Reddedildi";

export type IadelerTableRow = {
  id: string;
  returnNo: string;
  returnMeta: string;
  orderNo: string;
  customer: string;
  date: string;
  amount: string;
  status: IadelerStatus;
};

export type IadelerContextDetail = {
  returnNo: string;
  status: IadelerStatus;
  createdAt: string;
  orderNo: string;
  customer: string;
  contact: string;
  amount: string;
  reason: string;
  description: string;
  financialImpact: string;
  stockImpact: string;
  netImpact: string;
  productSummary: { label: string; value: string }[];
  approval: { label: string; value: string }[];
};

export const IAD_TITLE = "İade Operasyon Masası";
export const IAD_SUBTITLE =
  "İade taleplerinizi yönetin, onay süreçlerini takip edin ve stok etkilerini kontrol edin.";

export const IAD_KPIS: IadelerKpi[] = [
  { id: "total", label: "Toplam İade", value: "124", tone: "blue" },
  { id: "pending", label: "Bekleyen İade", value: "18", tone: "orange" },
  { id: "approved", label: "Onaylanan İade", value: "72", tone: "green" },
  { id: "rejected", label: "Reddedilen İade", value: "34", tone: "red" },
  { id: "amount", label: "İade Tutarı", value: "₺285.450", tone: "green" },
  { id: "stock", label: "Stok Etkisi", value: "₺156.230", tone: "orange" }
];

export const IAD_FILTER_SEARCH_PLACEHOLDER = "İade No, Sipariş No, Cari...";

export const IAD_FILTERS: { id: string; label: string; options: IadelerFilterOption[] }[] = [
  {
    id: "date",
    label: "Tarih Aralığı",
    options: [{ label: "Son 30 Gün", value: "30d" }]
  },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "customer", label: "Cari", options: [{ label: "Tümü", value: "all" }] },
  { id: "warehouse", label: "Depo", options: [{ label: "Tümü", value: "all" }] }
];

export const IAD_TABLE_ROWS: IadelerTableRow[] = [
  {
    id: "1",
    returnNo: "İA-2025-000124",
    returnMeta: "17.05.2025 14:32",
    orderNo: "SP-2025-001245",
    customer: "ABC Mağazacılık A.�?.",
    date: "17.05.2025",
    amount: "₺12.450,00",
    status: "Bekliyor"
  },
  {
    id: "2",
    returnNo: "İA-2025-000123",
    returnMeta: "16.05.2025 11:20",
    orderNo: "SIP-2025-1586",
    customer: "Delta Makina Ltd. �?ti.",
    date: "16.05.2025",
    amount: "₺8.920,00",
    status: "Onaylandı"
  },
  {
    id: "3",
    returnNo: "İA-2025-000122",
    returnMeta: "15.05.2025 09:45",
    orderNo: "SIP-2025-1585",
    customer: "Ege Yapı Malzemeleri A.�?.",
    date: "15.05.2025",
    amount: "₺18.750,00",
    status: "Reddedildi"
  },
  {
    id: "4",
    returnNo: "İA-2025-000121",
    returnMeta: "14.05.2025 16:10",
    orderNo: "SIP-2025-1584",
    customer: "Kuzey Gıda San. Tic. A.�?.",
    date: "14.05.2025",
    amount: "₺6.480,00",
    status: "Bekliyor"
  },
  {
    id: "5",
    returnNo: "İA-2025-000120",
    returnMeta: "13.05.2025 10:05",
    orderNo: "SIP-2025-1583",
    customer: "Marmara Lojistik A.�?.",
    date: "13.05.2025",
    amount: "₺24.300,00",
    status: "Onaylandı"
  },
  {
    id: "6",
    returnNo: "İA-2025-000119",
    returnMeta: "12.05.2025 15:22",
    orderNo: "SIP-2025-1582",
    customer: "Nova Elektrik Ltd. �?ti.",
    date: "12.05.2025",
    amount: "₺10.425,00",
    status: "Bekliyor"
  },
  {
    id: "7",
    returnNo: "İA-2025-000118",
    returnMeta: "11.05.2025 08:40",
    orderNo: "SIP-2025-1581",
    customer: "Penta Teknoloji A.�?.",
    date: "11.05.2025",
    amount: "₺15.680,00",
    status: "Onaylandı"
  },
  {
    id: "8",
    returnNo: "İA-2025-000117",
    returnMeta: "10.05.2025 13:18",
    orderNo: "SIP-2025-1580",
    customer: "Sigma Endüstri San. Tic.",
    date: "10.05.2025",
    amount: "₺9.240,00",
    status: "Reddedildi"
  }
];

export const IAD_TABLE_TOTAL = "Toplam 124 kayıt";
export const IAD_PAGE_NUMBERS = ["1", "2", "3", "…", "13"] as const;

export const IAD_CONTEXT_BY_ROW: Record<string, IadelerContextDetail> = {
  "1": {
    returnNo: "İA-2025-000124",
    status: "Bekliyor",
    createdAt: "22.05.2025 14:35",
    orderNo: "SP-2025-001245",
    customer: "ABC Mağazacılık A.�?.",
    contact: "Ahmet Yılmaz",
    amount: "₺12.450,00",
    reason: "Hasarlı Ürün",
    description: "Koli hasarlı, ürün ezilmiş.",
    financialImpact: "-₺12.450,00",
    stockImpact: "+25 adet",
    netImpact: "-₺12.450,00",
    productSummary: [
      { label: "Toplam Ürün", value: "3 kalem" },
      { label: "Toplam Adet", value: "25" },
      { label: "Hasarlı", value: "18" },
      { label: "İade Edilecek", value: "25" },
      { label: "İade Oranı", value: "%100" }
    ],
    approval: [
      { label: "Talep", value: "17.05.2025 14:32" },
      { label: "Son Güncelleme", value: "17.05.2025 14:32" }
    ]
  }
};

export function getIadContext(rowId: string): IadelerContextDetail {
  return IAD_CONTEXT_BY_ROW[rowId] ?? IAD_CONTEXT_BY_ROW["1"];
}

export function iadStatusBadgeClass(status: IadelerStatus): string {
  if (status === "Onaylandı") return " iad-badge--approved";
  if (status === "Reddedildi") return " iad-badge--rejected";
  return " iad-badge--pending";
}

