// @ts-nocheck
export type TeklifKpi = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "blue" | "slate" | "orange";
};

export type TeklifFilterOption = {
  label: string;
  value: string;
};

export type TeklifStatus = "Açık" | "Onay Bekliyor" | "Cevap Bekliyor" | "Reddedildi";

export type TeklifTableRow = {
  id: string;
  offerNo: string;
  customer: string;
  amount: string;
  status: TeklifStatus;
  validity: string;
  followUp: string;
};

export type TeklifNextStep = {
  id: string;
  title: string;
  date: string;
};

export type TeklifContextDetail = {
  offerId: string;
  offerNo: string;
  status: TeklifStatus;
  createdAt: string;
  customer: string;
  contact: string;
  phone: string;
  email: string;
  amount: string;
  validity: string;
  validityAlertTitle: string;
  validityAlertDetail: string;
  responseAlertTitle: string;
  responseAlertDetail: string;
  nextSteps: TeklifNextStep[];
};

export const TOM_TITLE = "Teklifler Operasyon Masası";
export const TOM_SUBTITLE =
  "Müşterilerinizle ilgili teklif süreçlerini yönetin, takip edin ve sonuçlandırın.";

export const TOM_KPIS: TeklifKpi[] = [
  { id: "open", label: "Açık Teklif", value: "248", tone: "green" },
  { id: "approval", label: "Onay Bekleyen", value: "37", tone: "orange" },
  { id: "response", label: "Cevap Bekleyen", value: "56", tone: "blue" },
  { id: "volume", label: "Bu Ay Hacim", value: "₺4.250.800", tone: "teal" },
  { id: "conversion", label: "Dönüşüm Oranı", value: "18,6%", tone: "gold" }
];

export const TOM_FILTER_SEARCH_PLACEHOLDER = "Teklif no, müşteri, ürün...";

export const TOM_FILTERS: { id: string; label: string; options: TeklifFilterOption[] }[] = [
  { id: "customer", label: "Müşteri", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "validity", label: "Geçerlilik", options: [{ label: "Tümü", value: "all" }] },
  { id: "followup", label: "Takip", options: [{ label: "Tümü", value: "all" }] }
];

export const TOM_DEMO_BANNER =
  "Demo Verisi: Bu ekran demo amaçlıdır. Gerçek veriler farklılık gösterebilir.";

export const TOM_TABLE_ROWS: TeklifTableRow[] = [
  {
    id: "1",
    offerNo: "TKL-2025-0487",
    customer: "ABC Otomotiv A.�?.",
    amount: "₺125.800,00",
    status: "Açık",
    validity: "20.06.2025",
    followUp: "15.05.2025"
  },
  {
    id: "2",
    offerNo: "TKL-2025-0486",
    customer: "Delta Makina Ltd.",
    amount: "₺89.450,00",
    status: "Onay Bekliyor",
    validity: "25.06.2025",
    followUp: "21.05.2025"
  },
  {
    id: "3",
    offerNo: "TKL-2025-0485",
    customer: "Ege Yapı Malzemeleri",
    amount: "₺214.200,00",
    status: "Cevap Bekliyor",
    validity: "30.06.2025",
    followUp: "20.05.2025"
  },
  {
    id: "4",
    offerNo: "TKL-2025-0484",
    customer: "Kuzey Gıda San.",
    amount: "₺56.900,00",
    status: "Reddedildi",
    validity: "10.06.2025",
    followUp: "18.05.2025"
  },
  {
    id: "5",
    offerNo: "TKL-2025-0483",
    customer: "Marmara Lojistik A.�?.",
    amount: "₺178.600,00",
    status: "Açık",
    validity: "02.07.2025",
    followUp: "19.05.2025"
  },
  {
    id: "6",
    offerNo: "TKL-2025-0482",
    customer: "Anadolu Tekstil",
    amount: "₺42.300,00",
    status: "Cevap Bekliyor",
    validity: "28.06.2025",
    followUp: "17.05.2025"
  },
  {
    id: "7",
    offerNo: "TKL-2025-0481",
    customer: "Vega Elektrik Tic.",
    amount: "₺96.750,00",
    status: "Onay Bekliyor",
    validity: "15.06.2025",
    followUp: "16.05.2025"
  },
  {
    id: "8",
    offerNo: "TKL-2025-0480",
    customer: "Atlas Kimya San.",
    amount: "₺312.400,00",
    status: "Açık",
    validity: "05.07.2025",
    followUp: "15.05.2025"
  }
];

export const TOM_TABLE_TOTAL = "Toplam 248 kayıt";
export const TOM_PAGE_NUMBERS = ["1", "2", "3", "…", "25"] as const;

export const TOM_CONTEXT_BY_ROW: Record<string, TeklifContextDetail> = {
  "1": {
    offerId: "1",
    offerNo: "TKL-2025-0487",
    status: "Açık",
    createdAt: "15.05.2025",
    customer: "ABC Otomotiv A.�?.",
    contact: "Ahmet Yılmaz",
    phone: "+90 532 123 45 67",
    email: "ahmet.yilmaz@abc.com.tr",
    amount: "₺125.800,00",
    validity: "20.06.2025",
    validityAlertTitle: "Geçerlilik süresi yaklaşıyor",
    validityAlertDetail: "Geçerlilik süresi 5 gün içinde doluyor. Bitiş Tarihi: 20.06.2025",
    responseAlertTitle: "Müşteri yanıtı bekleniyor",
    responseAlertDetail: "Bu teklif için henüz cevap alınmadı. Son takip: 15.05.2025",
    nextSteps: [
      { id: "s1", title: "Müşteri ile görüşme", date: "16.05.2025" },
      { id: "s2", title: "Teknik teklif sunumu", date: "19.05.2025" },
      { id: "s3", title: "Fiyat revizyonu", date: "22.05.2025" }
    ]
  },
  "2": {
    offerId: "2",
    offerNo: "TKL-2025-0486",
    status: "Onay Bekliyor",
    createdAt: "11.05.2025",
    customer: "Delta Makina Ltd.",
    contact: "Ayşe Demir",
    phone: "+90 232 444 56 78",
    email: "ayse.demir@deltamakina.com",
    amount: "₺89.450,00",
    validity: "25.06.2025",
    validityAlertTitle: "İç onay bekleniyor",
    validityAlertDetail: "Satış müdürü onayı 2 iş günü içinde bekleniyor.",
    responseAlertTitle: "Müşteriye gönderim hazır",
    responseAlertDetail: "Onay sonrası teklif PDF müşteriye iletilecek.",
    nextSteps: [
      { id: "s1", title: "Onay takibi", date: "23.05.2025" },
      { id: "s2", title: "Müşteri sunumu", date: "26.05.2025" }
    ]
  },
  "3": {
    offerId: "3",
    offerNo: "TKL-2025-0485",
    status: "Cevap Bekliyor",
    createdAt: "10.05.2025",
    customer: "Ege Yapı Malzemeleri",
    contact: "Can Öztürk",
    phone: "+90 256 333 22 11",
    email: "can.ozturk@egeyapi.com",
    amount: "₺214.200,00",
    validity: "30.06.2025",
    validityAlertTitle: "Takip hatırlatması",
    validityAlertDetail: "Son iletişimden bu yana 3 gün geçti.",
    responseAlertTitle: "Cevap bekleniyor",
    responseAlertDetail: "Teklif gönderildi. Son takip: 20.05.2025",
    nextSteps: [{ id: "s1", title: "Telefon takibi", date: "22.05.2025" }]
  }
};

export function getTomContext(rowId: string): TeklifContextDetail {
  return TOM_CONTEXT_BY_ROW[rowId] ?? TOM_CONTEXT_BY_ROW["1"]!;
}

