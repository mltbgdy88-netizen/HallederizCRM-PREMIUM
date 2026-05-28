// @ts-nocheck
export type GomKpiTone = "green" | "red" | "orange" | "teal" | "slate";

export type GomKpi = {
  id: string;
  label: string;
  value: string;
  trend: string;
  tone: GomKpiTone;
};

export type GomPriority = "Yüksek" | "Orta" | "Düşük";
export type GomStatus = "Gecikmiş" | "Bugün Vade" | "Devam Ediyor" | "Açık";

export type GomTableRow = {
  id: string;
  title: string;
  subtitle: string;
  assignee: string;
  initials: string;
  priority: GomPriority;
  status: GomStatus;
  due: string;
  dueNote: string;
};

export type GomContext = {
  rowId: string;
  title: string;
  status: GomStatus;
  due: string;
  assignee: string;
  initials: string;
  priority: GomPriority;
  description: string;
  checklist: { label: string; done: boolean }[];
  checklistDone: number;
  checklistTotal: number;
  attachment: { name: string; size: string };
};

export const GOM_TITLE = "Görevler Operasyon Masası";
export const GOM_SUBTITLE = "Tüm görevlerin merkezi yönetimi ve takip ekranı.";

export const GOM_KPIS: GomKpi[] = [
  { id: "open", label: "Açık Görev", value: "156", trend: "+12% bu hafta", tone: "green" },
  { id: "overdue", label: "Geciken Görev", value: "28", trend: "+30% bu hafta", tone: "red" },
  { id: "today", label: "Bugün Vadesi", value: "34", trend: "+8% bu hafta", tone: "orange" },
  { id: "done", label: "Tamamlanan", value: "98", trend: "+18% bu hafta", tone: "teal" },
  { id: "mine", label: "Atanan Bana", value: "42", trend: "+5% bu hafta", tone: "slate" }
];

export const GOM_FILTER_SEARCH = "Görev başlığı, açıklama...";

export const GOM_FILTERS = [
  { id: "assignee", label: "Atanan", options: [{ label: "Tümü", value: "all" }] },
  { id: "priority", label: "Öncelik", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "due", label: "Vade", options: [{ label: "Tümü", value: "all" }] }
];

export const GOM_TABLE_ROWS: GomTableRow[] = [
  {
    id: "1",
    title: "Fabrika stok sayımı ve doğrulama",
    subtitle: "Merkez Fabrika",
    assignee: "Yusuf Kaya",
    initials: "YK",
    priority: "Yüksek",
    status: "Gecikmiş",
    due: "15.05.2025",
    dueNote: "2 gün gecikmiş"
  },
  {
    id: "2",
    title: "UR-10001 teklif hazırlanması",
    subtitle: "Satış",
    assignee: "Ayşe Yılmaz",
    initials: "AY",
    priority: "Orta",
    status: "Bugün Vade",
    due: "17.05.2025",
    dueNote: "Bugün"
  },
  {
    id: "3",
    title: "Depo raf düzenleme planı",
    subtitle: "Merkez Depo",
    assignee: "Mehmet Demir",
    initials: "MD",
    priority: "Orta",
    status: "Devam Ediyor",
    due: "20.05.2025",
    dueNote: "3 gün kaldı"
  },
  {
    id: "4",
    title: "Teklif revizyonu — ABC Tekstil",
    subtitle: "Teklifler",
    assignee: "Dilara Şen",
    initials: "DŞ",
    priority: "Yüksek",
    status: "Açık",
    due: "02.06.2025",
    dueNote: "6 gün kaldı"
  },
  {
    id: "5",
    title: "Aylık stok raporu analizi",
    subtitle: "Raporlar",
    assignee: "Ayşe Aydın",
    initials: "AA",
    priority: "Orta",
    status: "Devam Ediyor",
    due: "28.05.2025",
    dueNote: "1 gün kaldı"
  },
  {
    id: "6",
    title: "WhatsApp şablonları güncelleme",
    subtitle: "İletişim",
    assignee: "Dilara Şen",
    initials: "DŞ",
    priority: "Düşük",
    status: "Açık",
    due: "05.06.2025",
    dueNote: "9 gün kaldı"
  },
  {
    id: "7",
    title: "Müşteri ziyaret raporu hazırlama",
    subtitle: "Satış",
    assignee: "Can Öztürk",
    initials: "CÖ",
    priority: "Orta",
    status: "Bugün Vade",
    due: "27.05.2025",
    dueNote: "Bugün"
  },
  {
    id: "8",
    title: "Depo raf etiketleri güncelleme",
    subtitle: "Merkez Depo",
    assignee: "Mehmet Yılmaz",
    initials: "MY",
    priority: "Düşük",
    status: "Devam Ediyor",
    due: "30.05.2025",
    dueNote: "3 gün kaldı"
  },
  {
    id: "9",
    title: "Fatura mutabakatı Mayıs",
    subtitle: "Muhasebe",
    assignee: "Burcu Güneş",
    initials: "BG",
    priority: "Yüksek",
    status: "Gecikmiş",
    due: "24.05.2025",
    dueNote: "3 gün gecikmiş"
  },
  {
    id: "10",
    title: "Yeni cari onboarding kontrolü",
    subtitle: "Cariler",
    assignee: "Ali Yılmaz",
    initials: "AY",
    priority: "Orta",
    status: "Açık",
    due: "29.05.2025",
    dueNote: "2 gün kaldı"
  }
];

export const GOM_TABLE_TOTAL = "Toplam 156 kayıt";
export const GOM_PAGE_NUMBERS = ["1", "2", "3", "…", "16"];

const CONTEXTS: Record<string, GomContext> = {
  "1": {
    rowId: "1",
    title: "Fabrika stok sayımı ve doğrulama",
    status: "Gecikmiş",
    due: "15.05.2025",
    assignee: "Yusuf Kaya",
    initials: "YK",
    priority: "Yüksek",
    description:
      "Merkez fabrika deposunda periyodik stok sayımı yapılacak. Sayım sonuçları sisteme girilecek ve fark raporu oluşturulacaktır.",
    checklist: [
      { label: "Depo bölgeleri planlandı", done: true },
      { label: "Sayım ekibi belirlendi", done: true },
      { label: "Sayım formları hazırlandı", done: true },
      { label: "Fiziksel sayım tamamlandı", done: false },
      { label: "Veriler sisteme işlendi", done: false },
      { label: "Rapor paylaşıldı", done: false }
    ],
    checklistDone: 3,
    checklistTotal: 6,
    attachment: { name: "Stok_Sayim_Plani.xlsx", size: "18,6 KB" }
  }
};

export function getGomContext(rowId: string): GomContext {
  return CONTEXTS[rowId] ?? CONTEXTS["1"];
}
