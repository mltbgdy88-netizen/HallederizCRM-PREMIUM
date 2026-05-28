/**
 * Gösterge paneli UI metinleri — ASCII kaynak + \u kaçışları.
 * Windows / charset uyumsuzluğunda Türkçe karakterlerin bozulmaması için.
 */
export const GOSTERGE_PANELI_UI = {
  kpiAria: "\u00d6zet g\u00f6stergeler",
  convListAria: "Konu\u015fma listesi ve h\u0131zl\u0131 i\u015flemler",
  alertsAria: "Uyar\u0131lar ve \u00f6zet",
  activeConversations: "Aktif Konu\u015fmalar",
  quickActions: "H\u0131zl\u0131 \u0130\u015flemler",
  urgentAlerts: "Acil Takip Uyar\u0131lar\u0131",
  viewAll: "T\u00fcm\u00fcn\u00fc G\u00f6r",
  urgentSummary: "Acil \u0130\u015f \u00d6zeti",
  urgentDistribution: "Acil \u0130\u015f Da\u011f\u0131l\u0131m\u0131",
  urgentWorkLabel: "Acil i\u015f",
  aiAssistant: "AI Asistan",
  aiHighlights: "\u00d6ne \u00c7\u0131kanlar",
  newAnalysis: "Yeni Analiz Olu\u015ftur",
  playVideo: "Videoyu oynat",
  goToList: "listeye git",
  infoSuffix: "bilgisi",
  thConversation: "Konu\u015fma",
  thCustomer: "Cari",
  thLastMessage: "Son Mesaj",
  thStatus: "Durum",
  thAction: "Aksiyon",
  whatsappDesk: "WhatsApp Masas\u0131",
  goConversation: "Konu\u015fmaya git",
  openWhatsapp: "WhatsApp masas\u0131nda a\u00e7",
  moreActions: "Di\u011fer i\u015flemler",
  pagerPrev: "\u00d6nceki",
  pagerNext: "Sonraki",
  demoBanner:
    "UI referans testi \u2014 yaln\u0131zca demo veri; canl\u0131 API veya oturum kullan\u0131lmaz.",
  loading: "G\u00f6sterge paneli y\u00fckleniyor\u2026",
  searchPlaceholder: "Arama yap\u0131n\u2026",
  themeLight: "Tema: A\u00e7\u0131k",
  notifications: "Bildirimler",
  menu: "Men\u00fc",
  sidebarAria: "Ana men\u00fc",
  copyright: "\u00a9 2025 T\u00fcm haklar\u0131 sakl\u0131d\u0131r.",
  demoUserRole: "Operasyon Y\u00f6neticisi"
} as const;

export type GostergePaneliUiText = typeof GOSTERGE_PANELI_UI;
