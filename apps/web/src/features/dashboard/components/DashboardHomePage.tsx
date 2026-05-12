"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SplitContentLayout } from "@hallederiz/ui";
import { DashboardAiAssistantPanel } from "./DashboardAiAssistantPanel";
import {
  type RowListIcon,
  RowListIconSvg
} from "./dashboard-inline-icons";

type DashboardCard = {
  id: string;
  title: string;
  description: string;
  category: "Operasyon" | "Satış / Cari" | "Finans" | "Stok / Depo" | "İletişim / AI";
  icon: RowListIcon;
  value: string;
  note?: string;
};

const STORAGE_KEY = "hz:dashboard:selected-cards:v1";

const WORK_QUEUE = [
  { id: "delivery", text: "Teslimat onayı bekleyen siparişleri kontrol et.", icon: "clipboard" as const, tone: "delivery" as const },
  { id: "stock", text: "Kritik stok uyarısı gelen ürünleri depoya bildir.", icon: "package" as const, tone: "stock" as const },
  { id: "collection", text: "Tahsilatı geciken cariler için kısa arama planı oluştur.", icon: "wallet" as const, tone: "collection" as const },
  { id: "approval", text: "Onay bekleyen işlemleri kapanıştan önce sırala.", icon: "alert" as const, tone: "approval" as const }
];

const ALL_CARDS: DashboardCard[] = [
  { id: "approvals", title: "Onay Bekleyenler", description: "Onay bekleyen işlem ve belgelerin özeti.", category: "Operasyon", icon: "clipboard", value: "7", note: "İşlem var" },
  { id: "today-priority", title: "Bugün Öncelik Verilecek İşler", description: "Günün en önemli operasyon işleri.", category: "Operasyon", icon: "alert", value: "4", note: "Öncelik" },
  { id: "critical-tasks", title: "Kritik Görevler", description: "Riskli veya gecikmiş görevler.", category: "Operasyon", icon: "alert", value: "3", note: "Yüksek risk" },
  { id: "today-follow", title: "Bugün Takip Edilecekler", description: "Bugün takip isteyen cari ve işler.", category: "Operasyon", icon: "tag", value: "5", note: "Cari bekliyor" },
  { id: "open-work", title: "Son Açık İşler", description: "Henüz kapanmamış güncel operasyon kayıtları.", category: "Operasyon", icon: "fileCheck", value: "12", note: "Açık kayıt" },

  { id: "offers", title: "Teklif Takibi", description: "Açık tekliflerin durumu.", category: "Satış / Cari", icon: "tag", value: "9", note: "Açık teklif" },
  { id: "orders", title: "Sipariş Bekleyenler", description: "İşleme alınmayı bekleyen siparişler.", category: "Satış / Cari", icon: "clipboard", value: "11", note: "Bekleyen sipariş" },
  { id: "customer-risk", title: "Cari Riskleri", description: "Riskli bakiye veya gecikme sinyalleri.", category: "Satış / Cari", icon: "alert", value: "6", note: "Risk sinyali" },
  { id: "customer-balance", title: "Cari Borç / Alacak Özeti", description: "Finansal cari görünümü.", category: "Satış / Cari", icon: "wallet", value: "₺ 1,2M", note: "Net pozisyon" },

  { id: "collections", title: "Tahsilat Bekleyenler", description: "Bekleyen tahsilat ve vadeler.", category: "Finans", icon: "wallet", value: "₺ 256.450", note: "Bugün vade" },
  { id: "overdue", title: "Vadesi Geçen Tahsilatlar", description: "Gecikmiş tahsilatlar.", category: "Finans", icon: "card", value: "₺ 92.300", note: "Gecikmiş" },
  { id: "invoices", title: "Fatura Bekleyenler", description: "Kesilecek veya bekleyen faturalar.", category: "Finans", icon: "fileCheck", value: "14", note: "Belge bekliyor" },
  { id: "returns", title: "İade Talepleri", description: "Onay veya işlem bekleyen iadeler.", category: "Finans", icon: "rotate", value: "4", note: "İade akışı" },

  { id: "stock-risk", title: "Stok Riskleri", description: "Kritik stok ve uyarılar.", category: "Stok / Depo", icon: "package", value: "23", note: "Kritik ürün" },
  { id: "warehouse", title: "Depo Hazırlık", description: "Hazırlık bekleyen depo fişleri.", category: "Stok / Depo", icon: "package", value: "8", note: "Fiş hazırlanacak" },
  { id: "deliveries", title: "Teslimat Bekleyenler", description: "Teslime hazır veya bekleyen işler.", category: "Stok / Depo", icon: "alert", value: "11", note: "Planlanacak" },
  { id: "factory-orders", title: "Fabrika Siparişleri", description: "Tedarikçi/fabrika sipariş takipleri.", category: "Stok / Depo", icon: "clipboard", value: "6", note: "Takipte" },

  { id: "wa", title: "WhatsApp Talepleri", description: "WhatsApp’tan gelen işlem talepleri.", category: "İletişim / AI", icon: "fileCheck", value: "12", note: "Yeni talep" },
  { id: "ai-suggestions", title: "AI Önerileri", description: "AI tarafından önerilen takipler.", category: "İletişim / AI", icon: "tag", value: "5", note: "Öneri var" },
  { id: "ai-approval", title: "Onay Gerektiren AI İşlemleri", description: "İnsan onayı bekleyen AI aksiyonları.", category: "İletişim / AI", icon: "alert", value: "3", note: "Onay gerekli" }
];

const DEFAULT_SELECTED = ["approvals", "collections", "stock-risk", "wa", "warehouse", "deliveries"];

function miniTrendPoints(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h += id.charCodeAt(i);
  const pts: string[] = [];
  for (let i = 0; i <= 8; i += 1) {
    const x = 2 + i * 5;
    const y = 10 - ((h + i * 13) % 6);
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}

export function DashboardHomePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_SELECTED);
  const [draftIds, setDraftIds] = useState<string[]>(DEFAULT_SELECTED);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((id) => ALL_CARDS.some((c) => c.id === id));
      if (valid.length > 0) {
        setSelectedIds(valid);
        setDraftIds(valid);
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setDraftIds(selectedIds);
      setEditorOpen(true);
    };
    window.addEventListener("dashboard:open-card-editor", onOpen);
    return () => window.removeEventListener("dashboard:open-card-editor", onOpen);
  }, [selectedIds]);

  const selectedCards = useMemo(
    () => selectedIds.map((id) => ALL_CARDS.find((c) => c.id === id)).filter((v): v is DashboardCard => Boolean(v)),
    [selectedIds]
  );

  const groupedCards = useMemo(() => {
    const groups: Record<DashboardCard["category"], DashboardCard[]> = {
      "Operasyon": [],
      "Satış / Cari": [],
      "Finans": [],
      "Stok / Depo": [],
      "İletişim / AI": []
    };
    for (const card of ALL_CARDS) {
      groups[card.category].push(card);
    }
    return groups;
  }, []);

  const toggleDraft = (id: string) => {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const saveSelection = () => {
    if (draftIds.length < 1) return;
    setSelectedIds(draftIds);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draftIds));
    } catch {
      // noop
    }
    setEditorOpen(false);
  };

  const cardToneClass = (id: string) => {
    if (id === "approvals") return "is-lavender";
    if (id === "collections") return "is-green";
    if (id === "stock-risk") return "is-orange";
    if (id === "wa") return "is-wa";
    if (id === "warehouse") return "is-indigo";
    if (id === "deliveries") return "is-blue";
    return "is-neutral";
  };

  return (
    <div className="hz-dashboard-page hz-dashboard-page--fit hz-dashboard-page--v2">
      <SplitContentLayout
        main={
          <div className="hz-dash-work-center">
            <section className="hz-dash-work-hero-wrap" aria-label="Sıradaki iş merkezi">
              <article className="hz-dash-work-hero">
                <header className="hz-dash-work-head">
                  <h2>Bugün Öncelik Verilecek İşler</h2>
                </header>
                <ol className="hz-dash-work-list">
                  {WORK_QUEUE.map((item) => (
                    <li key={item.id} className={`hz-dash-work-item hz-dash-work-item--${item.tone}`}>
                      <span className="hz-dash-work-item-ico" aria-hidden>
                        <RowListIconSvg kind={item.icon} size={14} />
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ol>
                <button type="button" className="hz-dash-work-link-btn">
                  Tüm görevleri görüntüle
                </button>
              </article>
              <div className="hz-dash-work-side-stack">
                <article className="hz-dash-work-mini">
                  <header className="hz-dash-work-mini-head">
                    <span className="hz-dash-work-mini-ico" aria-hidden>
                      <RowListIconSvg kind="alert" size={14} />
                    </span>
                    <h3>Kritik Görev</h3>
                  </header>
                  <p className="hz-dash-work-mini-value">3 yüksek risk</p>
                  <Link href="/onaylar" className="hz-dash-work-mini-link">
                    Onaylara git
                  </Link>
                </article>
                <article className="hz-dash-approvals-quick" aria-label="Onaylar hizli erisim">
                  <header className="hz-dash-approvals-quick-head">
                    <h3>Onaylar</h3>
                  </header>
                  <p className="hz-dash-approvals-quick-copy">
                    Bekleyen onaylari, worker/outbox durumunu ve guvenlik sinyallerini izle.
                  </p>
                  <p className="hz-dash-approvals-quick-note">Canli durum Onaylar ekraninda.</p>
                  <Link href="/onaylar" className="hz-dash-approvals-quick-cta">
                    Onaylara Git
                  </Link>
                </article>
                <article className="hz-dash-work-mini">
                  <header className="hz-dash-work-mini-head">
                    <span className="hz-dash-work-mini-ico" aria-hidden>
                      <RowListIconSvg kind="tag" size={14} />
                    </span>
                    <h3>Bugün Takip</h3>
                  </header>
                  <p className="hz-dash-work-mini-value">5 cari bekliyor</p>
                  <button type="button" className="hz-dash-work-mini-link">
                    Carilere git
                  </button>
                </article>
              </div>
            </section>

            <section className="hz-dash-selected-cards" aria-label="Seçili bilgi kartları">
              <header className="hz-dash-work-head hz-dash-work-head--cards">
                <h2>Seçili Bilgi Kartları</h2>
              </header>
              <div className="hz-dash-selected-grid">
                {selectedCards.map((card) => (
                  <article key={card.id} className={`hz-dash-selected-card ${cardToneClass(card.id)}`}>
                    <header className="hz-dash-selected-card-head">
                      <div className="hz-dash-selected-card-top">
                        <span className="hz-dash-selected-card-ico" aria-hidden>
                          <RowListIconSvg kind={card.icon} size={16} />
                        </span>
                        <h3>{card.title}</h3>
                      </div>
                      <button type="button" className="hz-dash-selected-card-more" aria-label={`${card.title} — tümünü gör`}>
                        <span className="hz-dash-selected-card-more-txt">Tümünü gör</span>
                        <svg className="hz-dash-selected-card-more-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </header>
                    <p className="hz-dash-selected-card-value">{card.value}</p>
                    <p className="hz-dash-selected-card-note">{card.note ?? card.description}</p>
                    <div className="hz-dash-selected-card-trend" aria-hidden>
                      <svg viewBox="0 0 42 14" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={miniTrendPoints(card.id)}
                        />
                      </svg>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {editorOpen ? (
              <div className="hz-dash-card-editor-overlay" role="dialog" aria-modal="true" aria-label="Kartları Düzenle">
                <div className="hz-dash-card-editor-modal">
                  <header className="hz-dash-card-editor-head">
                    <div>
                      <h2>Kartları Düzenle</h2>
                      <p>Gösterge panelinde görmek istediğiniz bilgi kartlarını seçin.</p>
                    </div>
                    <button type="button" className="hz-dash-card-editor-close" aria-label="Kapat" onClick={() => setEditorOpen(false)}>
                      ×
                    </button>
                  </header>

                  <div className="hz-dash-card-editor-body">
                    <section className="hz-dash-card-editor-options">
                      {(Object.keys(groupedCards) as Array<DashboardCard["category"]>).map((group) => (
                        <div key={group} className="hz-dash-card-editor-group">
                          <h3>{group}</h3>
                          <ul>
                            {groupedCards[group].map((card) => (
                              <li key={card.id}>
                                <label className="hz-dash-card-option">
                                  <span className="hz-dash-card-option-main">
                                    <span className="hz-dash-card-option-ico" aria-hidden>
                                      <RowListIconSvg kind={card.icon} size={15} />
                                    </span>
                                    <span>
                                      <strong>{card.title}</strong>
                                      <small>{card.description}</small>
                                    </span>
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={draftIds.includes(card.id)}
                                    onChange={() => toggleDraft(card.id)}
                                    aria-label={`${card.title} kartını seç`}
                                  />
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </section>

                    <aside className="hz-dash-card-editor-preview">
                      <h3>Seçili Kartlar</h3>
                      <p>Bu kartlar gösterge panelinde görünecek.</p>
                      <ol>
                        {draftIds.map((id) => {
                          const card = ALL_CARDS.find((item) => item.id === id);
                          if (!card) return null;
                          return (
                            <li key={id}>
                              <span className="hz-dash-card-order-ico">
                                <RowListIconSvg kind={card.icon} size={14} />
                              </span>
                              <span>{card.title}</span>
                            </li>
                          );
                        })}
                      </ol>
                    </aside>
                  </div>

                  <footer className="hz-dash-card-editor-actions">
                    <button type="button" className="hz-dash-editor-btn hz-dash-editor-btn--ghost" onClick={() => setEditorOpen(false)}>
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      className="hz-dash-editor-btn hz-dash-editor-btn--primary"
                      onClick={saveSelection}
                      disabled={draftIds.length < 1}
                    >
                      Kaydet
                    </button>
                  </footer>
                </div>
              </div>
            ) : null}
          </div>
        }
        side={<DashboardAiAssistantPanel compact />}
      />
    </div>
  );
}
