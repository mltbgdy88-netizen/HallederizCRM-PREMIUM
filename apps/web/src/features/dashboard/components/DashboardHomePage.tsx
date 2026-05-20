"use client";

import Link from "next/link";
import { MetricCard, SplitContentLayout, UiButton, UiModal } from "@hallederiz/ui";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { DashboardAiAssistantPanel } from "./DashboardAiAssistantPanel";
import {
  type RowListIcon,
  RowListIconSvg
} from "./dashboard-inline-icons";
import { getDashboardHomeSnapshot } from "../queries/get-dashboard-home-snapshot";
import { getDashboardLiveSnapshot } from "../queries/get-dashboard-live-snapshot";
import {
  DASHBOARD_CARD_HREF,
  EMPTY_DASHBOARD_HOME_SNAPSHOT,
  type DashboardCardId,
  type DashboardHomeSnapshot
} from "../utils/build-dashboard-home-snapshot";

type DashboardCard = {
  id: DashboardCardId;
  title: string;
  description: string;
  category: "Operasyon" | "Satış / Cari" | "Finans" | "Stok / Depo" | "İletişim / AI";
  icon: RowListIcon;
  demoValue: string;
  demoNote?: string;
};

const STORAGE_KEY = "hz:dashboard:selected-cards:v1";

const DEMO_WORK_QUEUE = [
  { id: "delivery", text: "Teslimat onayı bekleyen siparişleri kontrol edin.", icon: "clipboard" as const, tone: "delivery" as const, href: "/siparisler" },
  { id: "stock", text: "Kritik stok uyarısı gelen ürünleri depoya bildirin.", icon: "package" as const, tone: "stock" as const, href: "/stok" },
  { id: "collection", text: "Tahsilatı geciken cariler için kısa arama planı oluşturun.", icon: "wallet" as const, tone: "collection" as const, href: "/tahsilatlar" },
  { id: "approval", text: "Onay bekleyen işlemleri kapanıştan önce sıralayın.", icon: "alert" as const, tone: "approval" as const, href: "/onaylar" }
];

const ALL_CARDS: DashboardCard[] = [
  { id: "approvals", title: "Onay Bekleyenler", description: "Onay bekleyen işlem ve belgelerin özeti.", category: "Operasyon", icon: "clipboard", demoValue: "7", demoNote: "İşlem var" },
  { id: "today-priority", title: "Bugün Öncelik Verilecek İşler", description: "Günün en önemli operasyon işleri.", category: "Operasyon", icon: "alert", demoValue: "4", demoNote: "Öncelik" },
  { id: "critical-tasks", title: "Kritik Görevler", description: "Riskli veya gecikmiş görevler.", category: "Operasyon", icon: "alert", demoValue: "3", demoNote: "Yüksek risk" },
  { id: "today-follow", title: "Bugün Takip Edilecekler", description: "Bugün takip isteyen cari ve işler.", category: "Operasyon", icon: "tag", demoValue: "5", demoNote: "Cari bekliyor" },
  { id: "open-work", title: "Son Açık İşler", description: "Henüz kapanmamış güncel operasyon kayıtları.", category: "Operasyon", icon: "fileCheck", demoValue: "12", demoNote: "Açık kayıt" },
  { id: "offers", title: "Teklif Takibi", description: "Açık tekliflerin durumu.", category: "Satış / Cari", icon: "tag", demoValue: "9", demoNote: "Açık teklif" },
  { id: "orders", title: "Sipariş Bekleyenler", description: "İşleme alınmayı bekleyen siparişler.", category: "Satış / Cari", icon: "clipboard", demoValue: "11", demoNote: "Bekleyen sipariş" },
  { id: "customer-risk", title: "Cari Riskleri", description: "Riskli bakiye veya gecikme sinyalleri.", category: "Satış / Cari", icon: "alert", demoValue: "6", demoNote: "Risk sinyali" },
  { id: "customer-balance", title: "Cari Borç / Alacak Özeti", description: "Finansal cari görünümü.", category: "Satış / Cari", icon: "wallet", demoValue: "—", demoNote: "Canlı özet bekleniyor" },
  { id: "collections", title: "Tahsilat Bekleyenler", description: "Bekleyen tahsilat ve vadeler.", category: "Finans", icon: "wallet", demoValue: "—", demoNote: "Operasyon özeti" },
  { id: "overdue", title: "Vadesi Geçen Tahsilatlar", description: "Gecikmiş tahsilatlar.", category: "Finans", icon: "card", demoValue: "—", demoNote: "Canlı özet bekleniyor" },
  { id: "invoices", title: "Fatura Bekleyenler", description: "Kesilecek veya bekleyen faturalar.", category: "Finans", icon: "fileCheck", demoValue: "14", demoNote: "Belge bekliyor" },
  { id: "returns", title: "İade Talepleri", description: "Onay veya işlem bekleyen iadeler.", category: "Finans", icon: "rotate", demoValue: "4", demoNote: "İade akışı" },
  { id: "stock-risk", title: "Stok Riskleri", description: "Kritik stok ve uyarılar.", category: "Stok / Depo", icon: "package", demoValue: "23", demoNote: "Kritik ürün" },
  { id: "warehouse", title: "Depo Hazırlık", description: "Hazırlık bekleyen depo fişleri.", category: "Stok / Depo", icon: "package", demoValue: "8", demoNote: "Fiş hazırlanacak" },
  { id: "deliveries", title: "Teslimat Bekleyenler", description: "Teslime hazır veya bekleyen işler.", category: "Stok / Depo", icon: "alert", demoValue: "11", demoNote: "Planlanacak" },
  { id: "factory-orders", title: "Fabrika Siparişleri", description: "Tedarikçi/fabrika sipariş takipleri.", category: "Stok / Depo", icon: "clipboard", demoValue: "6", demoNote: "Takipte" },
  { id: "wa", title: "WhatsApp Talepleri", description: "WhatsApp’tan gelen işlem talepleri.", category: "İletişim / AI", icon: "fileCheck", demoValue: "—", demoNote: "Bağlantı bekleniyor" },
  { id: "ai-suggestions", title: "AI Önerileri", description: "AI tarafından önerilen takipler.", category: "İletişim / AI", icon: "tag", demoValue: "5", demoNote: "Öneri" },
  { id: "ai-approval", title: "Onay Gerektiren AI İşlemleri", description: "İnsan onayı bekleyen AI aksiyonları.", category: "İletişim / AI", icon: "alert", demoValue: "3", demoNote: "Onay gerekli" }
];

const DEFAULT_SELECTED: DashboardCardId[] = ["approvals", "collections", "stock-risk", "wa", "warehouse", "deliveries"];

const QUICK_ACTIONS = [
  { href: "/cariler/yeni", label: "Yeni cari" },
  { href: "/hizli-islem", label: "Hızlı işlem" },
  { href: "/teklifler/yeni", label: "Yeni teklif" },
  { href: "/siparisler/yeni", label: "Yeni sipariş" },
  { href: "/tahsilatlar/yeni", label: "Tahsilat" },
  { href: "/belgeler", label: "Belgeler" },
  { href: "/whatsapp", label: "WhatsApp" },
  { href: "/stok", label: "Stok" },
  { href: "/onaylar", label: "Onaylar" }
] as const;

const MODULE_STATUSES = [
  { label: "Onaylar", note: "Arayüz hazır; akış güvenli", href: "/onaylar", tone: "ok" as const },
  { label: "Cariler", note: "Liste, detay ve yeni ekran güvenli", href: "/cariler", tone: "ok" as const },
  { label: "Stok", note: "Liste, modal ve satır aksiyonları güvenli", href: "/stok", tone: "ok" as const },
  { label: "Hızlı işlem", note: "Workbench hazır; canlı kayıt kuyruğu bekleniyor", href: "/hizli-islem", tone: "pending" as const },
  { label: "Teklif / sipariş", note: "Hub ve workbench yönlendirmesi güvenli", href: "/teklifler", tone: "ok" as const },
  { label: "Tahsilat", note: "Hub ve workbench yönlendirmesi güvenli", href: "/tahsilatlar/yeni", tone: "ok" as const },
  { label: "Belgeler / arşiv", note: "Önizleme ve arşiv akışı güvenli", href: "/belgeler", tone: "ok" as const },
  { label: "WhatsApp", note: "Bağlantı bekleniyor", href: "/whatsapp", tone: "warn" as const }
] as const;

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

function resolveCardValue(card: DashboardCard, snapshot: DashboardHomeSnapshot, isDemo: boolean): string {
  const live = snapshot.cardValues[card.id];
  if (live !== undefined && live !== "") return live;
  if (isDemo) return card.demoValue;
  return "—";
}

function resolveCardNote(card: DashboardCard, snapshot: DashboardHomeSnapshot, isDemo: boolean): string {
  const live = snapshot.cardNotes[card.id];
  if (live) return live;
  if (isDemo) return card.demoNote ?? card.description;
  return "Canlı veri bekleniyor";
}

export function DashboardHomePage() {
  const isDemo = dataSourceConfig.useDemoData;
  const [selectedIds, setSelectedIds] = useState<DashboardCardId[]>(DEFAULT_SELECTED);
  const [draftIds, setDraftIds] = useState<DashboardCardId[]>(DEFAULT_SELECTED);
  const [editorOpen, setEditorOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<DashboardHomeSnapshot>(EMPTY_DASHBOARD_HOME_SNAPSHOT);
  const [snapshotReady, setSnapshotReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((id): id is DashboardCardId => ALL_CARDS.some((c) => c.id === id));
      if (valid.length > 0) {
        setSelectedIds(valid);
        setDraftIds(valid);
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loader = isDemo ? getDashboardHomeSnapshot() : getDashboardLiveSnapshot();
    void loader
      .then((data) => {
        if (!active) return;
        setSnapshot(data);
        setSnapshotReady(true);
      })
      .catch(() => {
        if (!active) return;
        setSnapshot(EMPTY_DASHBOARD_HOME_SNAPSHOT);
        setSnapshotReady(true);
      });
    return () => {
      active = false;
    };
  }, [isDemo]);

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
      Operasyon: [],
      "Satış / Cari": [],
      Finans: [],
      "Stok / Depo": [],
      "İletişim / AI": []
    };
    for (const card of ALL_CARDS) {
      groups[card.category].push(card);
    }
    return groups;
  }, []);

  const priorityItems = useMemo(() => {
    if (snapshot.priorityQueue.length > 0) {
      return snapshot.priorityQueue.map((item) => ({
        id: item.taskId,
        text: item.text,
        icon: item.icon,
        tone: item.tone,
        href: item.href
      }));
    }
    if (isDemo) return DEMO_WORK_QUEUE;
    return [];
  }, [snapshot.priorityQueue, isDemo]);

  const activityRows = useMemo(() => {
    if (snapshot.activity.length > 0) return snapshot.activity;
    if (isDemo && snapshotReady) {
      return [
        { id: "demo_a1", time: "09:12", text: "Örnek: sipariş onay kuyruğuna eklendi (demo).", channel: "Operasyon" },
        { id: "demo_a2", time: "09:04", text: "Örnek: tahsilat hatırlatması oluşturuldu (demo).", channel: "Finans" }
      ];
    }
    return [];
  }, [snapshot.activity, isDemo, snapshotReady]);

  const toggleDraft = (id: DashboardCardId) => {
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

  const cardToneClass = (id: DashboardCardId) => {
    if (id === "approvals") return "is-lavender";
    if (id === "collections") return "is-green";
    if (id === "stock-risk") return "is-orange";
    if (id === "wa") return "is-wa";
    if (id === "warehouse") return "is-indigo";
    if (id === "deliveries") return "is-blue";
    return "is-neutral";
  };

  const metricToneForCard = (id: DashboardCardId): "info" | "success" | "warning" | "danger" | "neutral" => {
    if (id === "collections" || id === "customer-balance") return "success";
    if (id === "stock-risk" || id === "overdue" || id === "critical-tasks") return "warning";
    if (id === "customer-risk" || id === "returns" || id === "ai-approval") return "danger";
    if (id === "wa" || id === "deliveries" || id === "orders") return "info";
    return "neutral";
  };

  const criticalLabel =
    snapshot.counts.criticalOrOverdueTasks > 0
      ? `${snapshot.counts.criticalOrOverdueTasks} yüksek risk`
      : isDemo
        ? "3 yüksek risk (örnek)"
        : "Kritik kayıt yok";

  const followLabel =
    snapshot.counts.openOperationalTasks > 0
      ? `${Math.min(snapshot.counts.openOperationalTasks, 99)} cari/iş bekliyor`
      : isDemo
        ? "5 cari bekliyor (örnek)"
        : "Takip kaydı yok";

  const pendingApprovalsLabel =
    snapshot.counts.pendingApprovals > 0
      ? `${snapshot.counts.pendingApprovals} bekleyen onay`
      : isDemo
        ? "7 bekleyen onay (örnek)"
        : "Bekleyen onay yok";

  return (
    <div className="hz-dashboard-page hz-dashboard-page--fit hz-dashboard-page--v2">
      <SplitContentLayout
        main={
          <div className="hz-dash-work-center">
            {isDemo ? (
              <p className="hz-dash-preview-band hz-dash-preview-band--kpi-span" role="status">
                Örnek veri modu: KPI, aktivite ve öncelik listesi demo amaçlıdır; canlı işletme sonucu değildir.
              </p>
            ) : (
              <p className="hz-dash-live-band hz-dash-preview-band--kpi-span" role="status">
                Canlı özet bağlantısı bekleniyor; göstergeler tenant verisi bağlandığında güncellenecektir.
              </p>
            )}

            <section className="hz-dash-kpi-strip" aria-label="Özet göstergeler">
              {selectedCards.map((card) => (
                <MetricCard
                  key={`kpi-${card.id}`}
                  title={card.title}
                  value={snapshotReady ? resolveCardValue(card, snapshot, isDemo) : "…"}
                  detail={snapshotReady ? resolveCardNote(card, snapshot, isDemo) : undefined}
                  tone={metricToneForCard(card.id)}
                />
              ))}
            </section>

            <section className="hz-dash-module-strip" aria-label="Modül durumları">
              {MODULE_STATUSES.map((mod) => (
                <Link key={mod.href} href={mod.href} className={`hz-dash-module-chip hz-dash-module-chip--${mod.tone}`}>
                  <span className="hz-dash-module-chip-label">{mod.label}</span>
                  <span className="hz-dash-module-chip-note">{mod.note}</span>
                </Link>
              ))}
            </section>

            <section className="hz-dash-ops-block" aria-label="Operasyon özeti">
              <div className="hz-dash-work-hero-wrap">
                <article className="hz-dash-work-hero hz-dash-ops-main">
                  <header className="hz-dash-work-head">
                    <h2>Bugün Öncelik Verilecek İşler</h2>
                  </header>
                  {priorityItems.length > 0 ? (
                    <ol className="hz-dash-work-list">
                      {priorityItems.map((item) => (
                        <li key={item.id} className={`hz-dash-work-item hz-dash-work-item--${item.tone}`}>
                          <span className="hz-dash-work-item-ico" aria-hidden>
                            <RowListIconSvg kind={item.icon} size={14} />
                          </span>
                          <Link href={item.href} className="hz-dash-work-item-link">
                            {item.text}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="hz-dash-empty-copy">Canlı öncelik listesi henüz bağlı değil.</p>
                  )}
                  <Link href="/gorevler/merkez" className="hz-dash-work-link-btn">
                    Tüm görevleri görüntüle
                  </Link>
                </article>
                <div className="hz-dash-work-side-stack">
                  <article className="hz-dash-work-mini">
                    <header className="hz-dash-work-mini-head">
                      <span className="hz-dash-work-mini-ico" aria-hidden>
                        <RowListIconSvg kind="alert" size={14} />
                      </span>
                      <h3>Kritik görev</h3>
                    </header>
                    <p className="hz-dash-work-mini-value">{criticalLabel}</p>
                    <Link href="/onaylar" className="hz-dash-work-mini-link">
                      Onaylara git
                    </Link>
                  </article>
                  <article className="hz-dash-approvals-quick" aria-label="Onaylar hızlı erişim">
                    <header className="hz-dash-approvals-quick-head">
                      <h3>Onaylar</h3>
                    </header>
                    <p className="hz-dash-approvals-quick-copy">Bekleyen onayları ve güvenlik sinyallerini Onaylar ekranından izleyin.</p>
                    <p className="hz-dash-approvals-quick-note">{pendingApprovalsLabel}</p>
                    <Link href="/onaylar" className="hz-dash-approvals-quick-cta">
                      Onaylara git
                    </Link>
                  </article>
                  <article className="hz-dash-work-mini">
                    <header className="hz-dash-work-mini-head">
                      <span className="hz-dash-work-mini-ico" aria-hidden>
                        <RowListIconSvg kind="tag" size={14} />
                      </span>
                      <h3>Bugün takip</h3>
                    </header>
                    <p className="hz-dash-work-mini-value">{followLabel}</p>
                    <Link href="/cariler" className="hz-dash-work-mini-link">
                      Carilere git
                    </Link>
                  </article>
                </div>
              </div>
            </section>

            <nav className="hz-dash-quick-actions" aria-label="Hızlı işlemler">
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.href} href={action.href} className="hz-dash-quick-action">
                  {action.label}
                </Link>
              ))}
            </nav>

            <div className="hz-dash-main-stack">
              <section className="hz-dash-selected-cards" aria-label="Seçili bilgi kartları">
                <header className="hz-dash-work-head hz-dash-work-head--cards">
                  <h2>Seçili bilgi kartları</h2>
                  {!isDemo ? (
                    <span className="hz-dash-selected-cards-hint">Canlı kart değerleri tenant verisi ile güncellenir.</span>
                  ) : null}
                </header>
                <div className="hz-dash-selected-grid">
                  {selectedCards.map((card) => {
                    const cardHref = DASHBOARD_CARD_HREF[card.id];
                    return (
                      <article key={card.id} className={`hz-dash-selected-card ${cardToneClass(card.id)}`}>
                        <header className="hz-dash-selected-card-head">
                          <div className="hz-dash-selected-card-top">
                            <span className="hz-dash-selected-card-ico" aria-hidden>
                              <RowListIconSvg kind={card.icon} size={16} />
                            </span>
                            <h3>{card.title}</h3>
                          </div>
                          {cardHref ? (
                            <Link href={cardHref} className="hz-dash-selected-card-more" aria-label={`${card.title} — ilgili ekrana git`}>
                              <span className="hz-dash-selected-card-more-txt">Ekrana git</span>
                              <svg className="hz-dash-selected-card-more-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Link>
                          ) : null}
                        </header>
                        <p className="hz-dash-selected-card-value">{snapshotReady ? resolveCardValue(card, snapshot, isDemo) : "…"}</p>
                        <p className="hz-dash-selected-card-note">{snapshotReady ? resolveCardNote(card, snapshot, isDemo) : card.description}</p>
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
                    );
                  })}
                </div>
              </section>

              <section className="hz-dash-activity" aria-label="Son aktivite">
                <header className="hz-dash-activity-head">
                  <h2>Son aktivite</h2>
                  {isDemo ? <span className="hz-dash-activity-tag">Örnek kayıtlar</span> : null}
                </header>
                {activityRows.length > 0 ? (
                  <ul className="hz-dash-activity-list">
                    {activityRows.map((row) => (
                      <li key={row.id} className="hz-dash-activity-row">
                        <time className="hz-dash-activity-time">{row.time}</time>
                        <div className="hz-dash-activity-body">
                          <p className="hz-dash-activity-text">{row.text}</p>
                          <span className="hz-dash-activity-channel">{row.channel}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="hz-dash-empty-copy hz-dash-empty-copy--activity">Canlı aktivite akışı henüz bağlı değil.</p>
                )}
              </section>
            </div>

            <UiModal
              open={editorOpen}
              title="Kartları düzenle"
              onClose={() => setEditorOpen(false)}
              closeLabel="Kapat"
              footer={
                <>
                  <UiButton type="button" variant="ghost" size="sm" onClick={() => setEditorOpen(false)}>
                    Vazgeç
                  </UiButton>
                  <UiButton type="button" variant="primary" size="sm" onClick={saveSelection} disabled={draftIds.length < 1}>
                    Kaydet
                  </UiButton>
                </>
              }
            >
              <p className="hz-dash-card-editor-lead">Gösterge panelinde görmek istediğiniz bilgi kartlarını seçin.</p>
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
                  <h3>Seçili kartlar</h3>
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
            </UiModal>
          </div>
        }
        side={<DashboardAiAssistantPanel compact />}
      />
    </div>
  );
}
