import {
  buildConfig,
  type InventoryScopeRow,
  type InventoryScopeStatus
} from "./system-state-command-center-data";

const STATUS_LABEL: Record<InventoryScopeStatus, string> = {
  ready: "Hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  blocked: "Kapalı"
};

function invRow(partial: Omit<InventoryScopeRow, "statusLabel">): InventoryScopeRow {
  return { ...partial, statusLabel: STATUS_LABEL[partial.status] };
}

const BEKLEYENLER_ROWS: InventoryScopeRow[] = [
  invRow({
    id: "desk-queue",
    title: "Onay komut masası kuyruğu",
    relatedEntity: "Onaylar",
    status: "ready",
    sourceRoute: "/onaylar",
    readinessChips: ["liste", "sağ panel", "aksiyon kolonu"],
    description: "Bekleyen kayıtlar ana onay masasında listelenir; bu route kuyruk sözleşmesini dokümante eder.",
    navHref: "/onaylar"
  }),
  invRow({
    id: "status-filter",
    title: "Bekleyen durum filtresi",
    relatedEntity: "Filtre",
    status: "needs-api",
    sourceRoute: "/onaylar/bekleyenler",
    readinessChips: ["waiting", "pending"],
    description: "Durum filtresi API ile bağlanınca yalnızca bekleyen kayıtlar gösterilir."
  }),
  invRow({
    id: "sla-hint",
    title: "SLA / bekleme süresi",
    relatedEntity: "Operasyon",
    status: "shell",
    sourceRoute: "/onaylar/bekleyenler",
    readinessChips: ["SLA", "öncelik"],
    description: "Bekleme süresi ve öncelik rozeti canlı metrik üretilmeden gösterilmez."
  }),
  invRow({
    id: "decision-guard",
    title: "Karar guard",
    relatedEntity: "Policy",
    status: "ready",
    sourceRoute: "/onaylar/kurallar",
    readinessChips: ["Onayla", "Reddet", "İncele"],
    description: "Karar aksiyonları permission + approval policy zincirinden geçer.",
    navHref: "/onaylar/kurallar"
  })
];

const INCELEME_ROWS: InventoryScopeRow[] = [
  invRow({
    id: "review-queue",
    title: "İnceleme kuyruğu",
    relatedEntity: "Onaylar",
    status: "needs-api",
    sourceRoute: "/onaylar/inceleme",
    readinessChips: ["under_review", "assigned"],
    description: "İncelemede olan kayıtlar ayrı kuyruk görünümü ile listelenir."
  }),
  invRow({
    id: "detail-deep-link",
    title: "Detay derin bağlantı",
    relatedEntity: "Detay",
    status: "ready",
    sourceRoute: "/onaylar/",
    readinessChips: ["approvalId", "payload"],
    description: "Satır tıklanınca onay detay route’una güvenli geçiş yapılır.",
    navHref: "/onaylar"
  }),
  invRow({
    id: "audit-trail",
    title: "Audit / timeline",
    relatedEntity: "Audit",
    status: "needs-api",
    sourceRoute: "/onaylar/inceleme",
    readinessChips: ["timeline", "auditEventId"],
    description: "İnceleme notları ve timeline API ile tenant-scope yazılır."
  }),
  invRow({
    id: "operator-assign",
    title: "Operatör ataması",
    relatedEntity: "RBAC",
    status: "shell",
    sourceRoute: "/onaylar/inceleme",
    readinessChips: ["assignee", "rol"],
    description: "Atama bilgisi hazır olana kadar sahte operatör adı gösterilmez."
  })
];

const TAMAMLANANLAR_ROWS: InventoryScopeRow[] = [
  invRow({
    id: "completed-archive",
    title: "Tamamlanan arşiv görünümü",
    relatedEntity: "Onaylar",
    status: "needs-api",
    sourceRoute: "/onaylar/tamamlananlar",
    readinessChips: ["approved", "rejected", "superseded"],
    description: "Tamamlanan onaylar salt okunur arşiv listesinde gösterilir."
  }),
  invRow({
    id: "execution-outcome",
    title: "Execution sonucu",
    relatedEntity: "Dispatcher",
    status: "needs-api",
    sourceRoute: "/onaylar/tamamlananlar",
    readinessChips: ["executionId", "outcome"],
    description: "İcra sonucu yalnızca gerçek dispatcher yanıtı ile gösterilir."
  }),
  invRow({
    id: "export-readiness",
    title: "Export hazırlığı",
    relatedEntity: "Export",
    status: "blocked",
    sourceRoute: "/onaylar/tamamlananlar",
    readinessChips: ["PDF", "Excel"],
    description: "Export butonları API hazır olana kadar kapalı kalır."
  }),
  invRow({
    id: "main-desk-link",
    title: "Ana onay masası",
    relatedEntity: "Navigasyon",
    status: "ready",
    sourceRoute: "/onaylar",
    readinessChips: ["geri dön", "kuyruk"],
    description: "Aktif kuyruk için ana komut masasına dönüş.",
    navHref: "/onaylar"
  })
];

const LIMITLER_ROWS: InventoryScopeRow[] = [
  invRow({
    id: "role-limits",
    title: "Rol limitleri",
    relatedEntity: "RBAC",
    status: "shell",
    sourceRoute: "/onaylar/limitler",
    readinessChips: ["rol", "tutar", "modül"],
    description: "Rol bazlı onay limitleri API ile tenant-scope okunur."
  }),
  invRow({
    id: "amount-threshold",
    title: "Tutar eşikleri",
    relatedEntity: "Policy",
    status: "needs-api",
    sourceRoute: "/onaylar/limitler",
    readinessChips: ["eşik", "para birimi"],
    description: "Eşik değerleri canlı ERP verisi uydurulmadan gösterilmez."
  }),
  invRow({
    id: "policy-matrix",
    title: "Politika matrisi",
    relatedEntity: "Kurallar",
    status: "ready",
    sourceRoute: "/onaylar/kurallar",
    readinessChips: ["actionKey", "approvalRequired"],
    description: "Onay gerektiren aksiyonlar politika matrisinde tanımlıdır.",
    navHref: "/onaylar/kurallar"
  }),
  invRow({
    id: "write-guard",
    title: "Limit yazımı",
    relatedEntity: "Mutation",
    status: "blocked",
    sourceRoute: "/onaylar/limitler",
    readinessChips: ["Kaydet", "guard"],
    description: "Limit güncelleme mutation’ı policy onayı olmadan çalışmaz."
  })
];

export const BEKLEYENLER_CONFIG = buildConfig({
  prefix: "hz-onaylar-bekleyenler-center",
  dataPage: "onaylar-bekleyenler-command-center",
  title: "Bekleyen onaylar",
  subtitle:
    "Bekleyen onay kuyruğunu gerçek API sonucu uydurmadan, readiness contract ve ana komut masası bağlantısıyla yönetin.",
  icon: "clipboard-list",
  rows: BEKLEYENLER_ROWS,
  alertCopy:
    "Bekleyen kayıtlar ana onay komut masasında işlenir. Bu sayfa alt route sözleşmesini gösterir; canlı sayaç üretilmez."
});

export const INCELEME_CONFIG = buildConfig({
  prefix: "hz-onaylar-inceleme-center",
  dataPage: "onaylar-inceleme-command-center",
  title: "Onay inceleme kuyruğu",
  subtitle:
    "İnceleme kuyruğunu gerçek API sonucu uydurmadan, readiness contract ve detay bağlantılarıyla yönetin.",
  icon: "search",
  rows: INCELEME_ROWS,
  alertCopy: "İnceleme notları ve atama bilgisi API hazır olana kadar iskelet modda kalır."
});

export const TAMAMLANANLAR_CONFIG = buildConfig({
  prefix: "hz-onaylar-tamamlananlar-center",
  dataPage: "onaylar-tamamlananlar-command-center",
  title: "Tamamlanan onaylar",
  subtitle:
    "Tamamlanan onay arşivini gerçek API sonucu uydurmadan, execution ve export readiness ile yönetin.",
  icon: "check-circle-2",
  rows: TAMAMLANANLAR_ROWS,
  alertCopy: "Tamamlanan kayıtlar salt okunur arşivdir; icra sonucu yalnızca gerçek dispatcher yanıtı ile gösterilir."
});

export const LIMITLER_CONFIG = buildConfig({
  prefix: "hz-onaylar-limitler-center",
  dataPage: "onaylar-limitler-command-center",
  title: "Onay limitleri",
  subtitle:
    "Onay limitlerini gerçek API sonucu uydurmadan, rol eşikleri ve politika matrisi bağlantısıyla yönetin.",
  icon: "shield",
  rows: LIMITLER_ROWS,
  alertCopy: "Limit yazımı kapalıdır; politika matrisi ve RBAC guard bağlanınca düzenleme açılır."
});

