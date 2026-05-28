import { dataSourceConfig } from "../../../lib/data-source";

export type LoginScopeStatus = "ready" | "shell" | "needs-api" | "blocked";

export type LoginScopeRow = {
  id: string;
  title: string;
  relatedEntity: string;
  status: LoginScopeStatus;
  statusLabel: string;
  sourceRoute: string;
  readinessChips: string[];
  description: string;
};

const STATUS_LABEL: Record<LoginScopeStatus, string> = {
  ready: "Hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  blocked: "Kapalı"
};

const ENABLE_DEMO_AUTH =
  typeof process !== "undefined" &&
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

export function buildLoginScopeRows(): LoginScopeRow[] {
  const apiBase = dataSourceConfig.apiBaseUrl;
  const demoAuth = ENABLE_DEMO_AUTH;

  const rows: Array<Omit<LoginScopeRow, "statusLabel">> = [
    {
      id: "auth-login",
      title: "Kimlik doğrulama",
      relatedEntity: "Auth API",
      status: demoAuth ? "shell" : "needs-api",
      sourceRoute: "/login",
      readinessChips: ["POST /auth/login", demoAuth ? "Geliştirme oturumu" : "Canlı API zorunlu"],
      description: "Kiracı + e-posta + şifre ile oturum açma; fake başarı üretilmez."
    },
    {
      id: "auth-session",
      title: "Oturum sürdürme",
      relatedEntity: "Session",
      status: "shell",
      sourceRoute: "/auth/session",
      readinessChips: ["Cookie / token", "Hydrate on load"],
      description: "Sayfa yüklenince mevcut oturum kontrolü; hata durumunda fail-closed."
    },
    {
      id: "auth-tenant",
      title: "Kiracı bağlamı",
      relatedEntity: "Tenant",
      status: "ready",
      sourceRoute: dataSourceConfig.tenantId,
      readinessChips: ["tenantSlug girişi", "tenantId runtime"],
      description: "Giriş formunda kiracı kodu; oturumda tenant scope zorunlu."
    },
    {
      id: "auth-rbac",
      title: "Rol / yetki yükleme",
      relatedEntity: "RBAC",
      status: "needs-api",
      sourceRoute: "/dashboard",
      readinessChips: ["Permission guard", "Rol listesi API"],
      description: "Oturum sonrası menü ve mutation guard; API olmadan write kapalı."
    },
    {
      id: "auth-audit",
      title: "Giriş denetimi",
      relatedEntity: "Audit",
      status: "needs-api",
      sourceRoute: "/uyumluluk",
      readinessChips: ["auditEventId", "Timeline"],
      description: "Başarılı/başarısız giriş izi; canlı audit API bekleniyor."
    },
    {
      id: "auth-export",
      title: "Oturum dışa aktarma",
      relatedEntity: "Export",
      status: "blocked",
      sourceRoute: "/login",
      readinessChips: ["exportPdfStatus", "exportExcelStatus"],
      description: "Login ekranında export yok; disabled kalır."
    }
  ];

  void apiBase;

  return rows.map((row) => ({
    ...row,
    statusLabel: STATUS_LABEL[row.status]
  }));
}

export type LoginSummaryMetrics = {
  scopeTotal: number;
  pendingShell: number;
  riskNeedsApi: number;
  todayLabel: string;
  todayHint: string;
  needsApi: number;
  ready: number;
};

export function computeLoginSummaryMetrics(rows: LoginScopeRow[]): LoginSummaryMetrics {
  const needsApi = rows.filter((r) => r.status === "needs-api").length;
  const shell = rows.filter((r) => r.status === "shell").length;
  const ready = rows.filter((r) => r.status === "ready").length;
  return {
    scopeTotal: rows.length,
    pendingShell: shell + needsApi,
    riskNeedsApi: needsApi,
    todayLabel: "—",
    todayHint: "Günlük giriş metrikleri API bağlanınca",
    needsApi,
    ready
  };
}

export const LOGIN_NAV_TARGETS = [
  { href: "/dashboard", label: "Ana Sayfa" },
  { href: "/onaylar", label: "Onaylar" },
  { href: "/raporlar", label: "Raporlar" },
  { href: "/", label: "Ana giriş" }
] as const;

export const LOGIN_READINESS_DIMENSIONS = [
  { key: "api", label: "API bağlantısı", ready: false, hint: `${dataSourceConfig.apiBaseUrl}` },
  { key: "model", label: "Oturum modeli", ready: true, hint: "SessionModel + tenant scope" },
  { key: "rbac", label: "Yetki / RBAC", ready: false, hint: "Post-login permission load" },
  { key: "audit", label: "Audit", ready: false, hint: "Login audit event" },
  { key: "export", label: "Export", ready: false, hint: "Bu ekranda devre dışı" }
] as const;

export function isDemoAuthEnabled(): boolean {
  return ENABLE_DEMO_AUTH;
}
