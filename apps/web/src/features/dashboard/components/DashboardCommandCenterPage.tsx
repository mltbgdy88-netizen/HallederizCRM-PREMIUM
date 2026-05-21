"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Task } from "@hallederiz/types";
import { LucideIcon, type LucideIconName } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { getDashboardHomeSnapshot } from "../queries/get-dashboard-home-snapshot";
import { getDashboardLiveSnapshot } from "../queries/get-dashboard-live-snapshot";
import { getOperationsEngineData } from "../queries/operations-engine-mock-data";
import {
  EMPTY_DASHBOARD_HOME_SNAPSHOT,
  type DashboardHomeSnapshot
} from "../utils/build-dashboard-home-snapshot";
import { DashboardCommandCenterAiPanel } from "./DashboardCommandCenterAiPanel";
import { DashboardCommandCenterCardEditor } from "./DashboardCommandCenterCardEditor";
import {
  buildCommandCenterGridRows,
  DEFAULT_COMMAND_CENTER_PANELS,
  loadCommandCenterPanels,
  panelsToVisibility,
  saveCommandCenterPanels,
  type CommandCenterPanelId
} from "../utils/dashboard-command-center-panels";

type AlertCard = {
  key: string;
  title: string;
  countLabel: string;
  amountLabel?: string;
  action: string;
  href: string;
  tone: "danger" | "gold" | "cream" | "success";
  icon: LucideIconName;
};

type TaskRow = {
  id: string;
  time: string;
  text: string;
  type: string;
  priority: "Yüksek" | "Orta" | "Düşük";
};

type FlowRow = {
  key: string;
  title: string;
  subtitle: string;
  count: string;
  href: string;
  icon: LucideIconName;
};

type RecentRow = {
  date: string;
  type: string;
  record: string;
  customer: string;
  amount: string;
  status: string;
};

const DEMO_ALERTS: AlertCard[] = [
  { key: "overdue", title: "Vadesi Geçen Tahsilatlar", countLabel: "8 kayıt", amountLabel: "₺2.810.000", action: "Listeyi Gör", href: "/tahsilatlar", tone: "danger", icon: "bell-ring" },
  { key: "approvals", title: "Onay Bekleyen İşlemler", countLabel: "5 işlem", action: "Onayları Aç", href: "/onaylar", tone: "gold", icon: "clipboard-check" },
  { key: "stock", title: "Stokta Azalan Ürünler", countLabel: "12 ürün", action: "Stokları Gör", href: "/stok", tone: "cream", icon: "package-minus" },
  { key: "delivery", title: "Bugün Teslim Edilecek", countLabel: "7 sipariş", action: "Teslimatları Gör", href: "/teslimatlar", tone: "success", icon: "truck" }
];

const DEMO_TASKS: TaskRow[] = [
  { id: "t1", time: "09:00", text: "Vadesi geçen 3 tahsilat için müşteri ile görüş", type: "Tahsilat", priority: "Yüksek" },
  { id: "t2", time: "10:30", text: "ABC Gıda - teklif revizesi hazırla", type: "Teklif", priority: "Orta" },
  { id: "t3", time: "11:00", text: "4 siparişin sevkiyat planlamasını yap", type: "Sipariş", priority: "Yüksek" },
  { id: "t4", time: "14:00", text: "Stokta azalan ürünler için tedarik planı oluştur", type: "Stok", priority: "Orta" }
];

const DEMO_FLOW: FlowRow[] = [
  { key: "orders", title: "Yeni Siparişler", subtitle: "Bugün", count: "12", href: "/siparisler", icon: "shopping-cart" },
  { key: "ship", title: "Sevkiyat Bekleyen", subtitle: "Toplam", count: "7", href: "/teslimatlar", icon: "truck" },
  { key: "pay", title: "Tahsilat Bekleyen", subtitle: "Bugün vadesi gelen", count: "5", href: "/tahsilatlar", icon: "circle-dollar-sign" },
  { key: "return", title: "İade Talebi", subtitle: "Onay bekleyen", count: "2", href: "/iadeler", icon: "rotate-ccw" },
  { key: "offer", title: "Teklif Bekleyen", subtitle: "Yanıt bekleyen", count: "6", href: "/teklifler", icon: "file-text" }
];

const DEMO_RECENT: RecentRow[] = [
  { date: "21.05.2026 10:42", type: "Tahsilat", record: "Tahsilat #TH-2026-0187", customer: "ABC Gıda San. Ltd.", amount: "₺125.000", status: "Tamamlandı" },
  { date: "21.05.2026 10:28", type: "Sipariş", record: "Sipariş #SP-2026-0156", customer: "Vizyon Market", amount: "₺85.500", status: "Hazırlanıyor" },
  { date: "21.05.2026 09:55", type: "Teklif", record: "Teklif #TK-2026-0091", customer: "Delta Yapı", amount: "₺210.000", status: "Gönderildi" },
  { date: "21.05.2026 09:12", type: "Stok", record: "Stok Girişi #ST-4412", customer: "—", amount: "—", status: "Kayıtlı" }
];

const QUICK_LINKS: Array<{ href: string; title: string; sub: string; icon: LucideIconName }> = [
  { href: "/siparisler/yeni", title: "Yeni Sipariş", sub: "Oluştur", icon: "plus-square" },
  { href: "/tahsilatlar/yeni", title: "Tahsilat Ekle", sub: "Tahsilat kaydı", icon: "circle-dollar-sign" },
  { href: "/teklifler/yeni", title: "Teklif Hazırla", sub: "Yeni teklif", icon: "file-text" },
  { href: "/cariler/yeni", title: "Müşteri Ekle", sub: "Yeni cari kaydı", icon: "user-plus" },
  { href: "/stok", title: "Stok Girişi", sub: "Ürün girişi", icon: "package-plus" },
  { href: "/gorevler", title: "Görev Oluştur", sub: "Yeni görev", icon: "clipboard-plus" },
  { href: "/hizli-islem", title: "Tüm İşlemler", sub: "Kısayollar", icon: "grid-3x3" }
];

const FLOW_ICONS = {
  orders: "shopping-cart",
  ship: "truck",
  pay: "circle-dollar-sign",
  return: "rotate-ccw",
  offer: "file-text"
} as const satisfies Record<string, LucideIconName>;

function fmtTaskTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function taskPriorityLabel(p: Task["priority"]): TaskRow["priority"] {
  if (p === "critical" || p === "high") return "Yüksek";
  if (p === "low") return "Düşük";
  return "Orta";
}

function taskTypeLabel(task: Task): string {
  if (task.entityType === "payment") return "Tahsilat";
  if (task.entityType === "order") return "Sipariş";
  if (task.entityType === "offer") return "Teklif";
  if (task.type === "critical_stock") return "Stok";
  return "Görev";
}

function mapTasksFromEngine(tasks: Task[]): TaskRow[] {
  const open = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  return [...open]
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      time: fmtTaskTime(t.dueAt),
      text: t.title,
      type: taskTypeLabel(t),
      priority: taskPriorityLabel(t.priority)
    }));
}

function buildAlerts(snapshot: DashboardHomeSnapshot, isDemo: boolean): AlertCard[] {
  if (isDemo) return DEMO_ALERTS;

  const overdue = snapshot.cardValues.overdue ?? "0";
  const approvals = snapshot.cardValues.approvals ?? String(snapshot.counts.pendingApprovals);
  const stock = snapshot.cardValues["stock-risk"] ?? "0";
  const deliveries = snapshot.cardValues.deliveries ?? "0";

  return [
    { key: "overdue", title: "Vadesi Geçen Tahsilatlar", countLabel: `${overdue} kayıt`, action: "Listeyi Gör", href: "/tahsilatlar", tone: "danger", icon: "bell-ring" },
    { key: "approvals", title: "Onay Bekleyen İşlemler", countLabel: `${approvals} işlem`, action: "Onayları Aç", href: "/onaylar", tone: "gold", icon: "clipboard-check" },
    { key: "stock", title: "Stokta Azalan Ürünler", countLabel: `${stock} ürün`, action: "Stokları Gör", href: "/stok", tone: "cream", icon: "package-minus" },
    { key: "delivery", title: "Bugün Teslim Edilecek", countLabel: `${deliveries} sipariş`, action: "Teslimatları Gör", href: "/teslimatlar", tone: "success", icon: "truck" }
  ];
}

function buildFlow(snapshot: DashboardHomeSnapshot, isDemo: boolean): FlowRow[] {
  if (isDemo) return DEMO_FLOW;
  return [
    { key: "orders", title: "Yeni Siparişler", subtitle: "Bugün", count: snapshot.cardValues.orders ?? "0", href: "/siparisler", icon: FLOW_ICONS.orders },
    { key: "ship", title: "Sevkiyat Bekleyen", subtitle: "Toplam", count: snapshot.cardValues.deliveries ?? "0", href: "/teslimatlar", icon: FLOW_ICONS.ship },
    { key: "pay", title: "Tahsilat Bekleyen", subtitle: "Bugün vadesi gelen", count: snapshot.cardValues.collections ?? "0", href: "/tahsilatlar", icon: FLOW_ICONS.pay },
    { key: "return", title: "İade Talebi", subtitle: "Onay bekleyen", count: snapshot.cardValues.returns ?? "0", href: "/iadeler", icon: FLOW_ICONS.return },
    { key: "offer", title: "Teklif Bekleyen", subtitle: "Yanıt bekleyen", count: snapshot.cardValues.offers ?? "0", href: "/teklifler", icon: FLOW_ICONS.offer }
  ];
}

function PromoVideoPanel() {
  return (
    <article className="hz-dash-card hz-promo-card" aria-label="Tanıtım videosu">
      <div className="hz-promo-player">
        <div className="hz-promo-player__screen">
          <div className="hz-promo-player__vignette" aria-hidden />
          <button type="button" className="hz-promo-player__play" disabled aria-label="Tanıtım videosu oynat">
            <LucideIcon name="play" size={22} strokeWidth={2.25} />
          </button>
          <span className="hz-promo-player__duration">2:35</span>
        </div>
        <div className="hz-promo-player__progress" aria-hidden>
          <div className="hz-promo-player__track">
            <div className="hz-promo-player__fill" />
            <div className="hz-promo-player__thumb" />
          </div>
          <span className="hz-promo-player__time">0:00 / 2:35</span>
        </div>
        <div className="hz-promo-player__controls">
          <button type="button" className="hz-promo-player__ctrl" disabled aria-label="Oynat">
            <LucideIcon name="play" size={14} strokeWidth={2.25} />
          </button>
          <button type="button" className="hz-promo-player__ctrl" disabled aria-label="Ses">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M11 5L6 9H3v6h3l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
            </svg>
          </button>
          <Link href="/ayarlar" className="hz-promo-player__link">
            Tanıtım ve videolar
          </Link>
          <button type="button" className="hz-promo-player__ctrl hz-promo-player__ctrl--end" disabled aria-label="Tam ekran">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

export function DashboardCommandCenterPage() {
  const isDemo = dataSourceConfig.useDemoData;

  const [snapshot, setSnapshot] = useState<DashboardHomeSnapshot>(EMPTY_DASHBOARD_HOME_SNAPSHOT);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPanelIds, setSelectedPanelIds] = useState<CommandCenterPanelId[]>(DEFAULT_COMMAND_CENTER_PANELS);
  const [draftPanelIds, setDraftPanelIds] = useState<CommandCenterPanelId[]>(DEFAULT_COMMAND_CENTER_PANELS);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    setSelectedPanelIds(loadCommandCenterPanels());
    setDraftPanelIds(loadCommandCenterPanels());
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setDraftPanelIds(selectedPanelIds);
      setEditorOpen(true);
    };
    window.addEventListener("dashboard:open-card-editor", onOpen);
    return () => window.removeEventListener("dashboard:open-card-editor", onOpen);
  }, [selectedPanelIds]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const loader = isDemo ? getDashboardHomeSnapshot() : getDashboardLiveSnapshot();
        const snap = await loader;
        if (!active) return;
        setSnapshot(snap);

        if (isDemo) {
          const engine = await getOperationsEngineData();
          if (!active) return;
          const mapped = mapTasksFromEngine(engine.tasks);
          setTasks(mapped.length > 0 ? mapped : DEMO_TASKS);
        } else {
          setTasks(mapTasksFromEngine([]));
        }
      } catch {
        if (!active) return;
        setSnapshot(EMPTY_DASHBOARD_HOME_SNAPSHOT);
        setTasks(isDemo ? DEMO_TASKS : []);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isDemo]);

  const alerts = useMemo(() => buildAlerts(snapshot, isDemo), [snapshot, isDemo]);
  const flowRows = useMemo(() => buildFlow(snapshot, isDemo), [snapshot, isDemo]);
  const recentRows = isDemo ? DEMO_RECENT : [];
  const taskCount = tasks.length;

  const visiblePanels = useMemo(() => panelsToVisibility(selectedPanelIds), [selectedPanelIds]);
  const mainGridRows = useMemo(() => buildCommandCenterGridRows(visiblePanels), [visiblePanels]);
  const showMiddle = visiblePanels.tasks || visiblePanels.flow;

  const toggleDraftPanel = (id: CommandCenterPanelId) => {
    setDraftPanelIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const savePanelSelection = () => {
    if (draftPanelIds.length < 1) return;
    setSelectedPanelIds(draftPanelIds);
    saveCommandCenterPanels(draftPanelIds);
    setEditorOpen(false);
  };

  return (
    <div className="hz-dashboard-command">
      <div className="hz-dashboard-command__grid">
        <div className="hz-dashboard-command__main" style={{ gridTemplateRows: mainGridRows }}>
          {visiblePanels.alerts ? (
          <section className="hz-dash-card hz-dash-card--alerts" data-row="alerts" aria-label="Acil durumlar ve uyarılar">
            <div className="hz-alert-grid">
              {alerts.map((card) => (
                <article key={card.key} className={`hz-alert-tile hz-alert-tile--${card.tone}`}>
                  <span className="hz-alert-tile__icon" aria-hidden>
                    <LucideIcon name={card.icon} size={14} strokeWidth={2.25} />
                  </span>
                  <div className="hz-alert-tile__copy">
                    <p className="hz-alert-tile__title">{card.title}</p>
                    <p className="hz-alert-tile__value">
                      {card.countLabel}
                      {card.amountLabel ? <span className="hz-alert-tile__meta"> · {card.amountLabel}</span> : null}
                    </p>
                    <Link href={card.href} className="hz-alert-tile__action">
                      {card.action}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
          ) : null}

          {showMiddle ? (
          <div
            className="hz-dashboard-command__middle"
            style={
              visiblePanels.tasks && visiblePanels.flow
                ? undefined
                : { gridTemplateColumns: "minmax(0, 1fr)" }
            }
          >
            {visiblePanels.tasks ? (
            <section className="hz-dash-card hz-dash-card--tasks">
              <header className="hz-dash-card__head">
                <h2>Bugünkü Görevlerim ({loading ? "…" : taskCount})</h2>
                <Link href="/gorevler" className="hz-dash-card__link">
                  Tüm Görevler →
                </Link>
              </header>
              <div className="hz-dash-card__body hz-dash-card__body--flush">
                {tasks.length === 0 ? (
                  <p className="hz-dash-empty">Bugün için görev bulunmuyor.</p>
                ) : (
                  <ul className="hz-task-list">
                    {tasks.map((row) => (
                      <li key={row.id} className="hz-task-row">
                        <input type="checkbox" className="hz-task-row__check" aria-label={`Görev: ${row.text}`} readOnly />
                        <span className="hz-task-row__time">{row.time}</span>
                        <span className="hz-task-row__title">{row.text}</span>
                        <span className="hz-badge hz-badge--type">{row.type}</span>
                        <span
                          className={`hz-badge hz-badge--priority-${
                            row.priority === "Yüksek" ? "high" : row.priority === "Düşük" ? "low" : "medium"
                          }`}
                        >
                          {row.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
            ) : null}

            {visiblePanels.flow ? (
            <section className="hz-dash-card hz-dash-card--flow">
              <header className="hz-dash-card__head">
                <h2>Operasyon Akış Özeti</h2>
                <Link href="/hizli-islem" className="hz-dash-card__link">
                  Tümünü Gör →
                </Link>
              </header>
              <div className="hz-dash-card__body hz-dash-card__body--flush">
                <ul className="hz-flow-list">
                  {flowRows.map((row) => (
                    <li key={row.key}>
                      <Link href={row.href} className="hz-flow-row">
                        <span className="hz-flow-row__icon" aria-hidden>
                          <LucideIcon name={row.icon} size={16} strokeWidth={2.25} />
                        </span>
                        <span className="hz-flow-row__copy">
                          <span className="hz-flow-row__title">{row.title}</span>
                          <span className="hz-flow-row__sub">{row.subtitle}</span>
                        </span>
                        <span className="hz-flow-row__count">{row.count}</span>
                        <LucideIcon name="chevron-right" size={14} className="hz-flow-row__chev" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
            ) : null}
          </div>
          ) : null}

          {visiblePanels.recent ? (
          <section className="hz-dash-card hz-dash-card--recent">
            <header className="hz-dash-card__head">
              <h2>Son İşlemler</h2>
              <Link href="/archive" className="hz-dash-card__link">
                Tüm İşlemler →
              </Link>
            </header>
            <div className="hz-dash-card__body hz-dash-card__body--flush">
              {recentRows.length === 0 ? (
                <p className="hz-dash-empty">Son işlem kaydı görüntülenemiyor.</p>
              ) : (
                <div className="hz-recent-table-wrap">
                  <table className="hz-recent-table">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Tür</th>
                        <th>Kayıt</th>
                        <th>Cari</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRows.map((row, i) => (
                        <tr key={`${row.record}-${i}`}>
                          <td>{row.date}</td>
                          <td>{row.type}</td>
                          <td>{row.record}</td>
                          <td>{row.customer}</td>
                          <td>{row.amount}</td>
                          <td>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
          ) : null}

          {visiblePanels.quick ? (
          <section className="hz-dash-card hz-dash-card--quick" aria-label="Hızlı işlemler">
            <div className="hz-quick-rail">
              {QUICK_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="hz-quick-action">
                  <LucideIcon name={item.icon} size={14} strokeWidth={2.25} />
                  <strong>{item.title}</strong>
                  <span>{item.sub}</span>
                </Link>
              ))}
            </div>
          </section>
          ) : null}
        </div>

        <aside className="hz-dashboard-command__rail">
          <DashboardCommandCenterAiPanel />
          <PromoVideoPanel />
        </aside>
      </div>

      <DashboardCommandCenterCardEditor
        open={editorOpen}
        draftIds={draftPanelIds}
        onClose={() => setEditorOpen(false)}
        onToggle={toggleDraftPanel}
        onSave={savePanelSelection}
      />
    </div>
  );
}
