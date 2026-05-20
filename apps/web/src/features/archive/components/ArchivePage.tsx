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
    return { total: 0, today: 0, approvedDocs: 0, pendingOps: 0, risky: 0, retention: "—" };
  }
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return {
    total: rows.length,
    today: rows.filter((row) => new Date(row.createdAt) >= todayStart).length,
    approvedDocs: rows.filter((row) => row.status === "onaylandi" || row.status === "arsivlendi").length,
    pendingOps: rows.filter((row) => row.status === "bekliyor").length,
    risky: rows.filter((row) => row.status === "riskli").length,
    retention: "5 yıl"
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
      return "Onaylandı";
    case "bekliyor":
      return "Bekliyor";
    case "reddedildi":
      return "Reddedildi";
    case "riskli":
      return "Riskli";
    case "arsivlendi":
      return "Arşivlendi";
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
      return "Kullanıcı";
    case "sistem":
      return "Sistem";
    case "ice_aktar":
      return "İçe aktar";
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
        setLiveMessage("Arşiv kayıtları şu anda alınamıyor.");
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
      lockAction(key, `Bu işlem henüz canlı kullanıma bağlı değil. ${detail}`);
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
    pushToast("Filtreler sıfırlandı.");
  }, [pushToast]);

  const navigateSafe = useCallback(
    (href: string) => {
      pushToast("Yönlendiriliyor…");
      router.push(href);
    },
    [pushToast, router]
  );

  return (
    <div className="hz-archive-page">
      <div className="hz-archive-layout">
        <div className="hz-archive-main">
          <header className="hz-archive-topbar">
            <div className="hz-archive-topbar-text">
              <h1 className="hz-archive-topbar-title">Arşiv Merkezi</h1>
              <p className="hz-archive-topbar-sub">Belgeler, işlem kayıtları ve onay geçmişini tek ekranda takip edin.</p>
            </div>
            <div className="hz-archive-topbar-actions">
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--primary"
                disabled={!!actionLocks.upload}
                onClick={() => notLiveAction("upload", "Belge yükleme bağlantısı gerekir.")}
              >
                <IconUpload size={15} />
                Belge Yükle
              </button>
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--outline"
                disabled={!!actionLocks.export}
                onClick={() => notLiveAction("export", "Dışa aktarma henüz bağlı değil.")}
              >
                <IconExternalLink size={14} />
                Dışa Aktar
              </button>
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--outline"
                disabled={!!actionLocks.bulk}
                onClick={() => notLiveAction("bulk", "Toplu indirme henüz bağlı değil.")}
              >
                <IconDownload size={15} />
                Toplu İndir
              </button>
              <button
                type="button"
                className="hz-archive-toolbar-btn hz-archive-toolbar-btn--outline"
                disabled={!!actionLocks.audit}
                onClick={() => notLiveAction("audit", "Denetim raporu henüz bağlı değil.")}
              >
                <IconShieldCheck size={15} />
                Denetim Raporu
              </button>
            </div>
          </header>

          <section className="hz-archive-kpi-strip" aria-label="Özet göstergeler">
            <div className="hz-archive-kpi hz-archive-kpi--info">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconDatabase size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Toplam Kayıt</span>
                <span className="hz-archive-kpi-value">{kpi.total}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--primary">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconClock size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Bugün Eklenen</span>
                <span className="hz-archive-kpi-value">{kpi.today}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--success">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconCheckCircle size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Onaylı Belge</span>
                <span className="hz-archive-kpi-value">{kpi.approvedDocs}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--warning">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconArrowRightCircle size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Bekleyen İşlem</span>
                <span className="hz-archive-kpi-value">{kpi.pendingOps}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--danger">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconAlertTriangle size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Riskli Kayıt</span>
                <span className="hz-archive-kpi-value">{kpi.risky}</span>
              </span>
            </div>
            <div className="hz-archive-kpi hz-archive-kpi--cyan">
              <span className="hz-archive-kpi-ico" aria-hidden>
                <IconArchive size={15} />
              </span>
              <span className="hz-archive-kpi-text">
                <span className="hz-archive-kpi-label">Saklama Süresi</span>
                <span className="hz-archive-kpi-value">{kpi.retention}</span>
              </span>
            </div>
          </section>

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
                    placeholder="Belge no, cari, işlem, etiket"
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
                  <option value="all">Tümü</option>
                  <option value="siparis">Sipariş</option>
                  <option value="tahsilat">Tahsilat</option>
                  <option value="fatura">Fatura</option>
                  <option value="iade">İade</option>
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
                  <option value="all">Tümü</option>
                  <option value="crm">CRM</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="ai">AI</option>
                  <option value="kullanici">Kullanıcı</option>
                  <option value="sistem">Sistem</option>
                  <option value="ice_aktar">İçe aktar</option>
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
                  <option value="all">Tümü</option>
                  <option value="onaylandi">Onaylandı</option>
                  <option value="bekliyor">Bekliyor</option>
                  <option value="reddedildi">Reddedildi</option>
                  <option value="riskli">Riskli</option>
                  <option value="arsivlendi">Arşivlendi</option>
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
                    aria-label="Başlangıç tarihi"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <span className="hz-archive-filter-date-sep" aria-hidden>
                    –
                  </span>
                  <input
                    id="hz-archive-d2"
                    type="date"
                    className="hz-archive-filter-input hz-archive-filter-input--date"
                    aria-label="Bitiş tarihi"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
              <div className="hz-archive-filter-field hz-archive-filter-field--user">
                <label className="hz-archive-filter-label" htmlFor="hz-archive-user">
                  Kullanıcı
                </label>
                <input
                  id="hz-archive-user"
                  className="hz-archive-filter-input"
                  placeholder="Sorumlu veya oluşturan"
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
                  title="Filtreleri sıfırla"
                  aria-label="Filtreleri sıfırla"
                  onClick={resetFilters}
                >
                  <IconFilter size={17} />
                </button>
              </div>
            </div>
          </div>

          {ARCHIVE_USE_DEMO_DATA ? (
            <div className="hz-archive-preview-band" role="status">
              Örnek veri modu: arşiv listesi demo kayıtlarıdır; canlı arşiv ve indirme henüz bağlı değildir.
            </div>
          ) : liveLoading ? (
            <div className="hz-archive-preview-band" role="status">
              Arşiv kayıtları yükleniyor.
            </div>
          ) : !liveReady ? (
            <div className="hz-archive-preview-band" role="status">
              Arşiv kayıtları şu anda alınamıyor.
            </div>
          ) : liveMessage ? (
            <div className="hz-archive-preview-band" role="status">
              {liveMessage}
            </div>
          ) : null}

          <div className="hz-archive-list-wrap">
            <div className="hz-archive-list-header" role="row">
              <div role="columnheader">Kayıt</div>
              <div role="columnheader">Cari / Bağlam</div>
              <div role="columnheader">Tür</div>
              <div role="columnheader">Tarih</div>
              <div role="columnheader">Durum</div>
              <div role="columnheader">Sorumlu</div>
              <div role="columnheader">Aksiyon</div>
            </div>
            <div className="hz-archive-list-body">
              {!filtered.length ? (
                <div className="hz-archive-empty" role="status">
                  <p className="hz-archive-empty-title">Kayıt bulunamadı</p>
                  <p className="hz-archive-empty-text">Filtreleri gevşetin veya sıfırlayın.</p>
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
                          pushToast("Kayıt seçildi; detay sağ panelde.");
                        }}
                      >
                        Detay
                      </button>
                      <button
                        type="button"
                        className="hz-archive-act-icon hz-archive-act-icon--labeled"
                        aria-label="İndir"
                        title="İndir"
                        disabled={!!rowDownloadLocks[row.id]}
                        onClick={() => {
                          pushToast("Belge indirme henüz canlı kullanıma bağlı değil.");
                          setRowDownloadLocks((s) => ({ ...s, [row.id]: true }));
                        }}
                      >
                        <IconDownload size={15} />
                      </button>
                      <button
                        type="button"
                        className="hz-archive-act-icon hz-archive-act-icon--labeled"
                        title="Bağlantı"
                        aria-label="Bağlantı"
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

        <aside className="hz-archive-side" aria-label="Arşiv Radarı">
          <div className="hz-archive-side-inner">
            <header className="hz-archive-side-head">
              <h2 className="hz-archive-side-title">Arşiv Radarı</h2>
              <p className="hz-archive-side-sub">Seçili kaydın belge, denetim ve işlem bağlamı.</p>
            </header>
            {!selected ? (
              <div className="hz-archive-empty hz-archive-empty--side" role="status">
                <p className="hz-archive-empty-title">Listeden bir kayıt seçin.</p>
              </div>
            ) : (
              <div className="hz-archive-side-stack">
                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">Kayıt Özeti</h3>
                  <p className="hz-archive-side-strong">{selected.title}</p>
                  <dl className="hz-archive-dl">
                    <div>
                      <dt>Belge / işlem no</dt>
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
                  <h3 className="hz-archive-side-card-title">Bağlantılar</h3>
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
                  <h3 className="hz-archive-side-card-title">Denetim İzi</h3>
                  <dl className="hz-archive-dl">
                    <div>
                      <dt>Oluşturan</dt>
                      <dd>{selected.auditCreatedBy}</dd>
                    </div>
                    <div>
                      <dt>Oluşturma</dt>
                      <dd>
                        {formatArchiveDate(selected.createdAt)} {formatArchiveTime(selected.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt>Son işlem</dt>
                      <dd>{selected.auditLastAction}</dd>
                    </div>
                    <div>
                      <dt>Onay / red</dt>
                      <dd>{selected.auditApprovalInfo}</dd>
                    </div>
                    <div>
                      <dt>IP / cihaz</dt>
                      <dd>{selected.auditIpDevice ?? "—"}</dd>
                    </div>
                  </dl>
                </article>

                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">Belge Bilgisi</h3>
                  <dl className="hz-archive-dl">
                    <div>
                      <dt>Dosya adı</dt>
                      <dd>{selected.fileName ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Tür</dt>
                      <dd>{selected.fileTypeLabel ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Boyut</dt>
                      <dd>{selected.fileSizeLabel ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Saklama</dt>
                      <dd>{selected.retentionYears != null ? `${selected.retentionYears} yıl` : "—"}</dd>
                    </div>
                    <div>
                      <dt>İmza / hash</dt>
                      <dd>{selected.hashPreview ?? "—"}</dd>
                    </div>
                  </dl>
                </article>

                <article className="hz-archive-side-card">
                  <h3 className="hz-archive-side-card-title">Hızlı Aksiyonlar</h3>
                  <div className="hz-archive-side-actions">
                    <button
                      type="button"
                      className="hz-archive-side-btn hz-archive-side-btn--primary"
                      onClick={() => pushToast("Arşiv detay görünümü henüz canlı kullanıma bağlı değil.")}
                    >
                      Detay aç
                    </button>
                    <button
                      type="button"
                      className="hz-archive-side-btn"
                      disabled={!!actionLocks.sideDl}
                      onClick={() => notLiveAction("sideDl", "Belge indirme henüz bağlı değil.")}
                    >
                      <IconDownload size={14} />
                      Belge indir
                    </button>
                    <button type="button" className="hz-archive-side-btn" onClick={() => navigateSafe(selected.relatedLinks[0]?.href ?? "/archive")}>
                      İlgili kayda git
                    </button>
                    <button
                      type="button"
                      className="hz-archive-side-btn"
                      disabled={!!actionLocks.sideAudit}
                      onClick={() => lockAction("sideAudit", "Demo: denetim raporu oluşturuluyor.")}
                    >
                      Denetim raporu
                    </button>
                    <button
                      type="button"
                      className="hz-archive-side-btn"
                      disabled={!!actionLocks.sideNote}
                      onClick={() => notLiveAction("sideNote", "Arşiv notu kaydı henüz bağlı değil.")}
                    >
                      <IconTag size={14} />
                      Arşiv notu ekle
                    </button>
                  </div>
                </article>

                <article className="hz-archive-side-card hz-archive-risk-note">
                  <h3 className="hz-archive-side-card-title">
                    <IconSparkles size={14} />
                    AI / Risk Notu
                  </h3>
                  <p>Bu kayıt yalnızca denetim ve izleme amaçlı özetlenir.</p>
                  <p>AI arşiv kaydını değiştirmez; yalnızca özet ve uyarı üretir.</p>
                </article>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
