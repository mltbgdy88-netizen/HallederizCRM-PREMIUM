import { dataSourceConfig } from "../../../lib/data-source";
import type { LucideIconName } from "../../../components/icons/lucide-icons";

export type InventoryScopeStatus = "ready" | "shell" | "needs-api" | "blocked";

export type InventoryScopeRow = {
  id: string;
  title: string;
  relatedEntity: string;
  status: InventoryScopeStatus;
  statusLabel: string;
  sourceRoute: string;
  readinessChips: string[];
  description: string;
  navHref?: string;
};

export type InventorySummaryMetrics = {
  scopeTotal: number;
  pendingShell: number;
  riskNeedsApi: number;
  todayLabel: string;
  todayHint: string;
  needsApi: number;
  ready: number;
};

const STATUS_LABEL: Record<InventoryScopeStatus, string> = {
  ready: "Hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  blocked: "Kapalı"
};

function row(partial: Omit<InventoryScopeRow, "statusLabel">): InventoryScopeRow {
  return { ...partial, statusLabel: STATUS_LABEL[partial.status] };
}

function metrics(rows: InventoryScopeRow[]): InventorySummaryMetrics {
  const needsApi = rows.filter((r) => r.status === "needs-api").length;
  const shell = rows.filter((r) => r.status === "shell").length;
  const ready = rows.filter((r) => r.status === "ready").length;
  return {
    scopeTotal: rows.length,
    pendingShell: shell + needsApi,
    riskNeedsApi: needsApi,
    todayLabel: "—",
    todayHint: "Operasyon metrikleri API bağlanınca",
    needsApi,
    ready
  };
}

export const DEFAULT_NAV = [
  { href: "/dashboard", label: "Ana Sayfa" },
  { href: "/onaylar", label: "Onaylar" },
  { href: "/raporlar", label: "Raporlar" },
  { href: "/", label: "Ana giriş" }
] as const;

export const DEFAULT_READINESS = [
  { key: "api", label: "API bağlantısı", ready: false, hint: dataSourceConfig.apiBaseUrl },
  { key: "model", label: "Veri modeli", ready: true, hint: "Contract + guard" },
  { key: "rbac", label: "Yetki / RBAC", ready: false, hint: "Permission guard" },
  { key: "audit", label: "Audit", ready: false, hint: "Timeline event" },
  { key: "export", label: "Export", ready: false, hint: "PDF/Excel readiness" }
] as const;

export const OFFLINE_API_ROWS: InventoryScopeRow[] = [
  row({
    id: "http-reach",
    title: "HTTP erişilebilirlik",
    relatedEntity: "Network",
    status: "needs-api",
    sourceRoute: "/offline-api",
    readinessChips: ["Health check", "Retry"],
    description: "Sunucuya ulaşılamıyor; oturum ve veri işlemleri durduruldu."
  }),
  row({
    id: "session-hold",
    title: "Oturum askıda",
    relatedEntity: "Auth",
    status: "shell",
    sourceRoute: "/login",
    readinessChips: ["Fail-closed", "Cookie"],
    description: "Bağlantı gelene kadar mutation başlatılmaz.",
    navHref: "/login"
  }),
  row({
    id: "queue-pause",
    title: "Kuyruk işleme",
    relatedEntity: "Worker",
    status: "blocked",
    sourceRoute: "/offline-api",
    readinessChips: ["Outbox", "Duraklatıldı"],
    description: "Worker job’ları offline durumda işlenmez."
  }),
  row({
    id: "read-cache",
    title: "Salt okunur önbellek",
    relatedEntity: "UI",
    status: "shell",
    sourceRoute: "/dashboard",
    readinessChips: ["Son bilinen", "Önbellek"],
    description: "Canlı liste üretilmez; önbellek varsa salt okunur gösterim.",
    navHref: "/dashboard"
  })
];

export const DEMO_MODE_ROWS: InventoryScopeRow[] = [
  row({
    id: "preview-flag",
    title: "Önizleme veri bayrağı",
    relatedEntity: "Config",
    status: dataSourceConfig.useDemoData ? "ready" : "shell",
    sourceRoute: "/demo-mode",
    readinessChips: ["NEXT_PUBLIC_USE_DEMO_DATA", "UI ayrımı"],
    description: "Örnek kayıtlar canlı ERP/CRM verisi değildir."
  }),
  row({
    id: "mutation-block",
    title: "Kritik mutation",
    relatedEntity: "Policy",
    status: "ready",
    sourceRoute: "/onaylar",
    readinessChips: ["Onay zinciri", "Audit"],
    description: "İşlem sonuçları gerçek sistemde yürütülmez; onay gerekir.",
    navHref: "/onaylar"
  }),
  row({
    id: "api-separation",
    title: "API ayrımı",
    relatedEntity: "API",
    status: "needs-api",
    sourceRoute: "/ayarlar",
    readinessChips: ["Canlı bağlantı", "Önizleme modu"],
    description: "Canlı ve önizleme kaynağı karıştırılmaz.",
    navHref: "/ayarlar"
  })
];

export const LIVE_EMPTY_ROWS: InventoryScopeRow[] = [
  row({
    id: "connection-ok",
    title: "Bağlantı kuruldu",
    relatedEntity: "API",
    status: "ready",
    sourceRoute: "/live-empty",
    readinessChips: ["HTTP 200", "Tenant scope"],
    description: "API erişilebilir; kayıt kümesi boş döndü."
  }),
  row({
    id: "no-fake-rows",
    title: "Sahte satır yok",
    relatedEntity: "UI",
    status: "ready",
    sourceRoute: "/live-empty",
    readinessChips: ["No-fake", "Empty state"],
    description: "Örnek satır veya tamamlanma state'i üretilmez."
  }),
  row({
    id: "create-path",
    title: "Yeni kayıt yolu",
    relatedEntity: "CRM",
    status: "shell",
    sourceRoute: "/cariler/yeni",
    readinessChips: ["Form", "Onay"],
    description: "İlgili modülden yeni kayıt veya filtre değişikliği önerilir.",
    navHref: "/cariler"
  }),
  row({
    id: "archive-fallback",
    title: "Arşiv kontrolü",
    relatedEntity: "Arşiv",
    status: "shell",
    sourceRoute: "/archive",
    readinessChips: ["Geçmiş", "Salt okunur"],
    description: "Kayıt arşivde olabilir; canlı liste boş kalabilir.",
    navHref: "/archive"
  })
];

export const MOBILE_DRAWER_ROWS: InventoryScopeRow[] = [
  row({
    id: "drawer-open",
    title: "Drawer açık durumu",
    relatedEntity: "Shell",
    status: "ready",
    sourceRoute: "mobile-drawer",
    readinessChips: ["390×844", "Overlay"],
    description: "Mobil menü açıkken içerik tek kolon; backdrop tıklanınca kapanır."
  }),
  row({
    id: "nav-scroll",
    title: "Nav kaydırma",
    relatedEntity: "Sidebar",
    status: "shell",
    sourceRoute: "/dashboard",
    readinessChips: ["Command nav", "Emerald"],
    description: "Sidebar kompakt emerald dilinde; body scroll kilitli.",
    navHref: "/dashboard"
  }),
  row({
    id: "focus-trap",
    title: "Odak yönetimi",
    relatedEntity: "A11y",
    status: "needs-api",
    sourceRoute: "mobile-drawer",
    readinessChips: ["aria-expanded", "Esc"],
    description: "Klavye ve ekran okuyucu için odak sırası iyileştirilecek."
  })
];

export const PRINT_EXPORT_ROWS: InventoryScopeRow[] = [
  row({
    id: "print-css",
    title: "Print CSS",
    relatedEntity: "Print",
    status: "shell",
    sourceRoute: "print-export",
    readinessChips: ["@media print", "Gizli chrome"],
    description: "Yazdırmada shell gizlenir; içerik kartı korunur."
  }),
  row({
    id: "pdf-export",
    title: "PDF export",
    relatedEntity: "Export",
    status: "needs-api",
    sourceRoute: "print-export",
    readinessChips: ["exportPdfStatus", "disabled"],
    description: "PDF üretimi API hazır olunca; fake indirme yok."
  }),
  row({
    id: "excel-export",
    title: "Excel export",
    relatedEntity: "Export",
    status: "needs-api",
    sourceRoute: "print-export",
    readinessChips: ["exportExcelStatus", "disabled"],
    description: "Excel üretimi API hazır olunca; fake dosya yok."
  })
];

export type InventoryNavItem = {
  href: string;
  label: string;
};

export type InventoryPageConfig = {
  prefix: string;
  dataPage: string;
  title: string;
  subtitle: string;
  icon: LucideIconName;
  role?: "alert";
  mainBadge?: { text: string; tone: "danger" | "info" | "warning" };
  alertCopy?: string;
  rows: InventoryScopeRow[];
  summary: InventorySummaryMetrics;
  navItems?: InventoryNavItem[];
  activeNavHref?: string;
  listNav?: { href: string; label: string };
};

export function buildConfig(
  input: Omit<InventoryPageConfig, "summary"> & { rows: InventoryScopeRow[] }
): InventoryPageConfig {
  return { ...input, summary: metrics(input.rows) };
}

export const OFFLINE_API_CONFIG = buildConfig({
  prefix: "hz-offline-api-center",
  dataPage: "offline-api-command-center",
  title: "Offline API",
  subtitle: "Offline API ekranını gerçek API sonuçları uydurmadan, operasyon ve readiness contract görünürlüğüyle yönetin.",
  icon: "clock",
  role: "alert",
  mainBadge: { text: "Bağlantı yok", tone: "danger" },
  alertCopy:
    "Sunucuya şu an ulaşılamıyor. Oturum ve veri işlemleri güvenli şekilde durduruldu; teknik hata detayı gösterilmez.",
  rows: OFFLINE_API_ROWS
});

export const DEMO_MODE_CONFIG = buildConfig({
  prefix: "hz-demo-mode-center",
  dataPage: "demo-mode-command-center",
  title: "Önizleme modu",
  subtitle: "Önizleme modu ekranını gerçek API sonuçları uydurmadan, operasyon ve readiness contract görünürlüğüyle yönetin.",
  icon: "shield",
  mainBadge: {
    text: dataSourceConfig.useDemoData ? "Önizleme açık" : "Canlı veri",
    tone: "info"
  },
  alertCopy: dataSourceConfig.useDemoData
    ? "Önizleme verisi açık. Ekranlardaki örnek kayıtlar canlı ERP/CRM verisi değildir."
    : "Önizleme modu kapalı. Canlı veri kaynağı kullanılıyor; kritik işlemler onay zincirinden geçer.",
  rows: DEMO_MODE_ROWS
});

export const LIVE_EMPTY_CONFIG = buildConfig({
  prefix: "hz-live-empty-center",
  dataPage: "live-empty-command-center",
  title: "Canlı veri boş",
  subtitle: "Canlı veri boş ekranını gerçek API sonuçları uydurmadan, readiness contract görünürlüğüyle yönetin.",
  icon: "package-minus",
  mainBadge: { text: "Kayıt yok", tone: "warning" },
  alertCopy:
    "Bağlantı kuruldu ancak bu görünüm için kayıt bulunmuyor. Sahte kayıt eklenmez; filtreleri değiştirin veya yeni kayıt oluşturun.",
  rows: LIVE_EMPTY_ROWS
});

export const MOBILE_DRAWER_CONFIG = buildConfig({
  prefix: "hz-mobile-drawer-center",
  dataPage: "mobile-drawer-command-center",
  title: "Mobile drawer davranış katmanı",
  subtitle: "Mobil drawer katmanını gerçek API sonuçları uydurmadan, readiness contract görünürlüğüyle yönetin.",
  icon: "grid-3x3",
  alertCopy: "Mobil menü davranışı platform shell içinde uygulanır. Bu sayfa katman sözleşmesini dokümante eder.",
  rows: MOBILE_DRAWER_ROWS
});

export const PRINT_EXPORT_CONFIG = buildConfig({
  prefix: "hz-print-export-center",
  dataPage: "print-export-command-center",
  title: "Yazdırma / export davranış katmanı",
  subtitle: "Print ve export katmanını gerçek API sonuçları uydurmadan, readiness contract görünürlüğüyle yönetin.",
  icon: "file-text",
  alertCopy: "Export ve yazdırma işlemleri API hazır olana kadar disabled kalır; fake dosya veya indirme üretilmez.",
  rows: PRINT_EXPORT_ROWS
});

