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
  IconSparkles,
  IconTag,
  IconTruck,
  IconWarehouse,
  IconWallet,
  QuickActionIcon
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";

const nfTry = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });

type RiskKey = "high" | "medium" | "critical" | "normal";

type DemoCard = {
  id: string;
  categoryLabel: string;
  risk: RiskKey;
  customer: string;
  docLine: string;
  summaryLine: string;
  description: string;
  date: string;
  rep: string;
  accent: string;
  icon: ReactNode;
};

const RISK_LABEL: Record<RiskKey, string> = {
  high: "Yüksek Risk",
  medium: "Orta Risk",
  critical: "Kritik",
  normal: "Normal"
};

const DEMO_CARDS: DemoCard[] = [
  {
    id: "1",
    categoryLabel: "SATIŞ",
    risk: "high",
    customer: "Delta A.Ş.",
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
    customer: "Ege Un A.Ş.",
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
    customer: "Delta A.Ş.",
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

function riskClass(r: RiskKey): string {
  if (r === "high" || r === "critical") return "hz-approvals-risk hz-approvals-risk--danger";
  if (r === "medium") return "hz-approvals-risk hz-approvals-risk--warn";
  return "hz-approvals-risk hz-approvals-risk--info";
}

export function ApprovalsBoardPage() {
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(() => new Set());

  const totalDemoRecords = DEMO_CARDS.length;

  const onCardActivate = () => {
    pushToast("Detay modalı bir sonraki aşamada açılacak.");
  };

  const onApprove = (id: string) => {
    if (approvedIds.has(id)) return;
    setApprovedIds((prev) => new Set(prev).add(id));
    pushToast("Onay kaydı işaretlendi (demo).");
  };

  return (
    <div className="hz-approvals-page">
      <div className="hz-approvals-layout">
        <div className="hz-approvals-main">
          <div className="hz-approvals-main-surface">
            <div className="hz-approvals-grid-wrap">
              <div className="hz-approvals-grid">
                {DEMO_CARDS.map((card) => (
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
                        disabled={approvedIds.has(card.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove(card.id);
                        }}
                      >
                        Onayla
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <footer className="hz-approvals-pagination">
              <span className="hz-approvals-page-total">Toplam {totalDemoRecords} kayıt</span>
              <div className="hz-approvals-page-nav">
                <button type="button" className="hz-approvals-page-arrow" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Önceki sayfa">
                  ‹
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`hz-approvals-page-num ${page === n ? "hz-approvals-page-num--active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" className="hz-approvals-page-arrow" disabled={page >= 3} onClick={() => setPage((p) => Math.min(3, p + 1))} aria-label="Sonraki sayfa">
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

          <section className="hz-approvals-assistant-card hz-approvals-assistant-card--warn">
            <div className="hz-approvals-assistant-card-head">
              <span className="hz-approvals-assistant-card-ico" aria-hidden>
                <IconShieldAlert size={17} />
              </span>
              <h3 className="hz-approvals-assistant-card-title">Öncelikli Uyarılar</h3>
            </div>
            <ul className="hz-approvals-assistant-list">
              <li>3 yüksek riskli satış onayı bekliyor.</li>
              <li>1 teslimatta eksik tahsilat riski.</li>
              <li>WhatsApp belgelerinde cari eşleşmesini kontrol edin.</li>
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
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--primary">12</span>
              </li>
              <li>
                <span className="hz-approvals-metrics-label">Kritik</span>
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--danger">3</span>
              </li>
              <li>
                <span className="hz-approvals-metrics-label">Tahsilat bağlantılı</span>
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--success">2</span>
              </li>
              <li>
                <span className="hz-approvals-metrics-label">Belge gönderimi</span>
                <span className="hz-approvals-metrics-badge hz-approvals-metrics-badge--info">1</span>
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
              <li>Kart tıklanınca detay modalı açılacak.</li>
              <li>Modalda risk, belge ve audit; Onayla/Reddet bağlanacak.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
