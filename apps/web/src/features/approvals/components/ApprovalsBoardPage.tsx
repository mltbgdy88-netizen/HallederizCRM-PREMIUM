"use client";

import {
  IconBanknote,
  IconFileText,
  IconMessageCircle,
  IconRotateCcw,
  IconSend,
  IconTag,
  IconTruck,
  IconWarehouse,
  IconWallet,
  QuickActionIcon
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import type { ReactNode } from "react";
import { Fragment, useState } from "react";

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
  icon: ReactNode;
};

const RISK_LABEL: Record<RiskKey, string> = {
  high: "Yüksek",
  medium: "Orta",
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
    icon: <QuickActionIcon kind="order" size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconWallet size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconTruck size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconFileText size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconRotateCcw size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconMessageCircle size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconWarehouse size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconFileText size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconTag size={15} className="hz-approvals-desk-ico" />
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
    icon: <QuickActionIcon kind="stock" size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconSend size={15} className="hz-approvals-desk-ico" />
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
    icon: <IconBanknote size={15} className="hz-approvals-desk-ico" />
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
  const [openId, setOpenId] = useState<string | null>(null);

  const totalDemoRecords = DEMO_CARDS.length;

  const onApprove = (id: string) => {
    if (approvedIds.has(id)) return;
    setApprovedIds((prev) => new Set(prev).add(id));
    pushToast("Onay kaydı işaretlendi (demo).");
  };

  return (
    <div className="hz-approvals-page hz-approvals-page--desk">
      <div className="hz-approvals-desk-wrap">
        <header className="hz-approvals-desk-bar" role="status">
          <span>12 bekleyen</span>
          <span className="hz-approvals-desk-bar-sep" aria-hidden>
            ·
          </span>
          <span>3 kritik</span>
        </header>

        <div className="hz-approvals-desk-scroll">
          <table className="hz-approvals-desk">
            <thead>
              <tr>
                <th scope="col">Tür</th>
                <th scope="col">Kayıt</th>
                <th scope="col">Cari</th>
                <th scope="col" className="hz-approvals-desk-num">
                  Tutar / özet
                </th>
                <th scope="col">Risk</th>
                <th scope="col" className="hz-approvals-desk-actions">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CARDS.map((card) => {
                const open = openId === card.id;
                return (
                  <Fragment key={card.id}>
                    <tr
                      className={`hz-approvals-desk-row${open ? " hz-approvals-desk-row--open" : ""}`}
                      onClick={() => setOpenId((v) => (v === card.id ? null : card.id))}
                    >
                      <td>
                        <span className="hz-approvals-desk-type">
                          <span className="hz-approvals-desk-type-ico" aria-hidden>
                            {card.icon}
                          </span>
                          {card.categoryLabel}
                        </span>
                      </td>
                      <td className="hz-approvals-desk-mono">{card.docLine}</td>
                      <td>{card.customer}</td>
                      <td className="hz-approvals-desk-num">{card.summaryLine}</td>
                      <td>
                        <span className={riskClass(card.risk)}>{RISK_LABEL[card.risk]}</span>
                      </td>
                      <td className="hz-approvals-desk-actions">
                        <button
                          type="button"
                          className="hz-approvals-desk-go"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenId((v) => (v === card.id ? null : card.id));
                          }}
                        >
                          {open ? "Kapat" : "Aç"}
                        </button>
                        <button
                          type="button"
                          className="hz-approvals-desk-approve"
                          disabled={approvedIds.has(card.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(card.id);
                          }}
                        >
                          Onayla
                        </button>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="hz-approvals-desk-detail-row" aria-expanded>
                        <td colSpan={6}>
                          <div className="hz-approvals-desk-detail">
                            <div className="hz-approvals-desk-detail-grid">
                              <p>
                                <span className="hz-approvals-dd-k">Not</span>
                                {card.description}
                              </p>
                              <p>
                                <span className="hz-approvals-dd-k">Tarih</span>
                                {card.date}
                              </p>
                              <p>
                                <span className="hz-approvals-dd-k">Sorumlu</span>
                                {card.rep}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="hz-approvals-pagination hz-approvals-pagination--desk">
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
  );
}
