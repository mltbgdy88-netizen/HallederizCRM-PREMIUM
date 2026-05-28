// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { ReportAnalyticsShell } from "@hallederiz/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconArchive,
  IconBanknote,
  IconBarChart3,
  IconBot,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconFilter,
  IconMail,
  IconMessageSquare,
  IconPackage,
  IconPrinter,
  IconShoppingCart,
  IconSparkles,
  IconTrendingUp,
  IconWallet
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import { useAuth } from "../../../providers/auth-provider";
import { metricMatchesChip, REPORTS_DEMO_METRICS, REPORTS_USE_DEMO_DATA } from "../data/reports-demo-data";
import type { ReportCategoryChip, ReportDiffTone } from "../types";

const KPI = {
  ciro: "â‚º1.284.500",
  tahsilat: "â‚º642.300",
  acik: "â‚º294.050",
  kritikStok: "12",
  waDonusum: "%38",
  aiTasarruf: "14 saat"
} as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface TenantUsageSummary {
  totalEvents: number;
  limitExceeded: boolean;
}

type ReportTypeSelect =
  | "genel-bakis"
  | "satis"
  | "tahsilat"
  | "stok"
  | "iade"
  | "whatsapp"
  | "ai-op";

function reportSelectToChip(v: ReportTypeSelect): ReportCategoryChip | "all" {
  if (v === "genel-bakis") return "all";
  if (v === "satis") return "satis";
  if (v === "tahsilat") return "tahsilat";
  if (v === "stok") return "stok";
  if (v === "iade") return "iade";
  if (v === "whatsapp") return "whatsapp";
  return "ai";
}

function chipToReportSelect(c: ReportCategoryChip | "all"): ReportTypeSelect {
  if (c === "all") return "genel-bakis";
  if (c === "genel") return "genel-bakis";
  if (c === "satis") return "satis";
  if (c === "tahsilat") return "tahsilat";
  if (c === "stok") return "stok";
  if (c === "iade") return "iade";
  if (c === "whatsapp") return "whatsapp";
  return "ai-op";
}

function diffBadgeClass(t: ReportDiffTone): string {
  switch (t) {
    case "positive":
      return "hz-reports-badge hz-reports-badge--success";
    case "negative":
      return "hz-reports-badge hz-reports-badge--warn";
    case "warning":
      return "hz-reports-badge hz-reports-badge--warning";
    case "risk":
      return "hz-reports-badge hz-reports-badge--danger";
    default:
      return "hz-reports-badge hz-reports-badge--neutral";
  }
}

function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

function ReportsChartSlot({ useDemo }: { useDemo: boolean }) {
  if (!useDemo) {
    return (
      <div className="hz-reports-chart-empty" role="status">
        <div>
          <strong className="hz-reports-chart-empty-title">Grafik alanÄ±</strong>
          <span className="hz-reports-chart-empty-text">CanlÄ± rapor verisi baÄŸlandÄ±ÄŸÄ±nda trend burada gÃ¶sterilir. Sahte grafik Ã§izilmez.</span>
        </div>
      </div>
    );
  }
  const bars = [12, 16, 14, 18, 15, 17, 13];
  const labels = ["Pt", "Sa", "Ã‡a", "Pe", "Cu", "Ct", "Pz"];
  return (
    <div className="hz-reports-mini-trend" role="img" aria-label="HaftalÄ±k indeks (Ã¶nizleme modu)">
      <div className="hz-reports-mini-trend-cap">HaftalÄ±k indeks (Ã¶nizleme)</div>
      <div className="hz-reports-mini-trend-inner">
        {bars.map((h, i) => (
          <div key={labels[i]} className="hz-reports-mini-trend-col">
            <div className="hz-reports-mini-trend-bar" style={{ height: `${h}px` }} />
            <span className="hz-reports-mini-trend-lbl">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsKpiValue({ label, demoValue, useDemo }: { label: string; demoValue: string; useDemo: boolean }) {
  return (
    <span
      className={`hz-reports-kpi-value${useDemo ? "" : " hz-reports-kpi-value--pending"}`}
      title={useDemo ? undefined : `${label}: canlÄ± veri bekleniyor`}
    >
      {useDemo ? demoValue : "â€”"}
    </span>
  );
}

export function ReportsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { session, state } = useAuth();
  const baseRows = useMemo(() => (REPORTS_USE_DEMO_DATA ? REPORTS_DEMO_METRICS : []), []);

  const [activeChip, setActiveChip] = useState<ReportCategoryChip | "all">("all");
  const [reportType, setReportType] = useState<ReportTypeSelect>("genel-bakis");
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [branch, setBranch] = useState("all");
  const [segment, setSegment] = useState("all");
  const [channel, setChannel] = useState("all");
  const [compare, setCompare] = useState("prev");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    REPORTS_USE_DEMO_DATA && REPORTS_DEMO_METRICS.length > 0 ? (REPORTS_DEMO_METRICS[0]?.id ?? null) : null
  );
  const [actionLocks, setActionLocks] = useState<Record<string, boolean>>({});
  const [rowPdfLocks, setRowPdfLocks] = useState<Record<string, boolean>>({});
  const [rowXlsLocks, setRowXlsLocks] = useState<Record<string, boolean>>({});
  const [usageSummary, setUsageSummary] = useState<TenantUsageSummary | null>(null);

  const chipFilter = useMemo(() => activeChip, [activeChip]);

  const filtered = useMemo(() => baseRows.filter((r) => metricMatchesChip(r, chipFilter)), [baseRows, chipFilter]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev && filtered.some((r) => r.id === prev)) return prev;
      const first = filtered[0];
      return first ? first.id : null;
    });
  }, [filtered]);

  useEffect(() => {
    if (state !== "authenticated" || !session?.tenant.id) {
      setUsageSummary(null);
      return;
    }
    const controller = new AbortController();
    void fetch(`${API_BASE_URL}/platform/tenant-usage/summary`, {
      method: "GET",
      headers: { "x-tenant-id": session.tenant.id },
      credentials: "include",
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => (response.ok ? ((await response.json()) as { item: TenantUsageSummary }).item : null))
      .then((item) => setUsageSummary(item))
      .catch(() => setUsageSummary(null));
    return () => controller.abort();
  }, [session?.tenant.id, state]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return filtered.find((r) => r.id === selectedId) ?? baseRows.find((r) => r.id === selectedId) ?? null;
  }, [selectedId, filtered, baseRows]);

  const lockAction = useCallback(
    (key: string, msg: string) => {
      pushToast(msg);
      setActionLocks((s) => ({ ...s, [key]: true }));
    },
    [pushToast]
  );

  const syncFromSelect = useCallback((v: ReportTypeSelect) => {
    setReportType(v);
    setActiveChip(reportSelectToChip(v));
  }, []);

  const syncFromChip = useCallback((c: ReportCategoryChip | "all") => {
    setActiveChip(c);
    setReportType(chipToReportSelect(c));
  }, []);

  const resetFilters = useCallback(() => {
    setReportType("genel-bakis");
    setActiveChip("all");
    setDateFrom("2026-05-01");
    setDateTo("2026-05-31");
    setBranch("all");
    setSegment("all");
    setChannel("all");
    setCompare("prev");
    pushToast("Filtreler sÄ±fÄ±rlandÄ±.");
  }, [pushToast]);

  const navigateSafe = useCallback(
    (href: string) => {
      pushToast("YÃ¶nlendiriliyorâ€¦");
      router.push(href);
    },
    [pushToast, router]
  );

  const chips: { id: ReportCategoryChip | "all"; label: string }[] = [
    { id: "all", label: "Genel" },
    { id: "satis", label: "SatÄ±ÅŸ" },
    { id: "tahsilat", label: "Tahsilat" },
    { id: "stok", label: "Stok" },
    { id: "iade", label: "Ä°ade" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "ai", label: "AI" }
  ];

  return (
    <div className="hz-reports-page hz-reports-page--desk">
      <div className="hz-reports-layout">
        <div className="hz-reports-main">
          <header className="hz-reports-topbar">
            <div className="hz-reports-topbar-text">
              <h1 className="hz-reports-topbar-title">Rapor Operasyon Merkezi</h1>
              <p className="hz-reports-topbar-sub">Operasyonel metrikler, hedef karÅŸÄ±laÅŸtÄ±rma ve karar destek raporlarÄ±.</p>
            </div>
            <div className="hz-reports-topbar-actions">
              <button
                type="button"
                className="hz-reports-toolbar-btn hz-reports-toolbar-btn--primary"
                disabled={!!actionLocks.create}
                onClick={() => lockAction("create", "Demo: rapor oluÅŸturma kuyruÄŸa alÄ±ndÄ±.")}
              >
                <IconBarChart3 size={13} />
                Rapor OluÅŸtur
              </button>
              <button
                type="button"
                className="hz-reports-toolbar-btn hz-reports-toolbar-btn--outline"
                disabled={!!actionLocks.pdf}
                onClick={() => lockAction("pdf", "Demo: PDF indirme hazÄ±rlanÄ±yor.")}
              >
                <IconPrinter size={13} />
                PDF Ä°ndir
              </button>
              <button
                type="button"
                className="hz-reports-toolbar-btn hz-reports-toolbar-btn--outline"
                disabled={!!actionLocks.xls}
                onClick={() => lockAction("xls", "Demo: Excel dÄ±ÅŸa aktarma hazÄ±rlanÄ±yor.")}
              >
                <IconDownload size={13} />
                Excel Ä°ndir
              </button>
              <button
                type="button"
                className="hz-reports-toolbar-btn hz-reports-toolbar-btn--outline"
                disabled={!!actionLocks.mail}
                onClick={() => lockAction("mail", "Demo: e-posta kuyruÄŸa alÄ±ndÄ±.")}
              >
                <IconMail size={13} />
                E-posta GÃ¶nder
              </button>
            </div>
          </header>

          <div className="hz-reports-desk-card">
            <div className="hz-reports-type-tabs hz-reports-type-tabs--desk-head" role="tablist" aria-label="Rapor tipi kÄ±sayollarÄ±">
              {chips.map((c) => (
                <button
                  key={c.id === "all" ? "all-chip" : c.id}
                  type="button"
                  role="tab"
                  aria-selected={activeChip === c.id}
                  className={`hz-reports-type-tab${activeChip === c.id ? " hz-reports-type-tab--active" : ""}`}
                  onClick={() => syncFromChip(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <ReportAnalyticsShell
            filters={
              <>
                <div className="hz-reports-filter-bar">
                  <div className="hz-reports-filter-row hz-reports-filter-row--single hz-reports-filter-row--desk">
                    <div className="hz-reports-filter-field hz-reports-filter-field--dates">
                      <span className="hz-reports-filter-label" id="hz-rep-dates-lbl">
                        DÃ¶nem
                      </span>
                      <div className="hz-reports-filter-date-pair" role="group" aria-labelledby="hz-rep-dates-lbl">
                        <input
                          type="date"
                          className="hz-reports-filter-input hz-reports-filter-input--date"
                          aria-label="BaÅŸlangÄ±Ã§"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                        <span className="hz-reports-filter-date-sep" aria-hidden>
                          â€“
                        </span>
                        <input
                          type="date"
                          className="hz-reports-filter-input hz-reports-filter-input--date"
                          aria-label="BitiÅŸ"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="hz-reports-filter-field hz-reports-filter-field--select">
                      <label className="hz-reports-filter-label" htmlFor="hz-rep-cmp">
                        KarÅŸÄ±laÅŸtÄ±rma
                      </label>
                      <select id="hz-rep-cmp" className="hz-reports-filter-select" value={compare} onChange={(e) => setCompare(e.target.value)}>
                        <option value="prev">Ã–nceki dÃ¶nem</option>
                        <option value="last-month">GeÃ§en ay</option>
                        <option value="last-year">GeÃ§en yÄ±l</option>
                        <option value="target">Hedefe gÃ¶re</option>
                      </select>
                    </div>
                    <div className="hz-reports-filter-field hz-reports-filter-field--select">
                      <label className="hz-reports-filter-label" htmlFor="hz-rep-seg">
                        Segment
                      </label>
                      <select id="hz-rep-seg" className="hz-reports-filter-select" value={segment} onChange={(e) => setSegment(e.target.value)}>
                        <option value="all">TÃ¼mÃ¼</option>
                        <option value="bayi">Bayi</option>
                        <option value="kurumsal">Kurumsal</option>
                        <option value="perakende">Perakende</option>
                        <option value="riskli">Riskli</option>
                      </select>
                    </div>
                    <div className="hz-reports-filter-field hz-reports-filter-field--actions">
                      <span className="hz-reports-filter-label hz-reports-filter-label--phantom" aria-hidden="true">
                        {"\u00a0"}
                      </span>
                      <button type="button" className="hz-reports-filter-reset" title="Filtreleri temizle" aria-label="Filtreleri temizle" onClick={resetFilters}>
                        Filtreleri Temizle
                      </button>
                    </div>
                  </div>
                </div>

                {REPORTS_USE_DEMO_DATA ? (
                  <div className="hz-reports-preview-band" role="status">
                    Ã–nizleme modu: Ã¶rnek rapor metrikleri gÃ¶steriliyor.
                    {usageSummary
                      ? ` KiracÄ± kullanÄ±m API'si baÄŸlÄ±: ${usageSummary.totalEvents} olay, limit aÅŸÄ±mÄ± ${usageSummary.limitExceeded ? "var" : "yok"}.`
                      : " KiracÄ± kullanÄ±m API sonucu yok veya oturum bekleniyor."}
                  </div>
                ) : (
                  <div className="hz-reports-live-band" role="status">
                    <div>
                      <strong>CanlÄ± rapor verisi bekleniyor</strong>
                      <span>Metrik listesi API baÄŸlandÄ±ÄŸÄ±nda dolar; sahte KPI veya grafik Ã¼retilmez.</span>
                    </div>
                  </div>
                )}
              </>
            }
            kpis={
              <section className="hz-reports-kpi-strip" aria-label="Ã–zet KPI">
                <div className="hz-reports-kpi hz-reports-kpi--primary">
                  <span className="hz-reports-kpi-ico" aria-hidden>
                    <IconTrendingUp size={12} />
                  </span>
                  <span className="hz-reports-kpi-text">
                    <span className="hz-reports-kpi-label">Ciro</span>
                    <ReportsKpiValue label="Ciro" demoValue={KPI.ciro} useDemo={REPORTS_USE_DEMO_DATA} />
                  </span>
                </div>
                <div className="hz-reports-kpi hz-reports-kpi--success">
                  <span className="hz-reports-kpi-ico" aria-hidden>
                    <IconWallet size={12} />
                  </span>
                  <span className="hz-reports-kpi-text">
                    <span className="hz-reports-kpi-label">Tahsilat</span>
                    <ReportsKpiValue label="Tahsilat" demoValue={KPI.tahsilat} useDemo={REPORTS_USE_DEMO_DATA} />
                  </span>
                </div>
                <div className="hz-reports-kpi hz-reports-kpi--warn">
                  <span className="hz-reports-kpi-ico" aria-hidden>
                    <IconBanknote size={12} />
                  </span>
                  <span className="hz-reports-kpi-text">
                    <span className="hz-reports-kpi-label">AÃ§Ä±k Bakiye</span>
                    <ReportsKpiValue label="AÃ§Ä±k Bakiye" demoValue={KPI.acik} useDemo={REPORTS_USE_DEMO_DATA} />
                  </span>
                </div>
                <div className="hz-reports-kpi hz-reports-kpi--danger">
                  <span className="hz-reports-kpi-ico" aria-hidden>
                    <IconPackage size={12} />
                  </span>
                  <span className="hz-reports-kpi-text">
                    <span className="hz-reports-kpi-label">Kritik Stok</span>
                    <ReportsKpiValue label="Kritik Stok" demoValue={KPI.kritikStok} useDemo={REPORTS_USE_DEMO_DATA} />
                  </span>
                </div>
                <div className="hz-reports-kpi hz-reports-kpi--cyan">
                  <span className="hz-reports-kpi-ico" aria-hidden>
                    <IconMessageSquare size={12} />
                  </span>
                  <span className="hz-reports-kpi-text">
                    <span className="hz-reports-kpi-label">WhatsApp DÃ¶nÃ¼ÅŸÃ¼m</span>
                    <ReportsKpiValue label="WhatsApp DÃ¶nÃ¼ÅŸÃ¼m" demoValue={KPI.waDonusum} useDemo={REPORTS_USE_DEMO_DATA} />
                  </span>
                </div>
                <div className="hz-reports-kpi hz-reports-kpi--ai">
                  <span className="hz-reports-kpi-ico" aria-hidden>
                    <IconSparkles size={12} />
                  </span>
                  <span className="hz-reports-kpi-text">
                    <span className="hz-reports-kpi-label">AI Tasarruf</span>
                    <ReportsKpiValue label="AI Tasarruf" demoValue={KPI.aiTasarruf} useDemo={REPORTS_USE_DEMO_DATA} />
                  </span>
                </div>
              </section>
            }
            charts={<ReportsChartSlot useDemo={REPORTS_USE_DEMO_DATA} />}
            table={
              <div className="hz-reports-list-wrap">
                <div className="hz-reports-list-header" role="row">
                  <div role="columnheader">Metrik / Rapor</div>
                  <div role="columnheader">Segment</div>
                  <div role="columnheader">DÃ¶nem</div>
                  <div role="columnheader">GerÃ§ekleÅŸen</div>
                  <div role="columnheader">Hedef</div>
                  <div role="columnheader">Fark</div>
                  <div role="columnheader">Aksiyon</div>
                </div>
                <div className="hz-reports-list-body">
                  {!filtered.length ? (
                    <div className="hz-reports-empty" role="status">
                      <p className="hz-reports-empty-title">{REPORTS_USE_DEMO_DATA ? "KayÄ±t yok" : "CanlÄ± veri bekleniyor"}</p>
                      <p className="hz-reports-empty-text">
                        {REPORTS_USE_DEMO_DATA
                          ? "Filtre veya rapor tipini deÄŸiÅŸtirin."
                          : "Rapor metrikleri API Ã¼zerinden yÃ¼klendiÄŸinde liste burada gÃ¶rÃ¼nÃ¼r."}
                      </p>
                    </div>
                  ) : (
                    filtered.map((row) => (
                      <div
                        key={row.id}
                        role="row"
                        className={`hz-reports-row${selectedId === row.id ? " hz-reports-row--selected" : ""}`}
                        tabIndex={0}
                        onClick={() => setSelectedId(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedId(row.id);
                          }
                        }}
                      >
                        <div className="hz-reports-cell hz-reports-cell--stack" role="cell">
                          <span className="hz-reports-metric-title">{row.title}</span>
                          <span className="hz-reports-metric-code">{row.code}</span>
                        </div>
                        <div className="hz-reports-cell" role="cell">
                          <span className="hz-reports-strong hz-reports-ellipsis">{row.segment}</span>
                        </div>
                        <div className="hz-reports-cell" role="cell">
                          <span className="hz-reports-muted">{row.periodLabel}</span>
                        </div>
                        <div className="hz-reports-cell" role="cell">
                          <span className="hz-reports-strong">{row.actualDisplay}</span>
                        </div>
                        <div className="hz-reports-cell" role="cell">
                          <span className="hz-reports-muted">{row.targetDisplay}</span>
                        </div>
                        <div className="hz-reports-cell" role="cell">
                          <span className={diffBadgeClass(row.diffTone)}>{row.diffDisplay}</span>
                        </div>
                        <div className="hz-reports-cell hz-reports-actions" role="cell" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="hz-reports-act-btn hz-reports-act-btn--soft"
                            aria-label="Detay"
                            onClick={() => {
                              setSelectedId(row.id);
                              pushToast("Metrik seÃ§ildi; detay saÄŸ panelde.");
                            }}
                          >
                            Detay
                          </button>
                          <button
                            type="button"
                            className="hz-reports-act-icon hz-reports-act-icon--labeled"
                            title="PDF"
                            aria-label="PDF indir"
                            disabled={!!rowPdfLocks[row.id]}
                            onClick={() => {
                              pushToast("Demo: PDF indirme kuyruÄŸa alÄ±ndÄ±.");
                              setRowPdfLocks((s) => ({ ...s, [row.id]: true }));
                            }}
                          >
                            <IconPrinter size={12} />
                          </button>
                          <button
                            type="button"
                            className="hz-reports-act-icon hz-reports-act-icon--labeled"
                            title="Excel"
                            aria-label="Excel indir"
                            disabled={!!rowXlsLocks[row.id]}
                            onClick={() => {
                              pushToast("Demo: Excel indirme kuyruÄŸa alÄ±ndÄ±.");
                              setRowXlsLocks((s) => ({ ...s, [row.id]: true }));
                            }}
                          >
                            <IconDownload size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            }
          />
          </div>
        </div>

        <aside className="hz-reports-side" aria-label="Rapor baÄŸlamÄ±">
          <div className="hz-reports-side-inner">
            <header className="hz-reports-side-head">
              <h2 className="hz-reports-side-title">Rapor BaÄŸlamÄ±</h2>
              <p className="hz-reports-side-sub">SeÃ§ili metriÄŸin hedef, risk ve aksiyon baÄŸlamÄ±.</p>
            </header>
            {!selected ? (
              <div className="hz-reports-empty hz-reports-empty--side" role="status">
                <p className="hz-reports-empty-title">Listeden bir metrik seÃ§in.</p>
              </div>
            ) : (
              <div className="hz-reports-side-stack">
                <article className="hz-reports-side-card">
                  <h3 className="hz-reports-side-card-title">Metrik Ã–zeti</h3>
                  <p className="hz-reports-side-strong">{selected.title}</p>
                  <dl className="hz-reports-dl">
                    <div>
                      <dt>Rapor kodu</dt>
                      <dd>{selected.code}</dd>
                    </div>
                    <div>
                      <dt>Segment</dt>
                      <dd>{selected.segment}</dd>
                    </div>
                    <div>
                      <dt>DÃ¶nem</dt>
                      <dd>{selected.periodLabel}</dd>
                    </div>
                  </dl>
                  <p className="hz-reports-side-badges">
                    <span className={diffBadgeClass(selected.diffTone)}>{selected.diffDisplay}</span>
                  </p>
                </article>

                <article className="hz-reports-side-card">
                  <h3 className="hz-reports-side-card-title">Hedef KarÅŸÄ±laÅŸtÄ±rmasÄ±</h3>
                  <dl className="hz-reports-dl">
                    <div>
                      <dt>GerÃ§ekleÅŸen</dt>
                      <dd>{selected.actualDisplay}</dd>
                    </div>
                    <div>
                      <dt>Hedef</dt>
                      <dd>{selected.targetDisplay}</dd>
                    </div>
                    <div>
                      <dt>Fark</dt>
                      <dd>{selected.diffDisplay}</dd>
                    </div>
                  </dl>
                  <div className="hz-reports-target-progress" aria-label="Hedef gerÃ§ekleÅŸme">
                    <span style={{ width: selected.diffTone === "negative" ? "72%" : "112%" }} />
                  </div>
                  <p className="hz-reports-target-progress-label">{selected.trendLabel}</p>
                </article>

                <article className="hz-reports-side-card">
                  <h3 className="hz-reports-side-card-title">Kaynaklar</h3>
                  <div className="hz-reports-side-links">
                    <button type="button" className="hz-reports-link-btn" onClick={() => navigateSafe("/siparisler")}>
                      <IconShoppingCart size={14} />
                      SatÄ±ÅŸ
                    </button>
                    <button type="button" className="hz-reports-link-btn" onClick={() => navigateSafe("/tahsilatlar")}>
                      <IconWallet size={14} />
                      Tahsilat
                    </button>
                    <button type="button" className="hz-reports-link-btn" onClick={() => navigateSafe("/stok")}>
                      <IconPackage size={14} />
                      Stok
                    </button>
                    <button type="button" className="hz-reports-link-btn" onClick={() => navigateSafe("/whatsapp")}>
                      <IconMessageSquare size={14} />
                      WhatsApp
                    </button>
                    <button type="button" className="hz-reports-link-btn" onClick={() => navigateSafe("/onaylar")}>
                      <IconBot size={14} />
                      AI
                    </button>
                    <button type="button" className="hz-reports-link-btn" onClick={() => navigateSafe("/belgeler")}>
                      <IconFileText size={14} />
                      Belgeler
                    </button>
                    <button type="button" className="hz-reports-link-btn" onClick={() => navigateSafe("/archive")}>
                      <IconArchive size={14} />
                      ArÅŸiv
                    </button>
                  </div>
                </article>

                <article className="hz-reports-side-card">
                  <h3 className="hz-reports-side-card-title">Ã–nerilen Aksiyonlar</h3>
                  <ul className="hz-reports-ai-checklist">
                    <li>YÃ¼ksek aÃ§Ä±k bakiye mÃ¼ÅŸteri aramalarÄ±nÄ± hÄ±zlandÄ±rÄ±n.</li>
                    <li>Kritik stok kalemleri iÃ§in tedarik planÄ± oluÅŸturun.</li>
                    <li>WhatsApp dÃ¶nÃ¼ÅŸÃ¼m dÃ¼ÅŸÃ¼k segmente ÅŸablon gÃ¶nderin.</li>
                    <li>AI tasarruf raporunu operasyon toplantÄ±sÄ±nda paylaÅŸÄ±n.</li>
                  </ul>
                  <div className="hz-reports-side-actions">
                    <button type="button" className="hz-reports-side-btn hz-reports-side-btn--primary hz-reports-side-btn--plan" onClick={() => pushToast("Demo: aksiyon planÄ± taslaÄŸÄ± oluÅŸturuldu.")}>
                      Aksiyon PlanÄ± OluÅŸtur
                    </button>
                    <button type="button" className="hz-reports-side-btn" onClick={() => pushToast("Demo: detay gÃ¶rÃ¼nÃ¼mÃ¼.")}>
                      Detay aÃ§
                    </button>
                    <button
                      type="button"
                      className="hz-reports-side-btn"
                      disabled={!!actionLocks.sidePdf}
                      onClick={() => lockAction("sidePdf", "Demo: PDF indirme kuyruÄŸa alÄ±ndÄ±.")}
                    >
                      <IconPrinter size={14} />
                      PDF indir
                    </button>
                    <button
                      type="button"
                      className="hz-reports-side-btn"
                      disabled={!!actionLocks.sideXls}
                      onClick={() => lockAction("sideXls", "Demo: Excel indirme kuyruÄŸa alÄ±ndÄ±.")}
                    >
                      <IconDownload size={14} />
                      Excel indir
                    </button>
                    <button
                      type="button"
                      className="hz-reports-side-btn"
                      disabled={!!actionLocks.sideMail}
                      onClick={() => lockAction("sideMail", "Demo: e-posta kuyruÄŸa alÄ±ndÄ±.")}
                    >
                      <IconMail size={14} />
                      E-posta gÃ¶nder
                    </button>
                    <button type="button" className="hz-reports-side-btn" onClick={() => navigateSafe("/cariler")}>
                      <IconExternalLink size={14} />
                      Ä°lgili kayda git
                    </button>
                  </div>
                </article>

                <article className="hz-reports-side-card hz-reports-risk-note">
                  <h3 className="hz-reports-side-card-title">
                    <IconSparkles size={14} />
                    Risk / FÄ±rsat Notu
                  </h3>
                  <p>Bu metrik karar destek amaÃ§lÄ± Ã¶zetlenir.</p>
                  <p>AI raporu deÄŸiÅŸtirmez; yalnÄ±zca risk ve fÄ±rsat notu Ã¼retir.</p>
                </article>

                <article className="hz-reports-side-card">
                  <h3 className="hz-reports-side-card-title">Son GÃ¼ncelleme</h3>
                  <dl className="hz-reports-dl">
                    <div>
                      <dt>OluÅŸturan</dt>
                      <dd>{selected.updatedBy}</dd>
                    </div>
                    <div>
                      <dt>Zaman</dt>
                      <dd>{formatUpdated(selected.updatedAtIso)}</dd>
                    </div>
                    <div>
                      <dt>Veri periyodu</dt>
                      <dd>{selected.dataPeriodNote}</dd>
                    </div>
                    <div>
                      <dt>Hesaplama</dt>
                      <dd>{selected.calculationType}</dd>
                    </div>
                    <div>
                      <dt>Audit</dt>
                      <dd>{selected.auditNote}</dd>
                    </div>
                  </dl>
                </article>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

