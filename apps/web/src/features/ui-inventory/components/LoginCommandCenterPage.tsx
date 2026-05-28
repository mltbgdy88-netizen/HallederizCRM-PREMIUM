"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useAuth } from "../../../providers/auth-provider";
import {
  buildLoginScopeRows,
  computeLoginSummaryMetrics,
  isDemoAuthEnabled,
  LOGIN_NAV_TARGETS,
  LOGIN_READINESS_DIMENSIONS,
  type LoginScopeStatus
} from "../utils/login-command-center-data";

function resolvePostLoginPath(nextParam: string | null): string {
  if (!nextParam) return "/";
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) return "/";
  return nextParam;
}

function statusBadgeClass(status: LoginScopeStatus): string {
  if (status === "ready") return "hz-login-center__badge--success";
  if (status === "needs-api") return "hz-login-center__badge--needs-api";
  if (status === "shell") return "hz-login-center__badge--warning";
  if (status === "blocked") return "hz-login-center__badge--disabled-not-allowed";
  return "hz-login-center__badge--muted";
}

function LoginCommandCenterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, login } = useAuth();

  const allRows = useMemo(() => buildLoginScopeRows(), []);
  const summary = useMemo(() => computeLoginSummaryMetrics(allRows), [allRows]);
  const demoAuth = isDemoAuthEnabled();

  const [tenantSlug, setTenantSlug] = useState("hallederiz");
  const [email, setEmail] = useState("admin@hallederiz.com");
  const [password, setPassword] = useState("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; tenant?: string }>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LoginScopeStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.relatedEntity.toLowerCase().includes(q)
      );
    });
  }, [allRows, search, statusFilter]);

  const selected =
    filteredRows.find((r) => r.id === selectedId) ?? filteredRows[0] ?? allRows[0] ?? null;
  const effectiveSelectedId = selected?.id ?? null;

  useEffect(() => {
    if (state === "authenticated") {
      router.replace(resolvePostLoginPath(searchParams.get("next")));
    }
  }, [router, searchParams, state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string; tenant?: string } = {};
    if (!tenantSlug.trim()) nextErrors.tenant = "Kiracı kodu gerekli.";
    if (!email.trim()) nextErrors.email = "E-posta gerekli.";
    if (!password.trim()) nextErrors.password = "�?ifre gerekli.";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login({ tenantSlug, email, password });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message ?? "Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    router.replace(resolvePostLoginPath(searchParams.get("next")));
  }

  return (
    <main className="hz-login-center" data-page="login-command-center">
      <header className="hz-login-center__intro">
        <div className="hz-login-center__title-row">
          <span className="hz-login-center__icon" aria-hidden>
            <LucideIcon name="check-circle-2" size={20} />
          </span>
          <div>
            <h1 className="hz-login-center__page-title">Login</h1>
            <p className="hz-login-center__page-sub">
              Login ekranını gerçek API sonuçları uydurmadan, operasyon ve readiness contract görünürlüğüyle
              yönetin.
            </p>
          </div>
        </div>
        <nav className="hz-login-center__actions" aria-label="Hızlı gezinme">
          {LOGIN_NAV_TARGETS.map((item) => (
            <Link key={item.href} href={item.href} className="hz-login-center__button-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="hz-login-center__summary" aria-label="Özet bant">
        <article className="hz-login-center__summary-card">
          <span className="hz-login-center__summary-label">Kapsam</span>
          <strong className="hz-login-center__summary-value">{summary.scopeTotal}</strong>
          <span className="hz-login-center__summary-hint">Auth contract</span>
        </article>
        <article className="hz-login-center__summary-card">
          <span className="hz-login-center__summary-label">Bekleyen</span>
          <strong className="hz-login-center__summary-value">{summary.pendingShell}</strong>
          <span className="hz-login-center__summary-hint">İskelet + API</span>
        </article>
        <article className="hz-login-center__summary-card">
          <span className="hz-login-center__summary-label">Risk</span>
          <strong className="hz-login-center__summary-value">{summary.riskNeedsApi}</strong>
          <span className="hz-login-center__summary-hint">API bekleyen</span>
        </article>
        <article className="hz-login-center__summary-card">
          <span className="hz-login-center__summary-label">Bugün</span>
          <strong className="hz-login-center__summary-value">{summary.todayLabel}</strong>
          <span className="hz-login-center__summary-hint">{summary.todayHint}</span>
        </article>
        <article className="hz-login-center__summary-card hz-login-center__summary-card--accent">
          <span className="hz-login-center__summary-label">Needs API</span>
          <strong className="hz-login-center__summary-value">{summary.needsApi}</strong>
          <span className="hz-login-center__summary-hint">
            {demoAuth ? "Geliştirme modu" : `${summary.ready} hazır`}
          </span>
        </article>
      </section>

      <div className="hz-login-center__detail-grid">
        <div className="hz-login-center__main-stack">
          <section className="hz-login-center__card hz-login-center__card--form" aria-label="Platform girişi">
            <div className="hz-login-center__card-head">
              <h2 className="hz-login-center__card-title">Platform girişi</h2>
              <span className="hz-login-center__badge hz-login-center__badge--info">
                {demoAuth ? "Geliştirme auth" : "Canlı auth"}
              </span>
            </div>
            <div className="hz-login-center__card-body">
              <p className="hz-login-center__form-lead">Kurumsal CRM platformuna giriş yapın.</p>
              <form className="hz-login-center__form" onSubmit={handleSubmit} noValidate>
                <label className="hz-login-center__field" htmlFor="login-tenant">
                  <span className="hz-login-center__field-label">Kiracı kodu</span>
                  <input
                    id="login-tenant"
                    name="tenant"
                    autoComplete="organization"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    aria-invalid={fieldErrors.tenant ? true : undefined}
                  />
                  {fieldErrors.tenant ? (
                    <span className="hz-login-center__field-error" role="alert">
                      {fieldErrors.tenant}
                    </span>
                  ) : null}
                </label>
                <label className="hz-login-center__field" htmlFor="login-email">
                  <span className="hz-login-center__field-label">E-posta</span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={fieldErrors.email ? true : undefined}
                  />
                  {fieldErrors.email ? (
                    <span className="hz-login-center__field-error" role="alert">
                      {fieldErrors.email}
                    </span>
                  ) : null}
                </label>
                <label className="hz-login-center__field" htmlFor="login-password">
                  <span className="hz-login-center__field-label">�?ifre</span>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={fieldErrors.password ? true : undefined}
                  />
                  {fieldErrors.password ? (
                    <span className="hz-login-center__field-error" role="alert">
                      {fieldErrors.password}
                    </span>
                  ) : null}
                </label>
                {errorMessage ? (
                  <p className="hz-login-center__field-error" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="hz-login-center__button-primary hz-login-center__submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? "Giriş yapılıyor…" : "Giriş yap"}
                </button>
              </form>
            </div>
          </section>

          <section className="hz-login-center__card" aria-label="Auth readiness">
            <div className="hz-login-center__card-head">
              <h2 className="hz-login-center__card-title">Auth readiness</h2>
            </div>
            <div className="hz-login-center__card-body">
              <div className="hz-login-center__filter-grid">
                <label className="hz-login-center__field">
                  <span className="hz-login-center__field-label">Ara</span>
                  <input
                    type="search"
                    className="hz-login-center__input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Contract veya modül..."
                  />
                </label>
                <label className="hz-login-center__field">
                  <span className="hz-login-center__field-label">Durum</span>
                  <select
                    className="hz-login-center__select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  >
                    <option value="all">Tümü</option>
                    <option value="ready">Hazır</option>
                    <option value="shell">İskelet</option>
                    <option value="needs-api">API bekleniyor</option>
                    <option value="blocked">Kapalı</option>
                  </select>
                </label>
              </div>
              <div className="hz-login-center__table" role="list">
                {filteredRows.map((row) => {
                  const isSelected = row.id === effectiveSelectedId;
                  return (
                    <div
                      key={row.id}
                      role="listitem"
                      className={`hz-login-center__row${isSelected ? " hz-login-center__row--selected" : ""}`}
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedId(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(row.id);
                        }
                      }}
                    >
                      <span className="hz-login-center__row-title">{row.title}</span>
                      <span className={`hz-login-center__badge ${statusBadgeClass(row.status)}`}>
                        {row.statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <aside className="hz-login-center__insight" aria-label="İçgörü">
          <article className="hz-login-center__card">
            <div className="hz-login-center__card-head">
              <h2 className="hz-login-center__card-title">Readiness matrisi</h2>
            </div>
            <div className="hz-login-center__card-body hz-login-center__scope-grid">
              {LOGIN_READINESS_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="hz-login-center__scope-card">
                  <span className="hz-login-center__scope-label">{dim.label}</span>
                  <span
                    className={`hz-login-center__badge ${
                      dim.ready ? "hz-login-center__badge--success" : "hz-login-center__badge--needs-api"
                    }`}
                  >
                    {dim.ready ? "Hazır" : "Bekleniyor"}
                  </span>
                  <p className="hz-login-center__scope-hint">{dim.hint}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="hz-login-center__card hz-login-center__card--policy">
            <div className="hz-login-center__card-head">
              <h2 className="hz-login-center__card-title">No-fake policy</h2>
            </div>
            <p className="hz-login-center__card-body hz-login-center__policy-copy">
              Bu ekran gerçek API sonucu olmadan canlı kayıt, başarı sonucu veya tamamlanma state&apos;i
              üretmez.
            </p>
          </article>
        </aside>

        <aside className="hz-login-center__side" aria-label="Seçili contract">
          {selected ? (
            <>
              <section className="hz-login-center__side-section">
                <h2 className="hz-login-center__card-title">{selected.title}</h2>
                <p className="hz-login-center__muted-line">{selected.description}</p>
                <div className="hz-login-center__side-meta">
                  <span className={`hz-login-center__badge ${statusBadgeClass(selected.status)}`}>
                    {selected.statusLabel}
                  </span>
                  <span className="hz-login-center__badge hz-login-center__badge--source-linked">
                    {selected.sourceRoute}
                  </span>
                </div>
              </section>
              <section className="hz-login-center__side-section">
                <h3 className="hz-login-center__side-heading">Future API contract</h3>
                <dl className="hz-login-center__contract-list">
                  {[
                    ["tenantId", dataSourceConfig.tenantId],
                    ["sourceRoute", selected.sourceRoute],
                    ["status", selected.status],
                    ["entityId", "—"],
                    ["auditEventId", "—"],
                    ["exportPdfStatus", "disabled"],
                    ["exportExcelStatus", "disabled"]
                  ].map(([k, v]) => (
                    <div key={k} className="hz-login-center__contract-row">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="hz-login-center__side-section">
                <h3 className="hz-login-center__side-heading">Güvenli aksiyonlar</h3>
                <div className="hz-login-center__action-stack">
                  <button type="button" className="hz-login-center__button-disabled" disabled title="API yok">
                    Export Readiness
                  </button>
                  <button type="button" className="hz-login-center__button-disabled" disabled title="Audit API yok">
                    Audit İzle
                  </button>
                  <Link href="/dashboard" className="hz-login-center__button-secondary">
                    Ana Sayfa
                  </Link>
                </div>
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function LoginLoadingState() {
  return (
    <main className="hz-login-center" role="status" aria-busy="true">
      <p className="hz-login-center__loading">Oturum bilgileri kontrol ediliyor…</p>
    </main>
  );
}

export function LoginCommandCenterPage() {
  return (
    <Suspense fallback={<LoginLoadingState />}>
      <LoginCommandCenterInner />
    </Suspense>
  );
}

