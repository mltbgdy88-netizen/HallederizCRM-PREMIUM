export type ApprovalInboxPriority = "kritik" | "yuksek" | "orta" | "dusuk" | "ai";
export type ApprovalInboxStatus = "bekliyor" | "incelemede" | "onay_bekliyor" | "sure_asildi";
export type ApprovalInboxViewId =
  | "kritik"
  | "bana_atanan"
  | "finans"
  | "operasyon"
  | "ai_onerileri"
  | "tum"
  | "yakin_sonuclanan";

export type ApprovalInboxCategory = "finans" | "operasyon" | "satis" | "belge" | "ai";

export interface ApprovalInboxTimelineStep {
  id: string;
  label: string;
  at: string;
}

export interface ApprovalInboxContextLink {
  label: string;
  href: string;
}

export interface ApprovalInboxRecord {
  id: string;
  approvalNo: string;
  title: string;
  priority: ApprovalInboxPriority;
  status: ApprovalInboxStatus;
  category: ApprovalInboxCategory;
  viewTags: ApprovalInboxViewId[];
  assignedToMe: boolean;
  recentlyResolved: boolean;
  entityLabel: string;
  workflowLabel: string;
  customerName: string;
  typeLabel: string;
  amountLabel: string;
  slaLabel: string;
  slaBreached: boolean;
  assigneeName: string;
  assigneeRole: string;
  updatedAt: string;
  summary: {
    typeLabel: string;
    priorityLabel: string;
    amountTry: string;
    relatedRecordLabel: string;
    relatedRecordHref: string;
    requesterName: string;
    requestedAt: string;
    slaDeadline: string;
  };
  riskLevel?: "dusuk" | "orta" | "yuksek" | "kritik";
  riskBullets: string[];
  contextLinks: ApprovalInboxContextLink[];
  timeline: ApprovalInboxTimelineStep[];
  internalNote: { author: string; body: string; at: string };
  meta: {
    tenant: string;
    branch: string;
    requester: string;
    requestedAt: string;
  };
}

export const APPROVAL_INBOX_VIEWS: { id: ApprovalInboxViewId; label: string; count: number }[] = [
  { id: "kritik", label: "Kritik", count: 7 },
  { id: "bana_atanan", label: "Bana Atananlar", count: 8 },
  { id: "finans", label: "Finans", count: 6 },
  { id: "operasyon", label: "Operasyon", count: 5 },
  { id: "ai_onerileri", label: "AI Önerileri", count: 4 },
  { id: "tum", label: "Tüm Onaylar", count: 24 },
  { id: "yakin_sonuclanan", label: "Yakın Zamanda Sonuçlananlar", count: 12 }
];

export const APPROVAL_INBOX_KPI = {
  pending: { value: 24, delta: "↓ 3 dünkü", tone: "primary" as const },
  critical: { value: 7, delta: "↑ 2 dünkü", tone: "danger" as const },
  slaBreach: { value: 3, delta: "↑ 1 dünkü", tone: "warn" as const },
  completedToday: { value: 12, delta: "↑ 4 dünkü", tone: "success" as const }
};

export const APPROVAL_INBOX_LAST_SYNC = "20.05.2026 10:24";

export const APPROVAL_INBOX_DEMO_ROWS: ApprovalInboxRecord[] = [
  {
    id: "on-001",
    approvalNo: "ON-2026-01241",
    title: "İade Talebi Onayı",
    priority: "kritik",
    status: "sure_asildi",
    category: "operasyon",
    viewTags: ["kritik", "bana_atanan", "operasyon", "tum"],
    assignedToMe: true,
    recentlyResolved: false,
    entityLabel: "İade #IA-2026-0031",
    workflowLabel: "İade → Stok iadesi",
    customerName: "Demir Retail Mağazacılık",
    typeLabel: "İade",
    amountLabel: "₺6.450,00",
    slaLabel: "-2g 15sa Süre Aşımı",
    slaBreached: true,
    assigneeName: "Taner Yılmaz",
    assigneeRole: "Operasyon Yöneticisi",
    updatedAt: "16.05.2026 09:12",
    summary: {
      typeLabel: "İade Talebi",
      priorityLabel: "Kritik",
      amountTry: "₺6.450,00",
      relatedRecordLabel: "İade #IA-2026-0031",
      relatedRecordHref: "/iadeler",
      requesterName: "Kübra Yıldız",
      requestedAt: "14.05.2026 11:20",
      slaDeadline: "15.05.2026 18:00"
    },
    riskBullets: [
      "İade tutarı son 90 gün ortalamasının %38 üzerinde.",
      "Stok iadesi depo kapasitesini Merkez şubesinde zorlar."
    ],
    contextLinks: [
      { label: "Teklif #TK-2026-0172", href: "/teklifler" },
      { label: "Sipariş #SO-2026-0098", href: "/siparisler" },
      { label: "Fatura #FT-2026-0041", href: "/faturalar" },
      { label: "İade Nedeni: Arızalı ürün", href: "/iadeler" },
      { label: "Satış Temsilcisi: Kübra Yıldız", href: "/cariler" }
    ],
    timeline: [
      { id: "t1", label: "Talep oluşturuldu", at: "14.05.2026 11:20" },
      { id: "t2", label: "Otomatik risk analizi", at: "14.05.2026 11:21" },
      { id: "t3", label: "Taner Yılmaz atandı", at: "14.05.2026 14:05" },
      { id: "t4", label: "Onay kutusuna yönlendirildi", at: "14.05.2026 14:06" }
    ],
    internalNote: {
      author: "Taner Yılmaz",
      body: "Depo ekibi ile iade giriş slotu teyit edilecek; müşteri ile teslim fotoğrafı istendi.",
      at: "16.05.2026 08:40"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Merkez",
      requester: "Ayşe Kaya",
      requestedAt: "14.05.2026 11:20"
    }
  },
  {
    id: "on-002",
    approvalNo: "ON-2026-01242",
    title: "Ödeme Planı Onayı",
    priority: "yuksek",
    status: "incelemede",
    category: "finans",
    viewTags: ["bana_atanan", "finans", "tum"],
    assignedToMe: true,
    recentlyResolved: false,
    entityLabel: "Tahsilat planı #TP-2026-0044",
    workflowLabel: "Tahsilat → Vade uzatımı",
    customerName: "Global Teknoloji A.Ş.",
    typeLabel: "Tahsilat",
    amountLabel: "₺128.400,00",
    slaLabel: "1g 6sa kaldı",
    slaBreached: false,
    assigneeName: "Taner Yılmaz",
    assigneeRole: "Operasyon Yöneticisi",
    updatedAt: "16.05.2026 08:55",
    summary: {
      typeLabel: "Ödeme Planı",
      priorityLabel: "Yüksek",
      amountTry: "₺128.400,00",
      relatedRecordLabel: "Tahsilat planı #TP-2026-0044",
      relatedRecordHref: "/tahsilatlar",
      requesterName: "Mehmet Yılmaz",
      requestedAt: "15.05.2026 16:30",
      slaDeadline: "17.05.2026 15:00"
    },
    riskBullets: ["Vade uzatımı 45 gün; açık bakiye limitinin %72'si kullanılacak."],
    contextLinks: [
      { label: "Cari: Delta A.Ş.", href: "/cariler" },
      { label: "Açık siparişler", href: "/siparisler" }
    ],
    timeline: [
      { id: "t1", label: "Talep oluşturuldu", at: "15.05.2026 16:30" },
      { id: "t2", label: "Finans risk skoru: orta", at: "15.05.2026 16:31" },
      { id: "t3", label: "İncelemeye alındı", at: "16.05.2026 08:10" }
    ],
    internalNote: {
      author: "Taner Yılmaz",
      body: "Müşteri teminat mektubu paylaşacak; gelene kadar kısmi onay düşünülmüyor.",
      at: "16.05.2026 08:12"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Merkez",
      requester: "Mehmet Yılmaz",
      requestedAt: "15.05.2026 16:30"
    }
  },
  {
    id: "on-003",
    approvalNo: "ON-2026-01246",
    title: "Fiyat İndirimi Onayı",
    priority: "orta",
    status: "bekliyor",
    category: "satis",
    viewTags: ["bana_atanan", "tum"],
    assignedToMe: true,
    recentlyResolved: false,
    entityLabel: "Teklif #TK-2026-0188",
    workflowLabel: "Teklif → Sipariş",
    customerName: "Global Teknoloji A.Ş.",
    typeLabel: "Fiyat İndirimi",
    amountLabel: "₺43.250,00 (%12,5)",
    slaLabel: "3g 20sa kaldı",
    slaBreached: false,
    assigneeName: "Taner Yılmaz",
    assigneeRole: "Operasyon Yöneticisi",
    updatedAt: "16.05.2026 07:48",
    summary: {
      typeLabel: "Fiyat İndirimi",
      priorityLabel: "Orta",
      amountTry: "₺43.250,00 (%12,5)",
      relatedRecordLabel: "Teklif #TK-2026-0188",
      relatedRecordHref: "/teklifler",
      requesterName: "Ahmet Yıldız",
      requestedAt: "15.05.2026 10:05",
      slaDeadline: "20.05.2026 04:00"
    },
    riskLevel: "orta",
    riskBullets: [
      "İskonto oranı %18 — fiyat listesi alt sınırının üzerinde.",
      "Marj etkisi tahmini -4,2 puan."
    ],
    contextLinks: [
      { label: "Teklif #TK-2026-0188", href: "/teklifler" },
      { label: "Sipariş #SO-2026-0142", href: "/siparisler" },
      { label: "Satış Temsilcisi: Ahmet Yıldız", href: "/cariler" }
    ],
    timeline: [
      { id: "t1", label: "Talep oluşturuldu", at: "15.05.2026 10:05" },
      { id: "t2", label: "Otomatik risk analizi", at: "15.05.2026 10:06" },
      { id: "t3", label: "Taner Yılmaz atandı", at: "15.05.2026 10:08" },
      { id: "t4", label: "Onay kutusuna yönlendirildi", at: "15.05.2026 10:08" }
    ],
    internalNote: {
      author: "Taner Yılmaz",
      body: "Proje teslimi için paket indirimi; rakip teklif bilgisi satıştan geldi.",
      at: "15.05.2026 17:22"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "İzmir",
      requester: "Ahmet Yıldız",
      requestedAt: "15.05.2026 10:05"
    }
  },
  {
    id: "on-004",
    approvalNo: "ON-2026-01248",
    title: "Tedarikçi Fatura Onayı",
    priority: "yuksek",
    status: "onay_bekliyor",
    category: "finans",
    viewTags: ["finans", "tum"],
    assignedToMe: false,
    recentlyResolved: false,
    entityLabel: "Fatura #FA-TED-2026-0091",
    workflowLabel: "Satın alma → Ödeme",
    customerName: "Anadolu Otomotiv A.Ş.",
    typeLabel: "Finans",
    amountLabel: "₺312.800,00",
    slaLabel: "18sa kaldı",
    slaBreached: false,
    assigneeName: "Merve Yılmaz",
    assigneeRole: "Finans Uzmanı",
    updatedAt: "16.05.2026 06:30",
    summary: {
      typeLabel: "Tedarikçi Fatura",
      priorityLabel: "Yüksek",
      amountTry: "₺312.800,00",
      relatedRecordLabel: "Fatura #FA-TED-2026-0091",
      relatedRecordHref: "/faturalar",
      requesterName: "Zeynep Ak",
      requestedAt: "14.05.2026 09:15",
      slaDeadline: "16.05.2026 23:59"
    },
    riskBullets: ["Fatura tutarı PO kalemleriyle %3 sapma gösteriyor."],
    contextLinks: [{ label: "Tedarikçi cari", href: "/cariler" }],
    timeline: [
      { id: "t1", label: "Talep oluşturuldu", at: "14.05.2026 09:15" },
      { id: "t2", label: "Üst onay bekleniyor", at: "15.05.2026 11:00" }
    ],
    internalNote: {
      author: "Selin Arslan",
      body: "PO revizyonu ERP'de bekliyor; onay sonrası ödeme tarihi 22.05.",
      at: "15.05.2026 15:40"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Merkez",
      requester: "Zeynep Ak",
      requestedAt: "14.05.2026 09:15"
    }
  },
  {
    id: "on-005",
    approvalNo: "ON-2026-01250",
    title: "Kredi Limit Artışı",
    priority: "kritik",
    status: "bekliyor",
    category: "finans",
    viewTags: ["kritik", "finans", "tum"],
    assignedToMe: false,
    recentlyResolved: false,
    entityLabel: "Cari limit #CL-8842",
    workflowLabel: "Cari → Risk limiti",
    customerName: "Akdeniz Tekstil A.Ş.",
    typeLabel: "Finans",
    amountLabel: "₺500.000,00",
    slaLabel: "6sa kaldı",
    slaBreached: false,
    assigneeName: "Fuat Yılmaz",
    assigneeRole: "Satış Müdürü",
    updatedAt: "16.05.2026 05:18",
    summary: {
      typeLabel: "Kredi Limit Artışı",
      priorityLabel: "Kritik",
      amountTry: "₺500.000,00",
      relatedRecordLabel: "Cari limit #CL-8842",
      relatedRecordHref: "/cariler",
      requesterName: "Kübra Yıldız",
      requestedAt: "13.05.2026 14:00",
      slaDeadline: "16.05.2026 12:00"
    },
    riskBullets: ["Son 6 ay gecikme günü ortalaması 11; limit artışı %40."],
    contextLinks: [
      { label: "Cari: Ege Un A.Ş.", href: "/cariler" },
      { label: "Açık bakiye özeti", href: "/tahsilatlar" }
    ],
    timeline: [
      { id: "t1", label: "Talep oluşturuldu", at: "13.05.2026 14:00" },
      { id: "t2", label: "Risk skoru: yüksek", at: "13.05.2026 14:02" }
    ],
    internalNote: {
      author: "Mehmet Yılmaz",
      body: "Sezonluk hacim artışı için geçici limit; 90 gün sonra gözden geçirilecek.",
      at: "14.05.2026 10:00"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Bursa",
      requester: "Ayşe Kaya",
      requestedAt: "13.05.2026 14:00"
    }
  },
  {
    id: "on-006",
    approvalNo: "ON-2026-01252",
    title: "Belge Onayı",
    priority: "dusuk",
    status: "bekliyor",
    category: "belge",
    viewTags: ["operasyon", "tum"],
    assignedToMe: false,
    recentlyResolved: false,
    entityLabel: "Teklif PDF → WhatsApp",
    workflowLabel: "Belge → Kanal gönderimi",
    customerName: "Liman Gıda",
    typeLabel: "Belge",
    amountLabel: "—",
    slaLabel: "4g 2sa kaldı",
    slaBreached: false,
    assigneeName: "Kübra Yıldız",
    assigneeRole: "Satış Temsilcisi",
    updatedAt: "15.05.2026 18:44",
    summary: {
      typeLabel: "Belge Onayı",
      priorityLabel: "Düşük",
      amountTry: "—",
      relatedRecordLabel: "Teklif #TK-2026-0192",
      relatedRecordHref: "/belgeler",
      requesterName: "Kübra Yıldız",
      requestedAt: "15.05.2026 18:40",
      slaDeadline: "20.05.2026 20:00"
    },
    riskBullets: ["WhatsApp kanalında müşteri onayı bekleniyor."],
    contextLinks: [
      { label: "Cari: Liman Gıda", href: "/cariler" },
      { label: "WhatsApp konuşması", href: "/whatsapp" }
    ],
    timeline: [{ id: "t1", label: "Belge kuyruğa alındı", at: "15.05.2026 18:40" }],
    internalNote: {
      author: "Ayşe Kaya",
      body: "Müşteri PDF yerine link istedi; gönderim onayı sonrası.",
      at: "15.05.2026 18:42"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Merkez",
      requester: "Ayşe Kaya",
      requestedAt: "15.05.2026 18:40"
    }
  },
  {
    id: "on-007",
    approvalNo: "ON-2026-01255",
    title: "Sipariş Onayı",
    priority: "yuksek",
    status: "incelemede",
    category: "operasyon",
    viewTags: ["operasyon", "tum"],
    assignedToMe: false,
    recentlyResolved: false,
    entityLabel: "Sipariş #SO-2026-0148",
    workflowLabel: "Sipariş → Fabrika",
    customerName: "Global Teknoloji A.Ş.",
    typeLabel: "Operasyon",
    amountLabel: "₺485.750,00",
    slaLabel: "2g 4sa kaldı",
    slaBreached: false,
    assigneeName: "Kübra Yıldız",
    assigneeRole: "Operasyon Planlama",
    updatedAt: "15.05.2026 16:02",
    summary: {
      typeLabel: "Sipariş Onayı",
      priorityLabel: "Yüksek",
      amountTry: "₺485.750,00",
      relatedRecordLabel: "Sipariş #SO-2026-0148",
      relatedRecordHref: "/siparisler",
      requesterName: "Kübra Yıldız",
      requestedAt: "15.05.2026 09:30",
      slaDeadline: "18.05.2026 20:00"
    },
    riskBullets: ["Yüksek tutarlı sipariş; fabrika kapasitesi %92 dolu."],
    contextLinks: [
      { label: "Sipariş detayı", href: "/siparisler" },
      { label: "Fabrika emri", href: "/fabrikalar/siparisler" }
    ],
    timeline: [
      { id: "t1", label: "Talep oluşturuldu", at: "15.05.2026 09:30" },
      { id: "t2", label: "Stok uygunluk kontrolü", at: "15.05.2026 09:35" }
    ],
    internalNote: {
      author: "Zeynep Ak",
      body: "Kısmi sevkiyat müşteri ile konuşuldu.",
      at: "15.05.2026 14:20"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Merkez",
      requester: "Ayşe Kaya",
      requestedAt: "15.05.2026 09:30"
    }
  },
  {
    id: "on-008",
    approvalNo: "ON-2026-01258",
    title: "AI Önerisi Onayı",
    priority: "ai",
    status: "onay_bekliyor",
    category: "ai",
    viewTags: ["ai_onerileri", "tum"],
    assignedToMe: true,
    recentlyResolved: false,
    entityLabel: "AI plan #AIP-771",
    workflowLabel: "AI → Onay bileti",
    customerName: "Caner Demir",
    typeLabel: "AI",
    amountLabel: "₺12.400,00",
    slaLabel: "1g 12sa kaldı",
    slaBreached: false,
    assigneeName: "Taner Yılmaz",
    assigneeRole: "Operasyon Yöneticisi",
    updatedAt: "15.05.2026 13:11",
    summary: {
      typeLabel: "AI Önerisi",
      priorityLabel: "AI Önerisi",
      amountTry: "₺12.400,00",
      relatedRecordLabel: "AI plan #AIP-771",
      relatedRecordHref: "/ai",
      requesterName: "Sistem (AI)",
      requestedAt: "15.05.2026 13:00",
      slaDeadline: "17.05.2026 01:00"
    },
    riskBullets: [
      "AI önerisi: kısmi tahsilat + teslimat erteleme.",
      "İnsan onayı olmadan icra edilmez."
    ],
    contextLinks: [
      { label: "AI oturumu", href: "/ai" },
      { label: "Cari: Caner Demir", href: "/cariler" }
    ],
    timeline: [
      { id: "t1", label: "AI plan üretildi", at: "15.05.2026 13:00" },
      { id: "t2", label: "Onay kutusuna yönlendirildi", at: "15.05.2026 13:01" }
    ],
    internalNote: {
      author: "Taner Yılmaz",
      body: "Öneri mantıklı; müşteri ile telefon teyidi yapılacak.",
      at: "15.05.2026 13:05"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Merkez",
      requester: "Sistem (AI)",
      requestedAt: "15.05.2026 13:00"
    }
  },
  {
    id: "on-009",
    approvalNo: "ON-2026-01220",
    title: "Ödeme Planı Onayı",
    priority: "orta",
    status: "bekliyor",
    category: "finans",
    viewTags: ["yakin_sonuclanan", "finans"],
    assignedToMe: false,
    recentlyResolved: true,
    entityLabel: "Tahsilat #TA-2026-0097",
    workflowLabel: "Tahsilat → Kapama",
    customerName: "Caner Demir",
    typeLabel: "Tahsilat",
    amountLabel: "₺48.750,00",
    slaLabel: "Tamamlandı",
    slaBreached: false,
    assigneeName: "Fuat Yılmaz",
    assigneeRole: "Satış Müdürü",
    updatedAt: "15.05.2026 17:00",
    summary: {
      typeLabel: "Ödeme Planı",
      priorityLabel: "Orta",
      amountTry: "₺48.750,00",
      relatedRecordLabel: "Tahsilat #TA-2026-0097",
      relatedRecordHref: "/tahsilatlar",
      requesterName: "Mehmet Yılmaz",
      requestedAt: "12.05.2026 10:00",
      slaDeadline: "15.05.2026 17:00"
    },
    riskBullets: [],
    contextLinks: [{ label: "Cari: Caner Demir", href: "/cariler" }],
    timeline: [
      { id: "t1", label: "Onaylandı", at: "15.05.2026 16:55" },
      { id: "t2", label: "İcra tamamlandı", at: "15.05.2026 17:00" }
    ],
    internalNote: {
      author: "Mehmet Yılmaz",
      body: "Standart vade planı onaylandı.",
      at: "15.05.2026 16:50"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Merkez",
      requester: "Mehmet Yılmaz",
      requestedAt: "12.05.2026 10:00"
    }
  },
  {
    id: "on-010",
    approvalNo: "ON-2026-01218",
    title: "Sipariş Onayı",
    priority: "dusuk",
    status: "bekliyor",
    category: "operasyon",
    viewTags: ["yakin_sonuclanan", "operasyon"],
    assignedToMe: false,
    recentlyResolved: true,
    entityLabel: "Sipariş #SO-2026-0132",
    workflowLabel: "Sipariş → Sevkiyat",
    customerName: "Nova Yapı",
    typeLabel: "Operasyon",
    amountLabel: "₺92.100,00",
    slaLabel: "Tamamlandı",
    slaBreached: false,
    assigneeName: "Kübra Yıldız",
    assigneeRole: "Satış Temsilcisi",
    updatedAt: "15.05.2026 11:30",
    summary: {
      typeLabel: "Sipariş Onayı",
      priorityLabel: "Düşük",
      amountTry: "₺92.100,00",
      relatedRecordLabel: "Sipariş #SO-2026-0132",
      relatedRecordHref: "/siparisler",
      requesterName: "Kübra Yıldız",
      requestedAt: "11.05.2026 08:20",
      slaDeadline: "15.05.2026 12:00"
    },
    riskBullets: [],
    contextLinks: [{ label: "Sipariş detayı", href: "/siparisler" }],
    timeline: [{ id: "t1", label: "Onaylandı ve sevk edildi", at: "15.05.2026 11:30" }],
    internalNote: {
      author: "Ayşe Kaya",
      body: "Rutin sipariş; ek not yok.",
      at: "15.05.2026 11:28"
    },
    meta: {
      tenant: "Hallederiz A.Ş.",
      branch: "Ankara",
      requester: "Ayşe Kaya",
      requestedAt: "11.05.2026 08:20"
    }
  }
];
