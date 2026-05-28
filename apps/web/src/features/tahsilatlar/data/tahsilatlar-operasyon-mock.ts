// @ts-nocheck
export type TahsilatKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "orange";
};

export type TahsilatFilterOption = {
  label: string;
  value: string;
};

export type TahsilatStatus = "Tahsil Edildi" | "Beklemede" | "Vadesi Geçti";

export type TahsilatTableRow = {
  id: string;
  receiptNo: string;
  customer: string;
  amount: string;
  status: TahsilatStatus;
  date: string;
};

export type TahsilatContextDetail = {
  rowId: string;
  customerCode: string;
  customerName: string;
  openBalance: string;
  collected: string;
  remaining: string;
  overdue: string;
  overdueInvoiceAlert: string;
  distribution: { label: string; value: string }[];
  paymentMethod: string;
  collectionType: string;
  description: string;
};

export const THM_TITLE = "Tahsilat Operasyon Masası";
export const THM_SUBTITLE =
  "Tahsilat süreçlerini yönetin, makbuzları kaydedin ve ödeme durumlarını takip edin.";

export const THM_KPIS: TahsilatKpi[] = [
  { id: "today", label: "Bugün Tahsilat", value: "125.430 ₺", tone: "green" },
  { id: "pending", label: "Bekleyen", value: "325.680 ₺", tone: "teal" },
  { id: "overdue", label: "Vadesi Geçen", value: "84.210 ₺", tone: "gold" },
  { id: "month", label: "Bu Ay Toplam", value: "2.458.750 ₺", tone: "green" },
  { id: "open", label: "Açık Bakiye", value: "1.245.360 ₺", tone: "blue" }
];

export const THM_FILTER_SEARCH_PLACEHOLDER = "Müşteri, makbuz no, açıklama...";

export const THM_FILTERS: { id: string; label: string; options: TahsilatFilterOption[] }[] = [
  { id: "date", label: "Tarih Aralığı", options: [{ label: "Bu Ay", value: "month" }] },
  { id: "customer", label: "Müşteri", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "method", label: "Ödeme Yöntemi", options: [{ label: "Tümü", value: "all" }] },
  { id: "type", label: "Tahsilat Türü", options: [{ label: "Tümü", value: "all" }] }
];

export const THM_TABLE_ROWS: TahsilatTableRow[] = [
  {
    id: "1",
    receiptNo: "MKB-2025-1204",
    customer: "ABC Otomotiv San. ve Tic. Ltd. �?ti.",
    amount: "₺12.450,00",
    status: "Tahsil Edildi",
    date: "25.05.2025"
  },
  {
    id: "2",
    receiptNo: "MKB-2025-1203",
    customer: "Delta Makina Ltd. �?ti.",
    amount: "₺8.920,00",
    status: "Beklemede",
    date: "24.05.2025"
  },
  {
    id: "3",
    receiptNo: "MKB-2025-1202",
    customer: "Ege Yapı Malzemeleri A.�?.",
    amount: "₺18.750,00",
    status: "Vadesi Geçti",
    date: "20.05.2025"
  },
  {
    id: "4",
    receiptNo: "MKB-2025-1201",
    customer: "Kuzey Gıda San. Tic. A.�?.",
    amount: "₺6.480,00",
    status: "Tahsil Edildi",
    date: "23.05.2025"
  },
  {
    id: "5",
    receiptNo: "MKB-2025-1200",
    customer: "Marmara Lojistik A.�?.",
    amount: "₺32.100,00",
    status: "Beklemede",
    date: "22.05.2025"
  },
  {
    id: "6",
    receiptNo: "MKB-2025-1199",
    customer: "Anadolu Tekstil Ltd. �?ti.",
    amount: "₺4.250,00",
    status: "Tahsil Edildi",
    date: "21.05.2025"
  },
  {
    id: "7",
    receiptNo: "MKB-2025-1198",
    customer: "Güney Otomotiv San. Tic. A.�?.",
    amount: "₺15.680,00",
    status: "Vadesi Geçti",
    date: "18.05.2025"
  },
  {
    id: "8",
    receiptNo: "MKB-2025-1197",
    customer: "Karadeniz İnşaat A.�?.",
    amount: "₺9.840,00",
    status: "Tahsil Edildi",
    date: "19.05.2025"
  }
];

export const THM_TABLE_TOTAL = "Toplam 2.458 kayıt";
export const THM_PAGE_NUMBERS = ["1", "2", "3", "…", "246"] as const;

export const THM_CONTEXT_BY_ROW: Record<string, TahsilatContextDetail> = {
  "1": {
    rowId: "1",
    customerCode: "ABC001",
    customerName: "ABC Otomotiv San. ve Tic. Ltd. �?ti.",
    openBalance: "₺84.210,00",
    collected: "₺12.450,00",
    remaining: "₺71.760,00",
    overdue: "₺28.450,00",
    overdueInvoiceAlert: "Bu müşteride 2 adet vadesi geçmiş fatura bulunmaktadır.",
    distribution: [
      { label: "Fatura Adedi", value: "5" },
      { label: "Seçilen Tutar", value: "₺12.450,00" },
      { label: "Tahsilat Tutarı", value: "₺12.450,00" },
      { label: "Kalan Tutar", value: "₺0,00" }
    ],
    paymentMethod: "Havale",
    collectionType: "Kısmi Ödeme",
    description: "Mayıs dönemi fatura tahsilatı"
  },
  "2": {
    rowId: "2",
    customerCode: "DLT014",
    customerName: "Delta Makina Ltd. �?ti.",
    openBalance: "₺42.180,00",
    collected: "₺0,00",
    remaining: "₺42.180,00",
    overdue: "₺8.920,00",
    overdueInvoiceAlert: "Bu müşteride 1 adet vadesi geçmiş fatura bulunmaktadır.",
    distribution: [
      { label: "Fatura Adedi", value: "1" },
      { label: "Toplam Tutar", value: "₺8.920,00" }
    ],
    paymentMethod: "—",
    collectionType: "Bekleyen Tahsilat",
    description: "Onay bekleyen tahsilat kaydı"
  }
};

export function getThmContext(rowId: string): TahsilatContextDetail {
  return THM_CONTEXT_BY_ROW[rowId] ?? THM_CONTEXT_BY_ROW["1"]!;
}

