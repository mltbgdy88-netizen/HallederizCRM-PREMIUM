// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconArchive,
  IconArrowRightCircle,
  IconCheckCircle,
  IconClock,
  IconDatabase,
  IconDownload,
  IconExternalLink,
  IconFilter,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconUpload
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import { ARCHIVE_DEMO_RECORDS, ARCHIVE_USE_DEMO_DATA } from "../data/archive-demo-records";
import { getArchiveLiveRecords } from "../queries/get-archive-live-records";
import type {
  ArchiveCategoryFilter,
  ArchiveRecord,
  ArchiveRecordStatus,
  ArchiveSourceKind
} from "../types";

function buildArchiveKpi(rows: ArchiveRecord[]) {
  if (!rows.length) {
    return { total: 0, today: 0, approvedDocs: 0, pendingOps: 0, risky: 0, retention: "â€”" };
  }
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return {
    total: rows.length,
    today: rows.filter((row) => new Date(row.createdAt) >= todayStart).length,
    approvedDocs: rows.filter((row) => row.status === "onaylandi" || row.status === "arsivlendi").length,
    pendingOps: rows.filter((row) => row.status === "bekliyor").length,
    risky: rows.filter((row) => row.status === "riskli").length,
    retention: "5 yÄ±l"
  };
}

function formatArchiveDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

function formatArchiveTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function statusLabel(s: ArchiveRecordStatus): string {
  switch (s) {
    case "onaylandi":
      return "OnaylandÄ±";
    case "bekliyor":
      return "Bekliyor";
    case "reddedildi":
      return "Reddedildi";
    case "riskli":
      return "Riskli";
    case "arsivlendi":
      return "ArÅŸivlendi";
    default:
      return s;
  }
}

function sourceLabel(src: ArchiveSourceKind): string {
  switch (src) {
    case "crm":
      return "CRM";
    case "whatsapp":
      return "WhatsApp";
    case "ai":
      return "AI";
    case "kullanici":
      return "KullanÄ±cÄ±";
    case "sistem":
      return "Sistem";
    case "ice_aktar":
      return "Ä°Ã§e aktar";
    default:
      return src;
  }
}

function statusBadgeClass(s: ArchiveRecordStatus): string {
  switch (s) {
    case "onaylandi":
    case "arsivlendi":
      return "hz-archive-badge hz-archive-badge--success";
    case "bekliyor":
      return "hz-archive-badge hz-archive-badge--warning";
    case "reddedildi":
    case "riskli":
      return "hz-archive-badge hz-archive-badge--danger";
    default:
      return "hz-archive-badge hz-archive-badge--neutral";
  }
}

function sourceBadgeClass(src: ArchiveSourceKind): string {
  if (src === "ai") return "hz-archive-badge hz-archive-badge--info";
  if (src === "whatsapp") return "hz-archive-badge hz-archive-badge--info";
  if (src === "sistem") return "hz-archive-badge hz-archive-badge--neutral";
  return "hz-archive-badge hz-archive-badge--neutral";
}

function filterRecords(
  rows: ArchiveRecord[],
  search: string,
  category: ArchiveCategoryFilter,
  source: ArchiveSourceKind | "all",
  status: ArchiveRecordStatus | "all",
  dateFrom: string,
  dateTo: string,
  user: string
): ArchiveRecord[] {
  const q = search.trim().toLowerCase();
  const uq = user.trim().toLowerCase();
  return rows.filter((r) => {
    if (category !== "all" && r.categoryKey !== category) return false;
    if (source !== "all" && r.source !== source) return false;
    if (status !== "all" && r.status !== status) return false;
    if (uq && !r.responsible.toLowerCase().includes(uq) && !r.auditCreatedBy.toLowerCase().includes(uq)) return false;
    if (dateFrom) {
      const start = new Date(dateFrom);
      start.setHours(0, 0, 0, 0);
      if (new Date(r.createdAt) < start) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(r.createdAt) > end) return false;
    }
    if (!q) return true;
    const blob = `${r.documentNumber} ${r.title} ${r.customerName} ${r.contextRef} ${r.recordType}`.toLowerCase();
    return blob.includes(q);
  });
}

export function ArchivePage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [liveRows, setLiveRows] = useState<ArchiveRecord[]>([]);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const [liveReady, setLiveReady] = useState(false);
  const [liveLoading, setLiveLoading] = useState(!ARCHIVE_USE_DEMO_DATA);

  const baseRows = useMemo(
    () => (ARCHIVE_USE_DEMO_DATA ? ARCHIVE_DEMO_RECORDS : liveRows),
    [liveRows]
  );

  useEffect(() => {
    if (ARCHIVE_USE_DEMO_DATA) {
      setLiveLoading(false);
      return;
    }
    let active = true;
    setLiveLoading(true);
    void getArchiveLiveRecords()
      .then((result) => {
        if (!active) return;
        setLiveRows(result.records);
        setLiveMessage(result.message ?? null);
        setLiveReady(result.liveReady);
        setLiveLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLiveRows([]);
        setLiveMessage("ArÅŸiv kayÄ±tlarÄ± ÅŸu anda alÄ±namÄ±yor.");
        setLiveReady(false);
        setLiveLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ArchiveCategoryFilter>("all");
  const [source, setSource] = useState<ArchiveSourceKind | "all">("all");
  const [status, setStatus] = useState<ArchiveRecordStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [actionLocks, setActionLocks] = useState<Record<string, boolean>>({});
  const [rowDownloadLocks, setRowDownloadLocks] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () => filterRecords(baseRows, search, category, source, status, dateFrom, dateTo, userFilter),
    [baseRows, search, category, source, status, dateFrom, dateTo, userFilter]
  );

  const kpi = useMemo(() => buildArchiveKpi(baseRows), [baseRows]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((row) => row.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

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

  const notLiveAction = useCallback(
    (key: string, detail: string) => {
      lockAction(key, `Bu iÅŸlem henÃ¼z canlÄ± kullanÄ±ma baÄŸlÄ± deÄŸil. ${detail}`);
    },
    [lockAction]
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategory("all");
    setSource("all");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    setUserFilter("");
    pushToast("Filtreler sÄ±fÄ±rlandÄ±.");
  }, [pushToast]);

  const navigateSafe = useCallback(
    (href: string) => {
      pushToast("YÃ¶nlendiriliyorâ€¦");
      router.push(href);
    },
    [pushToast, router]
  );

  const categoryChips: { key: ArchiveCategoryFilter; label: string }[] = [
    { key: "all", label: "TÃ¼m KayÄ±tlar" },
    { key: "siparis", label: "SipariÅŸ" },
    { key: "tahsilat", label: "Tahsilat" },
    { key: "onay", label: "Onay" },
    { key: "iade", label: "Ä°ade" },
    { key: "fatura", label: "Fatura" },
    { key: "belge", label: "Belge" }
  ];

  return (
    <div className="hz-archive-page hz-archive-page--desk">
      <div className="hz-archive-layout">
        <div className="hz-archive-main">
          <header className="hz-archive-topbar">
            <div className="hz-archive-topbar-text">
              <h1 className="hz-archive-topbar-title">ArÅŸiv Operasyon Merkezi</h1>
              <p className="hz-archive-topbar-sub">GeÃ§miÅŸ iÅŸlemler, belgeler ve denetim kayÄ±tlarÄ±nÄ± tek ekranda yÃ¶netin.</p>
            </div>
            <div className="hz-archive-topbar-actions">
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--primary"
                disabled={!!actionLocks.upload}
                onClick={() => notLiveAction("upload", "Belge yÃ¼kleme baÄŸlantÄ±sÄ± gerekir.")}
              >
                <IconUpload size={15} />
                Belge YÃ¼kle
              </button>
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--outline"
                disabled={!!actionLocks.export}
                onClick={() => notLiveAction("export", "DÄ±ÅŸa aktarma henÃ¼z baÄŸlÄ± deÄŸil.")}
              >
                <IconExternalLink size={14} />
                DÄ±ÅŸa Aktar
              </button>
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--outline"
                disabled={!!actionLocks.bulk}
                onClick={() => notLiveAction("bulk", "Toplu indirme henÃ¼z baÄŸlÄ± deÄŸil.")}
              >
                <IconDownload size={15} />
                Toplu Ä°ndir
              </button>
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--outline"
                disabled={!!actionLocks.audit}
                onClick={() => notLiveAction("audit", "Denetim raporu henÃ¼z baÄŸlÄ± deÄŸil.")}
              >
                <IconShieldCheck size={15} />
                Denetim Raporu
              </button>
            </div>
          </header>

          <section className="hz-archive-kpi-strip" aria-label="Ã–zet gÃ¶stergeler">
            <div className="hz-archive-kpi hz-archive-kpi--info">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconDatabase size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Toplam KayÄ±t</span>
                <span className="hz-archive-kpi-value">{kpi.total}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--primary">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconClock size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">BugÃ¼n Eklenen</span>
                <span className="hz-archive-kpi-value">{kpi.today}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--success">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconCheckCircle size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">OnaylÄ± Belge</span>
                <span className="hz-archive-kpi-value">{kpi.approvedDocs}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--warning">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconArrowRightCircle size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Bekleyen Ä°ÅŸlem</span>
                <span className="hz-archive-kpi-value">{kpi.pendingOps}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--danger">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconAlertTriangle size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Riskli KayÄ±t</span>
                <span className="hz-archive-kpi-value">{kpi.risky}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--cyan">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconArchive size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Saklama SÃ¼resi</span>
                <span className="hz-archive-kpi-value">{kpi.retention}</span>
              </span>
            </div>
          </section>

          <nav className="hz-archive-category-chips" aria-label="ArÅŸiv kategorileri">
            {categoryChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={`hz-archive-category-chip${category === chip.key ? " is-active" : ""}`}
                aria-pressed={category === chip.key}
                onClick={() => setCategory(chip.key)}
              >
                {chip.label}
              </button>
            ))}
          </nav>

          <div className="hz-archive-filter-bar">
            <div className="hz-archive-filter-row hz-archive-filter-row--single">
              <div className="hz-archive-filter-field hz-archive-filter-field--grow">
                <label className="hz-archive-filter-label" htmlFor="hz-archive-q">
                  Arama
                </label>
                <span className="hz-archive-filter-input-wrap">
                  <IconSearch size={14} className="hz-archive-filter-input-ico" aria-hidden />
                  <input
                    id="hz-archive-q"
                    className="hz-archive-filter-input hz-archive-filter-input--with-icon"
                    placeholder="Belge no, cari, iÅŸlem, etiket"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </span>
              </div>
              <div className="hz-archive-filter-field hz-archive-filter-field--select">
                <label className="hz-archive-filter-label" htmlFor="hz-archive-cat">
                  Kategori
                </label>
                <select
                  id="hz-archive-cat"
                  className="hz-archive-filter-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ArchiveCategoryFilter)}
                >
                  <option value="all">TÃ¼mÃ¼</option>
                  <option value="siparis">SipariÅŸ</option>
                  <option value="tahsilat">Tahsilat</option>
                  <option value="fatura">Fatura</option>
                  <option value="iade">Ä°ade</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="stok">Stok</option>
                  <option value="onay">Onay</option>
                  <option value="belge">Belge</option>
                </select>
              </div>
              <div className="hz-archive-filter-field hz-archive-filter-field--select">
                <label className="hz-archive-filter-label" htmlFor="hz-archive-src">
                  Kaynak
                </label>
                <select
                  id="hz-archive-src"
                  className="hz-archive-filter-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value as ArchiveSourceKind | "all")}
                >
                  <option value="all">TÃ¼mÃ¼</option>
                  <option value="crm">CRM</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="ai">AI</option>
                  <option value="kullanici">KullanÄ±cÄ±</option>
                  <option value="sistem">Sistem</option>
                  <option value="ice_aktar">Ä°Ã§e aktar</option>
                </select>
              </div>
              <div className="hz-archive-filter-field hz-archive-filter-field--select">
                <label className="hz-archive-filter-label" htmlFor="hz-archive-st">
                  Durum
                </label>
                <select
                  id="hz-archive-st"
                  className="hz-archive-filter-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArchiveRecordStatus | "all")}
                >
                  <option value="all">TÃ¼mÃ¼</option>
                  <option value="onaylandi">OnaylandÄ±</option>
                  <option value="bekliyor">Bekliyor</option>
                  <option value="reddedildi">Reddedildi</option>
                  <option value="riskli">Riskli</option>
                  <option value="arsivlendi">ArÅŸivlendi</option>
                </select>
              </div>
              <div className="hz-archive-filter-field hz-archive-filter-field--dates">
                <span className="hz-archive-filter-label" id="hz-archive-dates-lbl">
                  Tarih
                </span>
                <div className="hz-archive-filter-date-pair" role="group" aria-labelledby="hz-archive-dates-lbl">
                  <input
                    id="hz-archive-d1"
                    type="date"
                    className="hz-archive-filter-input hz-archive-filter-input--date"
                    aria-label="BaÅŸlangÄ±Ã§ tarihi"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <span className="hz-archive-filter-date-sep" aria-hidden>
                    â€“
                  </span>
                  <input
                    id="hz-archive-d2"
                    type="date"
                    className="hz-archive-filter-input hz-archive-filter-input--date"
                    aria-label="BitiÅŸ tarihi"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
              <div className="hz-archive-filter-field hz-archive-filter-field--user">
                <label className="hz-archive-filter-label" htmlFor="hz-archive-user">
                  KullanÄ±cÄ±
                </label>
                <input
                  id="hz-archive-user"
                  className="hz-archive-filter-input"
                  placeholder="Sorumlu veya oluÅŸturan"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              <div className="hz-archive-filter-field hz-archive-filter-field--actions">
                <span className="hz-archive-filter-label hz-archive-filter-label--phantom" aria-hidden="true">
                  {"\u00a0"}
                </span>
                <button
                  type="button"
                  className="hz-archive-filter-reset hz-archive-filter-reset--icon"
                  title="Filtreleri sÄ±fÄ±rla"
                  aria-label="Filtreleri sÄ±fÄ±rla"
                  onClick={resetFilters}
                >
                  <IconFilter size={17} />
                </button>
              </div>
            </div>
          </div>

          {ARCHIVE_USE_DEMO_DATA ? (
            <div className="hz-archive-preview-band" role="status">
              Ã–rnek veri modu: arÅŸiv listesi demo kayÄ±tlarÄ±dÄ±r; canlÄ± arÅŸiv ve indirme henÃ¼z baÄŸlÄ± deÄŸildir.
            </div>
          ) : liveLoading ? (
            <div className="hz-archive-preview-band" role="status">
              ArÅŸiv kayÄ±tlarÄ± yÃ¼kleniyor.
            </div>
          ) : !liveReady ? (
            <div className="hz-archive-preview-band" role="status">
              ArÅŸiv kayÄ±tlarÄ± ÅŸu anda alÄ±namÄ±yor.
            </div>
          ) : liveMessage ? (
            <div className="hz-archive-preview-band" role="status">
              {liveMessage}
            </div>
          ) : null}

          <div className="hz-archive-list-wrap">
            <div className="hz-archive-list-header" role="row">
              <div role="columnheader">KayÄ±t</div>
              <div role="columnheader">Cari / BaÄŸlam</div>
              <div role="columnheader">TÃ¼r</div>
              <div role="columnheader">Tarih</div>
              <div role="columnheader">Durum</div>
              <div role="columnheader">Sorumlu</div>
              <div role="columnheader">Aksiyon</div>
            </div>
            <div className="hz-archive-list-body">
              {!filtered.length ? (
                <div className="hz-archive-empty" role="status">
                  <p className="hz-archive-empty-title">KayÄ±t bulunamadÄ±</p>
                  <p className="hz-archive-empty-text">Filtreleri gevÅŸetin veya sÄ±fÄ±rlayÄ±n.</p>
                </div>
              ) : (
                filtered.map((row) => (
                  <div
                    key={row.id}
                    role="row"
                    className={`hz-archive-row${selectedId === row.id ? " hz-archive-row--selected" : ""}`}
                    onClick={() => setSelectedId(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(row.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="hz-archive-cell hz-archive-cell--stack" role="cell">
                      <span className="hz-archive-record-title">{row.title}</span>
                      <span className="hz-archive-record-meta">
                        <span className="hz-archive-record-no">{row.documentNumber}</span>
                        <span className={sourceBadgeClass(row.source)}>{sourceLabel(row.source)}</span>
                      </span>
                    </div>
                    <div className="hz-archive-cell hz-archive-cell--stack" role="cell">
                      <span className="hz-archive-strong">{row.customerName}</span>
                      <span className="hz-archive-muted">{row.contextRef}</span>
                    </div>
                    <div className="hz-archive-cell" role="cell">
                      <span className="hz-archive-type-pill">{row.recordType}</span>
                    </div>
                    <div className="hz-archive-cell hz-archive-cell--stack" role="cell">
                      <span className="hz-archive-strong">{formatArchiveDate(row.createdAt)}</span>
                      <span className="hz-archive-muted">{formatArchiveTime(row.createdAt)}</span>
                    </div>
                    <div className="hz-archive-cell" role="cell">
                      <span className={statusBadgeClass(row.status)}>{statusLabel(row.status)}</span>
                    </div>
                    <div className="hz-archive-cell hz-archive-cell--responsible" role="cell">
                      <span className="hz-archive-strong">{row.responsible}</span>
                    </div>
                    <div className="hz-archive-cell hz-archive-actions" role="cell" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="hz-archive-act-btn hz-archive-act-btn--soft"
                        aria-label="Detay"
                        onClick={() => {
                          setSelectedId(row.id);
                          pushToast("KayÄ±t seÃ§ildi; detay saÄŸ panelde.");
                        }}
                      >
                        Detay
                      </button>
                      <button
                        type="button"
                        className="hz-archive-act-icon hz-archive-act-icon--labeled"
                        aria-label="Ä°ndir"
                        title="Ä°ndir"
                        disabled={!!rowDownloadLocks[row.id]}
                        onClick={() => {
                          pushToast("Belge indirme henÃ¼z canlÄ± kullanÄ±ma baÄŸlÄ± deÄŸil.");
                          setRowDownloadLocks((s) => ({ ...s, [row.id]: true }));
                        }}
                      >
                        <IconDownload size={15} />
                      </button>
                      <button
                        type="button"
                        className="hz-archive-act-icon hz-archive-act-icon--labeled"
                        title="BaÄŸlantÄ±"
                        aria-label="BaÄŸlantÄ±"
                        onClick={() => {
                          const href = row.relatedLinks[0]?.href ?? "/archive";
                          navigateSafe(href);
                        }}
                      >
                        <IconExternalLink size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="hz-archive-side" aria-label="ArÅŸiv baÄŸlamÄ±">
          <div className="hz-archive-side-inner">
            <header className="hz-archive-side-head">
              <h2 className="hz-archive-side-title">ArÅŸiv BaÄŸlamÄ±</h2>
              <p className="hz-archive-side-sub">SeÃ§ili kaydÄ±n belge, denetim ve iÅŸlem Ã¶zeti.</p>
            </header>
            {!selected ? (
              <div className="hz-archive-empty hz-archive-empty--side" role="status">
                <p className="hz-archive-empty-title">Listeden bir kayÄ±t seÃ§in.</p>
              </div>
            ) : (
              <div className="hz-archive-side-stack">
                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">KayÄ±t Ã–zeti</h3>
                  <p className="hz-archive-side-strong">{selected.title}</p>
                  <dl className="hz-archive-dl">
                    <div>
                      <dt>Belge / iÅŸlem no</dt>
                      <dd>{selected.documentNumber}</dd>
                    </div>
                    <div>
                      <dt>Cari</dt>
                      <dd>{selected.customerName}</dd>
                    </div>
                    <div>
                      <dt>Kaynak</dt>
                      <dd>{sourceLabel(selected.source)}</dd>
                    </div>
                  </dl>
                  <p className="hz-archive-side-badges">
                    <span className={statusBadgeClass(selected.status)}>{statusLabel(selected.status)}</span>
                  </p>
                </article>

                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">BaÄŸlantÄ±lar</h3>
                  <div className="hz-archive-side-links">
                    {selected.relatedLinks.map((l) => (
                      <button key={l.href + l.label} type="button" className="hz-archive-link-btn" onClick={() => navigateSafe(l.href)}>
                        <IconExternalLink size={13} />
                        {l.label}
                      </button>
                    ))}
                  </div>
                </article>

                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">Denetim Ä°zi</h3>
                  <ol className="hz-archive-audit-timeline">
                    <li>
                      <span className="hz-archive-audit-dot hz-archive-audit-dot--ok" aria-hidden />
                      <div>
                        <strong>OluÅŸturuldu</strong>
                        <p>
                          {selected.auditCreatedBy} Â· {formatArchiveDate(selected.createdAt)}{" "}
                          {formatArchiveTime(selected.createdAt)}
                        </p>
                      </div>
                    </li>
                    <li>
                      <span className="hz-archive-audit-dot" aria-hidden />
                      <div>
                        <strong>Son iÅŸlem</strong>
                        <p>{selected.auditLastAction}</p>
                      </div>
                    </li>
                    <li>
                      <span className="hz-archive-audit-dot hz-archive-audit-dot--warn" aria-hidden />
                      <div>
                        <strong>Onay / red</strong>
                        <p>{selected.auditApprovalInfo}</p>
                      </div>
                    </li>
                  </ol>
                </article>

                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">Belge Bilgisi</h3>
                  <dl className="hz-archive-dl">
                    <div>
                      <dt>Dosya adÄ±</dt>
                      <dd>{selected.fileName ?? "â€”"}</dd>
                    </div>
                    <div>
                      <dt>TÃ¼r</dt>
                      <dd>{selected.fileTypeLabel ?? "â€”"}</dd>
                    </div>
                    <div>
                      <dt>Boyut</dt>
                      <dd>{selected.fileSizeLabel ?? "â€”"}</dd>
                    </div>
                    <div>
                      <dt>Saklama</dt>
                      <dd>{selected.retentionYears != null ? `${selected.retentionYears} yÄ±l` : "â€”"}</dd>
                    </div>
                    <div>
                      <dt>Ä°mza / hash</dt>
                      <dd>{selected.hashPreview ?? "â€”"}</dd>
                    </div>
                  </dl>
                </article>

                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">HÄ±zlÄ± Aksiyonlar</h3>
                  <div className="hz-archive-side-actions hz-archive-side-actions--grid">
                    <button type="button" className="hz-archive-side-btn" onClick={() => pushToast("Belge Ã¶nizleme demo modunda.")}>
                      Belgeyi GÃ¶rÃ¼ntÃ¼le
                    </button>
                    <button
                      type="button"
                      className="hz-archive-side-btn"
                      disabled={!!actionLocks.sideDl}
                      onClick={() => notLiveAction("sideDl", "Belge indirme henÃ¼z baÄŸlÄ± deÄŸil.")}
                    >
                      Belgeyi Ä°ndir
                    </button>
                    <button type="button" className="hz-archive-side-btn" onClick={() => pushToast("BaÄŸlantÄ± panoya kopyalandÄ± (demo).")}>
                      BaÄŸlantÄ± Kopyala
                    </button>
                    <button
                      type="button"
                      className="hz-archive-side-btn"
                      disabled={!!actionLocks.sideNote}
                      onClick={() => notLiveAction("sideNote", "ArÅŸiv notu kaydÄ± henÃ¼z baÄŸlÄ± deÄŸil.")}
                    >
                      Not Ekle
                    </button>
                  </div>
                  <p className="hz-archive-retention-note">Bu kayÄ±t 7 yÄ±l saklama politikasÄ±na tabidir.</p>
                </article>

                <article className="hz-archive-side-card hz-archive-risk-note">
                  <h3 className="hz-archive-side-card-title">
                    <IconSparkles size={14} />
                    AI / Risk Notu
                  </h3>
                  <p>Bu kayÄ±t yalnÄ±zca denetim ve izleme amaÃ§lÄ± Ã¶zetlenir.</p>
                  <p>AI arÅŸiv kaydÄ±nÄ± deÄŸiÅŸtirmez; yalnÄ±zca Ã¶zet ve uyarÄ± Ã¼retir.</p>
                </article>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

