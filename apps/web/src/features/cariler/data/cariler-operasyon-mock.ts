// @ts-nocheck
export type CarilerKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "orange" | "red" | "teal";
};

export type CarilerFilterOption = {
  label: string;
  value: string;
};

export type CarilerRisk = "Düşük" | "Orta" | "Yüksek";

export type CarilerTableRow = {
  id: string;
  code: string;
  customer: string;
  city: string;
  balance: string;
  risk: CarilerRisk;
};

export type CarilerQuickAction = {
  id: string;
  label: string;
};

export type CarilerContextDetail = {
  rowId: string;
  code: string;
  name: string;
  status: "Aktif";
  taxNo: string;
  taxOffice: string;
  city: string;
  group: string;
  accountType: string;
  openedAt: string;
  creditLimit: string;
  remainingLimit: string;
  financeWarningTitle: string;
  financeWarningDetail: string;
  quickActions: CarilerQuickAction[];
};

export const COM_TITLE = "Cariler Operasyon Masası";
export const COM_SUBTITLE =
  "Müşteri hesabı, bakiye ve risk yönetimi ve operasyon ekranı.";

export const COM_KPIS: CarilerKpi[] = [
  { id: "total", label: "Toplam Cari", value: "2.684", tone: "green" },
  { id: "active", label: "Aktif", value: "2.156", tone: "teal" },
  { id: "risky", label: "Riskli Bakiye", value: "268.750 ₺", tone: "gold" },
  { id: "limit", label: "Limit Aşımı", value: "86", tone: "red" },
  { id: "new", label: "Bu Ay Yeni", value: "132", tone: "green" }
];

export const COM_FILTER_SEARCH_PLACEHOLDER = "Cari ara (kod, unvan, vergi no...)";

export const COM_FILTERS: { id: string; label: string; options: CarilerFilterOption[] }[] = [
  { id: "city", label: "�?ehir", options: [{ label: "Tümü", value: "all" }] },
  { id: "risk", label: "Risk", options: [{ label: "Tümü", value: "all" }] },
  { id: "balance", label: "Bakiye", options: [{ label: "Tümü", value: "all" }] }
];

export const COM_DEMO_BANNER =
  "Demo Verisi: Bu ekran demo amaçlıdır. Gerçek veriler farklılık gösterebilir.";

export const COM_TABLE_ROWS: CarilerTableRow[] = [
  {
    id: "1",
    code: "CR-10001",
    customer: "Yılmazlar İnşaat San. ve Tic. A.�?.",
    city: "İstanbul",
    balance: "₺125.430,00",
    risk: "Orta"
  },
  {
    id: "2",
    code: "CR-10015",
    customer: "Demir Çelik Tic. Ltd. �?ti.",
    city: "Ankara",
    balance: "₺84.210,50",
    risk: "Düşük"
  },
  {
    id: "3",
    code: "CR-10028",
    customer: "Akdeniz Gıda A.�?.",
    city: "Antalya",
    balance: "₺198.750,00",
    risk: "Yüksek"
  },
  {
    id: "4",
    code: "CR-10042",
    customer: "Ege Mobilya Sanayi Ltd. �?ti.",
    city: "İzmir",
    balance: "₺56.890,00",
    risk: "Düşük"
  },
  {
    id: "5",
    code: "CR-10055",
    customer: "Karadeniz Lojistik A.�?.",
    city: "Samsun",
    balance: "₺312.400,00",
    risk: "Yüksek"
  },
  {
    id: "6",
    code: "CR-10068",
    customer: "Marmara Tekstil Tic. Ltd. �?ti.",
    city: "Bursa",
    balance: "₺42.180,00",
    risk: "Orta"
  },
  {
    id: "7",
    code: "CR-10081",
    customer: "Anadolu Yapı Malzemeleri A.�?.",
    city: "Konya",
    balance: "₺91.650,00",
    risk: "Düşük"
  },
  {
    id: "8",
    code: "CR-10094",
    customer: "Güney Otomotiv San. Tic. A.�?.",
    city: "Adana",
    balance: "₺167.320,00",
    risk: "Orta"
  }
];

export const COM_TABLE_TOTAL = "Toplam 2.684 kayıt";
export const COM_PAGE_NUMBERS = ["1", "2", "3", "…", "269"] as const;

export const COM_QUICK_ACTIONS: CarilerQuickAction[] = [
  { id: "collection", label: "Tahsilat Oluştur" },
  { id: "payment", label: "Ödeme Kaydı Oluştur" },
  { id: "statement", label: "Ekstre Göster" },
  { id: "open-items", label: "Açık Kalemler" },
  { id: "detail", label: "Cari Detay" }
];

export const COM_CONTEXT_BY_ROW: Record<string, CarilerContextDetail> = {
  "1": {
    rowId: "1",
    code: "CR-10001",
    name: "Yılmazlar İnşaat San. ve Tic. A.�?.",
    status: "Aktif",
    taxNo: "1234567890",
    taxOffice: "Kadıköy",
    city: "İstanbul",
    group: "Kurumsal A",
    accountType: "Toptan",
    openedAt: "15.01.2019",
    creditLimit: "₺500.000,00",
    remainingLimit: "₺374.570,00",
    financeWarningTitle: "Finansal Uyarı",
    financeWarningDetail:
      "Riskli bakiye tespit edildi. Vadesi geçmiş tutar: ₺12.450,00",
    quickActions: COM_QUICK_ACTIONS
  },
  "2": {
    rowId: "2",
    code: "CR-10015",
    name: "Demir Çelik Tic. Ltd. �?ti.",
    status: "Aktif",
    taxNo: "9876543210",
    taxOffice: "Çankaya",
    city: "Ankara",
    group: "Kurumsal B",
    accountType: "Perakende",
    openedAt: "22.06.2020",
    creditLimit: "₺200.000,00",
    remainingLimit: "₺115.789,50",
    financeWarningTitle: "Finansal Uyarı",
    financeWarningDetail: "Bakiye limitin %42 altında. Ek risk bildirimi yok.",
    quickActions: COM_QUICK_ACTIONS
  },
  "3": {
    rowId: "3",
    code: "CR-10028",
    name: "Akdeniz Gıda A.�?.",
    status: "Aktif",
    taxNo: "4567891230",
    taxOffice: "Muratpaşa",
    city: "Antalya",
    group: "Kurumsal A",
    accountType: "Toptan",
    openedAt: "08.11.2018",
    creditLimit: "₺350.000,00",
    remainingLimit: "₺151.250,00",
    financeWarningTitle: "Finansal Uyarı",
    financeWarningDetail:
      "Limit aşımı riski. Vadesi geçmiş tutar: ₺28.900,00",
    quickActions: COM_QUICK_ACTIONS
  }
};

export function getComContext(rowId: string): CarilerContextDetail {
  return COM_CONTEXT_BY_ROW[rowId] ?? COM_CONTEXT_BY_ROW["1"]!;
}

