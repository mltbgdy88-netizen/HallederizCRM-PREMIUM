export type AccessScopeStatus = "ready" | "shell" | "needs-api" | "blocked";

export type UnauthorizedScopeRow = {
  id: string;
  title: string;
  relatedEntity: string;
  status: AccessScopeStatus;
  statusLabel: string;
  sourceRoute: string;
  readinessChips: string[];
  description: string;
  navHref?: string;
};

const STATUS_LABEL: Record<AccessScopeStatus, string> = {
  ready: "Hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  blocked: "Engelli"
};

function row(
  partial: Omit<UnauthorizedScopeRow, "statusLabel"> & { status: AccessScopeStatus }
): UnauthorizedScopeRow {
  return { ...partial, statusLabel: STATUS_LABEL[partial.status] };
}

export const UNAUTHORIZED_SCOPE_ROWS: UnauthorizedScopeRow[] = [
  row({
    id: "page-deny",
    title: "Sayfa erişimi reddedildi",
    relatedEntity: "RBAC",
    status: "ready",
    sourceRoute: "/unauthorized",
    readinessChips: ["Permission guard", "Fail-closed"],
    description: "İstenen route için yetki yok; sessiz erişim verilmez."
  }),
  row({
    id: "role-gap",
    title: "Rol kapsamı yetersiz",
    relatedEntity: "Rol",
    status: "shell",
    sourceRoute: "/kullanicilar/roller",
    readinessChips: ["Rol matrisi", "Modül yetkisi"],
    description: "Kullanıcı rolü bu operasyonu kapsamıyor.",
    navHref: "/kullanicilar/roller"
  }),
  row({
    id: "tenant-module",
    title: "Kiracı modülü kapalı",
    relatedEntity: "Tenant",
    status: "needs-api",
    sourceRoute: "/ayarlar/moduller",
    readinessChips: ["Modül bayrağı", "API bekleniyor"],
    description: "Kiracı paketinde modül etkin değil veya API onayı bekleniyor."
  }),
  row({
    id: "session-expired",
    title: "Oturum geçersiz",
    relatedEntity: "Auth",
    status: "ready",
    sourceRoute: "/login",
    readinessChips: ["Session", "Yeniden giriş"],
    description: "Oturum süresi doldu veya kimlik doğrulama başarısız.",
    navHref: "/login"
  }),
  row({
    id: "approval-required",
    title: "Onay gerekli işlem",
    relatedEntity: "Onay",
    status: "shell",
    sourceRoute: "/onaylar",
    readinessChips: ["Policy", "İnsan onayı"],
    description: "Kritik işlem doğrudan çalıştırılamaz; onay kuyruğu gerekir.",
    navHref: "/onaylar"
  }),
  row({
    id: "audit-trail",
    title: "Denetim izi",
    relatedEntity: "Audit",
    status: "needs-api",
    sourceRoute: "/uyumluluk",
    readinessChips: ["auditEventId", "Timeline"],
    description: "Erişim reddi kaydı API ile yazılır; canlı liste üretilmez."
  })
];

export type UnauthorizedSummaryMetrics = {
  scopeTotal: number;
  pendingShell: number;
  riskNeedsApi: number;
  todayLabel: string;
  todayHint: string;
  needsApi: number;
  ready: number;
};

export function computeUnauthorizedSummaryMetrics(
  rows: UnauthorizedScopeRow[]
): UnauthorizedSummaryMetrics {
  const needsApi = rows.filter((r) => r.status === "needs-api").length;
  const shell = rows.filter((r) => r.status === "shell").length;
  const ready = rows.filter((r) => r.status === "ready").length;
  return {
    scopeTotal: rows.length,
    pendingShell: shell + needsApi,
    riskNeedsApi: needsApi,
    todayLabel: "—",
    todayHint: "Erişim denemesi metrikleri API bağlanınca",
    needsApi,
    ready
  };
}

export const UNAUTHORIZED_NAV_TARGETS = [
  { href: "/dashboard", label: "Ana Sayfa" },
  { href: "/login", label: "Giriş" },
  { href: "/ayarlar", label: "Ayarlar" },
  { href: "/onaylar", label: "Onaylar" }
] as const;

export const UNAUTHORIZED_READINESS_DIMENSIONS = [
  { key: "api", label: "API bağlantısı", ready: false, hint: "RBAC / tenant modül API" },
  { key: "model", label: "Veri modeli", ready: true, hint: "Permission key standard" },
  { key: "rbac", label: "Yetki / RBAC", ready: true, hint: "Fail-closed guard aktif" },
  { key: "audit", label: "Audit", ready: false, hint: "Red kaydı API bekleniyor" },
  { key: "export", label: "Export", ready: false, hint: "Devre dışı" }
] as const;

