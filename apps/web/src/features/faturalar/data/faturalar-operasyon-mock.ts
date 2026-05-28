// @ts-nocheck
export type FaturalarKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "orange";
};

export type FaturalarFilterOption = {
  label: string;
  value: string;
};

export type FaturalarStatus = "Kesildi" | "Taslak" | "İptal";
export type FaturalarPayment = "Bekliyor" | "Kısmi Ödeme" | "Ödendi";

export type FaturalarTableRow = {
  id: string;
  invoiceNo: string;
  invoiceMeta: string;
  customer: string;
  amount: string;
  status: FaturalarStatus;
  payment: FaturalarPayment;
};

export type FaturalarContextDetail = {
  invoiceNo: string;
  status: FaturalarStatus;
  createdAt: string;
  customer: string;
  accountCode: string;
  amount: string;
  currency: string;
  dueDate: string;
  payment: FaturalarPayment;
  docActions: string[];
  paymentActions: string[];
};

export const FAT_TITLE = "Fatura Operasyon Masası";
export const FAT_SUBTITLE =
  "Faturalarınızı yönetin, ödeme durumlarını takip edin ve tahsilat süreçlerinizi kontrol edin.";

export const FAT_KPIS: FaturalarKpi[] = [
  { id: "total", label: "Toplam Fatura", value: "256", tone: "blue" },
  { id: "draft", label: "Taslak Fatura", value: "78", tone: "orange" },
  { id: "pending", label: "Bekleyen Ödeme", value: "48", tone: "teal" },
  { id: "paid", label: "Ödenmiş Fatura", value: "186", tone: "green" },
  { id: "overdue", label: "Vadesi Geçmiş", value: "12", tone: "gold" }
];

export const FAT_FILTER_SEARCH_PLACEHOLDER = "Fatura No, müşteri, açıklama...";

export const FAT_FILTERS: { id: string; label: string; options: FaturalarFilterOption[] }[] = [
  { id: "date", label: "Tarih Aralığı", options: [{ label: "Tümü", value: "all" }] },
  { id: "type", label: "Fatura Tipi", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "payment", label: "Ödeme Durumu", options: [{ label: "Tümü", value: "all" }] }
];

export const FAT_TABLE_ROWS: FaturalarTableRow[] = [
  {
    id: "1",
    invoiceNo: "INV-2025-0256",
    invoiceMeta: "17.05.2025 14:32",
    customer: "ABC Otomasyon San. ve Tic. Ltd. Şti.",
    amount: "₺85.000,00",
    status: "Kesildi",
    payment: "Bekliyor"
  },
  {
    id: "2",
    invoiceNo: "INV-2025-0255",
    invoiceMeta: "16.05.2025 11:20",
    customer: "Delta Makina Ltd. Şti.",
    amount: "₺42.500,00",
    status: "Taslak",
    payment: "Bekliyor"
  },
  {
    id: "3",
    invoiceNo: "INV-2025-0254",
    invoiceMeta: "15.05.2025 09:45",
    customer: "Ege Yapı Malzemeleri A.Ş.",
    amount: "₺128.750,00",
    status: "Kesildi",
    payment: "Kısmi Ödeme"
  },
  {
    id: "4",
    invoiceNo: "INV-2025-0253",
    invoiceMeta: "14.05.2025 16:10",
    customer: "Kuzey Gıda San. Tic. A.Ş.",
    amount: "₺18.920,00",
    status: "Kesildi",
    payment: "Ödendi"
  },
  {
    id: "5",
    invoiceNo: "INV-2025-0252",
    invoiceMeta: "13.05.2025 10:05",
    customer: "Marmara Lojistik A.Ş.",
    amount: "₺56.300,00",
    status: "İptal",
    payment: "Bekliyor"
  },
  {
    id: "6",
    invoiceNo: "INV-2025-0251",
    invoiceMeta: "12.05.2025 15:22",
    customer: "Nova Elektrik Ltd. Şti.",
    amount: "₺31.480,00",
    status: "Kesildi",
    payment: "Ödendi"
  },
  {
    id: "7",
    invoiceNo: "INV-2025-0250",
    invoiceMeta: "11.05.2025 08:40",
    customer: "Penta Teknoloji A.Ş.",
    amount: "₺94.200,00",
    status: "Taslak",
    payment: "Bekliyor"
  },
  {
    id: "8",
    invoiceNo: "INV-2025-0249",
    invoiceMeta: "10.05.2025 13:18",
    customer: "Sigma Endüstri San. Tic.",
    amount: "₺67.850,00",
    status: "Kesildi",
    payment: "Kısmi Ödeme"
  }
];

export const FAT_TABLE_TOTAL = "Toplam 256 kayıt";
export const FAT_PAGE_NUMBERS = ["1", "2", "3", "…", "26"] as const;

export const FAT_CONTEXT_BY_ROW: Record<string, FaturalarContextDetail> = {
  "1": {
    invoiceNo: "INV-2025-0256",
    status: "Kesildi",
    createdAt: "17.05.2025 14:32",
    customer: "ABC Otomasyon San. ve Tic. Ltd. Şti.",
    accountCode: "CAR-1001",
    amount: "₺85.000,00",
    currency: "TRY",
    dueDate: "12.06.2025",
    payment: "Bekliyor",
    docActions: ["Görüntüle", "Düzenle", "PDF İndir", "Yazdır", "E-posta Gönder", "İptal Et"],
    paymentActions: ["Ödeme Kaydı Oluştur", "Tahsilat Ekle", "Ödeme Geçmişi"]
  }
};

export function getFatContext(rowId: string): FaturalarContextDetail {
  return FAT_CONTEXT_BY_ROW[rowId] ?? FAT_CONTEXT_BY_ROW["1"];
}

export function fatStatusBadgeClass(status: FaturalarStatus): string {
  if (status === "Kesildi") return " fat-badge--issued";
  if (status === "Taslak") return " fat-badge--draft";
  return " fat-badge--cancel";
}

export function fatPaymentBadgeClass(payment: FaturalarPayment): string {
  if (payment === "Ödendi") return " fat-badge--paid";
  if (payment === "Kısmi Ödeme") return " fat-badge--partial";
  return " fat-badge--waiting";
}
