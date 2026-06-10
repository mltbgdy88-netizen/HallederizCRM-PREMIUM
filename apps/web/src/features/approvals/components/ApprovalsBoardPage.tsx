"use client";

import {
  IconAlertTriangle,
  IconBanknote,
  IconBot,
  IconFileSearch,
  IconFileText,
  IconMessageCircle,
  IconArrowRightCircle,
  IconRotateCcw,
  IconSend,
  IconShieldAlert,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconTruck,
  IconWarehouse,
  IconWallet,
  QuickActionIcon
} from "../../dashboard/components/dashboard-inline-icons";
import { LoadingState } from "@hallederiz/ui";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import type { ApprovalsBoardCard, ApprovalsBoardRiskKey } from "../types/approvals-board-card";
import { useApprovalsFromApi } from "../hooks/use-approvals-from-api";
import { mapApprovalToBoardCard } from "../utils/map-approval-to-board-card";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

const nfTry = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });

const RISK_LABEL: Record<ApprovalsBoardRiskKey, string> = {
  high: "Yüksek Risk",
  medium: "Orta Risk",
  critical: "Kritik",
  normal: "Normal"
};

const DEMO_CARDS: ApprovalsBoardCard[] = [
  {
    id: "1",
    categoryLabel: "SATI�?",
    risk: "high",
    customer: "Delta A.�?.",
    docLine: "Sipariş #SO-2026-0148",
    summaryLine: nfTry.format(485750),
    description: "Yüksek tutarlı sipariş",
    date: "03.05.2026",
    rep: "Ayşe Kaya",
    accent: "#583bff",
    icon: <QuickActionIcon kind="order" size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "2",
    categoryLabel: "TAHSİLAT",
    risk: "medium",
    customer: "Caner Demir",
    docLine: "Tahsilat #TA-2026-0097",
    summaryLine: nfTry.format(48750),
    description: "Tahsilat kaydı",
    date: "03.05.2026",
    rep: "Mehmet Yılmaz",
    accent: "#16a34a",
    icon: <IconWallet size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "3",
    categoryLabel: "TESLİMAT",
    risk: "critical",
    customer: "Yıldız İnşaat",
    docLine: "Teslimat #TS-2026-0063",
    summaryLine: nfTry.format(25600),
    description: "Eksik tahsilatlı teslim",
    date: "03.05.2026",
    rep: "Zeynep Ak",
    accent: "#f59e0b",
    icon: <IconTruck size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "4",
    categoryLabel: "FATURA",
    risk: "normal",
    customer: "Ege Un A.�?.",
    docLine: "Fatura #FA-2026-0112",
    summaryLine: nfTry.format(120000),
    description: "Fatura kesimi",
    date: "03.05.2026",
    rep: "Mehmet Yılmaz",
    accent: "#3b82f6",
    icon: <IconFileText size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "5",
    categoryLabel: "İADE",
    risk: "medium",
    customer: "GHI Mobilya",
    docLine: "İade Talebi #IA-2026-0031",
    summaryLine: `2 ürün / ${nfTry.format(6450)}`,
    description: "İade talebi",
    date: "03.05.2026",
    rep: "Ayşe Kaya",
    accent: "#ef4444",
    icon: <IconRotateCcw size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "6",
    categoryLabel: "WHATSAPP BELGE",
    risk: "normal",
    customer: "Liman Gıda",
    docLine: "Belge Gönderimi",
    summaryLine: "Teklif PDF",
    description: "Belge gönderimi",
    date: "03.05.2026",
    rep: "Mehmet Yılmaz",
    accent: "#583bff",
    icon: <IconMessageCircle size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "7",
    categoryLabel: "DEPO HAREKETİ",
    risk: "normal",
    customer: "Kuzey Lojistik",
    docLine: "SO-2026-0476",
    summaryLine: "Depo hazır işareti",
    description: "Depo hazırlık onayı",
    date: "03.05.2026",
    rep: "Zeynep Ak",
    accent: "#0891b2",
    icon: <IconWarehouse size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "8",
    categoryLabel: "AI PROPOSAL",
    risk: "medium",
    customer: "Nova Gıda",
    docLine: "AI Plan Onayı",
    summaryLine: "3 işlem önerisi",
    description: "AI proposal onayı",
    date: "03.05.2026",
    rep: "Mehmet Yılmaz",
    accent: "#7c3aed",
    icon: <IconSparkles size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "9",
    categoryLabel: "FİYAT REVİZYONU",
    risk: "high",
    customer: "ABC Ltd.",
    docLine: "FR-2026-0088",
    summaryLine: nfTry.format(18400),
    description: "Fiyat revizyon talebi",
    date: "03.05.2026",
    rep: "Ayşe Kaya",
    accent: "#7c3aed",
    icon: <IconTag size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "10",
    categoryLabel: "STOK DÜZELTME",
    risk: "critical",
    customer: "Merkez Depo",
    docLine: "SK-ADJ-014",
    summaryLine: "4 SKU",
    description: "Stok düzeltme onayı",
    date: "03.05.2026",
    rep: "Zeynep Ak",
    accent: "#ea580c",
    icon: <QuickActionIcon kind="stock" size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "11",
    categoryLabel: "BELGE GÖNDERİMİ",
    risk: "normal",
    customer: "Delta A.�?.",
    docLine: "BG-2026-021",
    summaryLine: "Sevk belgesi",
    description: "Belge çıkışı",
    date: "03.05.2026",
    rep: "Mehmet Yılmaz",
    accent: "#3b82f6",
    icon: <IconSend size={16} className="hz-approvals-card-ico-svg" />
  },
  {
    id: "12",
    categoryLabel: "TAHSİLAT PLANI",
    risk: "medium",
    customer: "Nova Gıda",
    docLine: "TP-2026-003",
    summaryLine: nfTry.format(71250),
    description: "Planlı tahsilat",
    date: "03.05.2026",
    rep: "Mehmet Yılmaz",
    accent: "#16a34a",
    icon: <IconBanknote size={16} className="hz-approvals-card-ico-svg" />
  }
];

type FilterKey = "all" | "sales" | "collection" | "delivery" | "return" | "invoice" | "whatsapp" | "ai" | "highRisk";

function riskClass(r: ApprovalsBoardRiskKey): string {
  if (r === "high" || r === "critical") return "hz-approvals-risk hz-approvals-risk--danger";
  if (r === "medium") return "hz-approvals-risk hz-approvals-risk--warn";
  return "hz-approvals-risk hz-approvals-risk--info";
}

function matchesFilter(card: ApprovalsBoardCard, f: FilterKey): boolean {
  if (f === "all") return true;
  if (f === "sales") return card.categoryLabel === "SATI�?";
  if (f === "collection") return card.categoryLabel === "TAHSİLAT" || card.categoryLabel === "TAHSİLAT PLANI";
  if (f === "delivery") return card.categoryLabel === "TESLİMAT";
  if (f === "return") return card.categoryLabel === "İADE";
  if (f === "invoice") return card.categoryLabel === "FATURA";
  if (f === "whatsapp") return card.categoryLabel === "WHATSAPP BELGE";
  if (f === "ai") return card.categoryLabel === "AI PROPOSAL";
  if (f === "highRisk") return card.risk === "high" || card.risk === "critical";
  return true;
}

const FILTER_CHIPS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "sales", label: "Satış" },
  { id: "collection", label: "Tahsilat" },
  { id: "delivery", label: "Teslimat" },
  { id: "return", label: "İade" },
  { id: "invoice", label: "Fatura" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "ai", label: "AI Proposal" },
  { id: "highRisk", label: "Yüksek Risk" }
];

function rangePages(totalPages: number, current: number): (number | "gap")[] {
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const want = new Set([1, totalPages, current, current - 1, current + 1]);
  for (let n = 2; n <= 4; n += 1) want.add(n);
  for (let n = totalPages - 3; n < totalPages; n += 1) want.add(n);
  const sorted = Array.from(want).filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) {
      out.push("gap");
    }
    out.push(n);
    prev = n;
  }
  return out;
}

export function ApprovalsBoardPage() {
  const { pushToast } = useToast();
  const useDemoBoard = dataSourceConfig.useDemoData;
  const { items: approvalItems, loading: apiLoading, error: apiError, reload } = useApprovalsFromApi(!useDemoBoard);

  const apiCards = useMemo(() => approvalItems.map(mapApprovalToBoardCard), [approvalItems]);
  const sourceCards = useDemoBoard ? DEMO_CARDS : apiCards;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredCards = useMemo(() => sourceCards.filter((c) => matchesFilter(c, filter)), [sourceCards, filter]);
  const totalRecords = filteredCards.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pagedCards = useMemo(
    () => filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredCards, currentPage, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [filter, useDemoBoard]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const kpi = useMemo(() => {
    if (useDemoBoard) {
      return { pending: 12, critical: 3, approvedToday: 8, rejected: 2 };
    }
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const pendingItems = approvalItems.filter((a) => a.status === "pending");
    return {
      pending: pendingItems.length,
      critical: pendingItems.filter((a) => a.type === "delivery_payment_missing" || a.type === "order_high_value").length,
      approvedToday: approvalItems.filter(
        (a) =>
          a.status === "approved" &&
          Boolean(a.decidedAt) &&
          !Number.isNaN(new Date(a.decidedAt as string).getTime()) &&
          new Date(a.decidedAt as string) >= start
      ).length,
      rejected: approvalItems.filter((a) => a.status === "rejected").length
    };
  }, [useDemoBoard, approvalItems]);

  const pageButtons = useMemo(() => rangePages(totalPages, currentPage), [totalPages, currentPage]);

  const approvalPending = (id: string) => approvalItems.find((a) => a.id === id)?.status === "pending";

  const onCardActivate = () => {
    pushToast("Detay modalı bir sonraki aşamada açılacak.");
  };

  const onApprove = async (id: string) => {
    if (useDemoBoard) {
      if (approvedIds.has(id)) return;
      setApprovedIds((prev) => new Set(prev).add(id));
      pushToast("Onay kaydı işaretlendi (demo).");
      return;
    }
    if (!approvalPending(id)) return;
    try {
      await sdk.approvals.approve(id);
      pushToast("Onay kaydı API üzerinden güncellendi.");
      reload();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Onay isteği başarısız");
    }
  };

  return (
    <div className="hz-approvals-page">
      <div className="hz-approvals-layout">
        <div className="hz-approvals-main">
          <div className="hz-approvals-main-surface">
            <div className="hz-approvals-page-top">
              <header className="hz-approvals-hero">
                <div className="hz-approvals-hero-left">
                  <span className="hz-approvals-hero-ico" aria-hidden>
                    <IconShieldCheck size={22} className="hz-approvals-card-ico-svg" />
                  </span>
                  <div>
                    <h1 className="hz-approvals-hero-title">Onaylar</h1>
                    <p className="hz-approvals-hero-sub">Riskli işlemler, AI proposal talepleri ve kritik mutation onayları.</p>
                  </div>
                </div>
                <span className="hz-approvals-hero-hint">
                  {useDemoBoard ? "Kart tıklanınca detay modalı açılacak" : "Liste operations API (/approvals) üzerinden yüklenir."}
                </span>
              </header>

              <div className="hz-approvals-kpi-row" aria-label="Onay özeti">
                <article className="hz-approvals-kpi hz-approvals-kpi--primary">
                  <span className="hz-approvals-kpi-label">Bekleyen Onay</span>
                  <span className="hz-approvals-kpi-value">{kpi.pending}</span>
                </article>
                <article className="hz-approvals-kpi hz-approvals-kpi--danger">
                  <span className="hz-approvals-kpi-label">Kritik Risk</span>
                  <span className="hz-approvals-kpi-value">{kpi.critical}</span>
                  <span className="hz-approvals-kpi-meta">Yüksek riskli</span>
                </article>
                <article className="hz-approvals-kpi hz-approvals-kpi--success">
                  <span className="hz-approvals-kpi-label">Bugün Onaylanan</span>
                  <span className="hz-approvals-kpi-value">{kpi.approvedToday}</span>
                  <span className="hz-approvals-kpi-meta">Başarıyla tamamlandı</span>
                </article>
                <article className="hz-approvals-kpi hz-approvals-kpi--muted">
                  <span className="hz-approvals-kpi-label">Reddedilen</span>
                  <span className="hz-approvals-kpi-value">{kpi.rejected}</span>
                  <span className="hz-approvals-kpi-meta">Kontrol geçmişi</span>
                </article>
              </div>

              <div className="hz-approvals-chip-toolbar">
                <div className="hz-approvals-chip-row" role="toolbar" aria-label="Filtreler">
                  {FILTER_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className={`hz-approvals-chip${filter === chip.id ? " hz-approvals-chip--active" : ""}`}
                      onClick={() => setFilter(chip.id)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="hz-approvals-filter-btn"
                  onClick={() => pushToast(useDemoBoard ? "Filtre paneli (demo)." : "Gelişmiş filtre paneli yakında.")}
                  aria-label="Filtrele"
                >
                  Filtrele
                </button>
              </div>

              {!useDemoBoard && apiError ? (
                <div className="hz-approvals-error-band" role="alert">
                  <span>{apiError}</span>
                  <button type="button" className="hz-approvals-filter-btn" onClick={() => reload()}>
                    Tekrar dene
                  </button>
                </div>
              ) : null}
              {!useDemoBoard && !apiLoading && !apiError ? (
                <div className="hz-approvals-api-band" role="status">
                  Canlı veri: onay kartları API yanıtına göre oluşturulur; onay mutation backend policy zincirine bağlıdır.
                </div>
              ) : null}
            </div>

            <div className="hz-approvals-grid-wrap">
              {!useDemoBoard && apiLoading ? (
                <LoadingState title="Onaylar yükleniyor" message="API üzerinden bekleyen kayıtlar alınıyor." />
              ) : (
                <div className="hz-approvals-grid">
                  {pagedCards.length === 0 ? (
                    <div className="hz-approvals-empty-state" role="status">
                      <p className="hz-approvals-empty-title">{apiError ? "Liste yüklenemedi" : "Gösterilecek onay yok"}</p>
                      <p className="hz-approvals-empty-text">
                        {apiError
                          ? "Bağlantıyı ve oturum bilgilerini kontrol edip tekrar deneyin."
                          : useDemoBoard
                            ? "Filtreleri değiştirerek tekrar deneyin."
                            : "Filtreleri sıfırlayın veya API tarafında bekleyen onay oluşturulduğunda kayıtlar burada listelenir."}
                      </p>
                    </div>
                  ) : (
                    pagedCards.map((card) => (
                      <article
                        key={card.id}
                        className="hz-approvals-card"
                        style={{ "--hz-ap-accent": card.accent } as CSSProperties}
                        onClick={onCardActivate}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onCardActivate();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="hz-approvals-card-body">
                          <div className="hz-approvals-card-top">
                            <div className="hz-approvals-card-ico">{card.icon}</div>
                            <span className="hz-approvals-cat">{card.categoryLabel}</span>
                            <span className={riskClass(card.risk)}>{RISK_LABEL[card.risk]}</span>
                          </div>
                          <div className="hz-approvals-card-mid">
                            <p className="hz-approvals-cust">{card.customer}</p>
                            <p className="hz-approvals-doc">{card.docLine}</p>
                            <p className="hz-approvals-sum">{card.summaryLine}</p>
                          </div>
                          <div className="hz-approvals-meta">
                            <span>{card.date}</span>
                            <span>{card.rep}</span>
                          </div>
                        </div>
                        <div className="hz-approvals-card-actions">
                          <button
                            type="button"
                            className="hz-approvals-btn hz-approvals-btn--ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              pushToast("Detay modalı hazırlanıyor.");
                            }}
                          >
                            Detaylar
                          </button>
                          <button
                            type="button"
                            className="hz-approvals-btn hz-approvals-btn--primary"
                            disabled={useDemoBoard ? approvedIds.has(card.id) : !approvalPending(card.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              void onApprove(card.id);
                            }}
                          >
                            Onayla
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}
            </div>

            <footer className="hz-approvals-pagination">
              <span className="hz-approvals-page-total">Toplam {totalRecords} kayıt</span>
              <div className="hz-approvals-page-nav">
                <button
                  type="button"
                  className="hz-approvals-page-arrow"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Önceki sayfa"
                >
                  ‹
                </button>
                {pageButtons.map((n, idx) =>
                  n === "gap" ? (
                    <span key={`gap-${idx}`} className="hz-approvals-page-ellipsis" aria-hidden>
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      className={`hz-approvals-page-num ${currentPage === n ? "hz-approvals-page-num--active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="hz-approvals-page-arrow"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Sonraki sayfa"
                >
                  ›
                </button>
              </div>
              <label className="hz-approvals-page-size">
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Sayfa başına kayıt">
                  <option value={12}>12 / sayfa</option>
                  <option value={24}>24 / sayfa</option>
                  <option value={48}>48 / sayfa</option>
                </select>
              </label>
            </footer>
          </div>
        </div>

        <aside className="hz-approvals-side hz-approvals-assistant" aria-label="Onay Asistanı">
          <header className="hz-approvals-assistant-head">
            <h2 className="hz-approvals-assistant-title">Onay Asistanı</h2>
            <p className="hz-approvals-assistant-lead">Riskli onaylar için öneri ve öncelik özeti.</p>
          </header>

          <section className="hz-approvals-assistant-card hz-approvals-assistant-card--rules" aria-label="Onay kural seti">
            <div className="hz-approvals-assistant-card-head">
              <span className="hz-approvals-assistant-card-ico hz-approvals-assistant-card-ico--neutral" aria-hidden>
                <IconFileText size={17} />
              </span>
              <h3 className="hz-approvals-assistant-card-title">Onay Kural Seti</h3>
            </div>
            <ul className="hz-approvals-rule-list">
              <li>
                <span>Satış</span>
                <code className="hz-approvals-rule-code">create_order</code>
              </li>
              <li>
                <span>Tahsilat</span>
                <code className="hz-approvals-rule-code">create_payment</code>
              </li>
              <li>
                <span>AI Proposal</span>
                <code className="hz-approvals-rule-code">ai_plan_approval</code>
              </li>
              <li>
                <span>Belge WhatsApp</span>
                <code className="hz-approvals-rule-code">send_document_whatsapp</code>
              </li>
            </ul>
          </section>

          <section className="hz-approvals-assistant-card hz-approvals-assistant-card--warn">
            <div className="hz-approvals-assistant-card-head">
              <span className="hz-approvals-assistant-card-ico" aria-hidden>
                <IconShieldAlert size={17} />
              </span>
              <h3 className="hz-approvals-assistant-card-title">Öncelikli Uyarılar</h3>
            </div>
            <ul className="hz-approvals-assistant-list">
              {useDemoBoard ? (
                <>
                  <li>3 yüksek riskli satış onayı bekliyor.</li>
                  <li>1 teslimatta eksik tahsilat riski.</li>
                  <li>WhatsApp belgelerinde cari eşleşmesini kontrol edin.</li>
                </>
              ) : (
                <>
                  <li>
                    {kpi.critical > 0
                      ? `${kpi.critical} kritik veya yüksek tutarlı bekleyen onay.`
                      : "Kritik öncelikli bekleyen onay bulunmuyor."}
                  </li>
                  <li>{kpi.pending > 0 ? `${kpi.pending} bekleyen onay kuyrukta.` : "Bekleyen onay kuyruğu boş."}</li>
                  <li>Liste gerçek zamanlı API verisine göre güncellenir; detay ve red akışı bir sonraki iterasyonda tamamlanacak.</li>
                </>
              )}
            </ul>
          </section>

          <section className="hz-approvals-assistant-card hz-approvals-assistant-card--ai">
            <div className="hz-approvals-assistant-card-head">
              <span className="hz-approvals-assistant-card-ico hz-approvals-assistant-card-ico--ai" aria-hidden>
                <IconSparkles size={17} />
              </span>
              <h3 className="hz-approvals-assistant-card-title">AI Önerileri</h3>
              <span className="hz-approvals-assistant-ai-badge" aria-hidden>
                <IconBot size={14} />
              </span>
            </div>
            <ul className="hz-approvals-assistant-list">
              <li>Önce yüksek tutarlı satışları inceleyin.</li>
              <li>Teslimat onaylarında cari bakiyeyi kontrol edin.</li>
              <li>AI proposal planını detaydan onaylayın.</li>
            </ul>
          </section>

          <section className="hz-approvals-assistant-card hz-approvals-assistant-card--metrics">
            <div className="hz-approvals-assistant-card-head">
              <span className="hz-approvals-assistant-card-ico" aria-hidden>
                <IconAlertTriangle size={17} />
              </span>
              <h3 className="hz-approvals-assistant-card-title">Bugünkü İş Yükü</h3>
            </div>
            <ul className="hz-approvals-metrics">
              <li>
                <span className="hz-approvals-metrics-label">Bekleyen</span>
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--primary">{kpi.pending}</span>
              </li>
              <li>
                <span className="hz-approvals-metrics-label">Kritik</span>
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--danger">{kpi.critical}</span>
              </li>
              <li>
                <span className="hz-approvals-metrics-label">Tahsilat bağlantılı</span>
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--success">{useDemoBoard ? 2 : "—"}</span>
              </li>
              <li>
                <span className="hz-approvals-metrics-label">Belge gönderimi</span>
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--info">{useDemoBoard ? 1 : "—"}</span>
              </li>
            </ul>
          </section>

          <section className="hz-approvals-assistant-card hz-approvals-assistant-card--next">
            <div className="hz-approvals-assistant-card-head">
              <span className="hz-approvals-assistant-card-ico hz-approvals-assistant-card-ico--next" aria-hidden>
                <IconFileSearch size={17} />
              </span>
              <h3 className="hz-approvals-assistant-card-title">Sonraki Adım</h3>
              <span className="hz-approvals-assistant-next-ico" aria-hidden>
                <IconArrowRightCircle size={16} />
              </span>
            </div>
            <ul className="hz-approvals-assistant-list hz-approvals-assistant-list--compact">
              <li>{useDemoBoard ? "Kart tıklanınca detay modalı açılacak." : "Kartlar API'deki onay kayıtlarından üretilir; detay modalı bir sonraki iterasyonda açılacak."}</li>
              <li>Modalda risk, belge ve audit; Onayla/Reddet bağlanacak.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

