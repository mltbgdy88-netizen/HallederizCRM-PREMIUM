"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Approval, Task } from "@hallederiz/types";
import { dataSourceConfig } from "../../../lib/data-source";
import { getDashboardHomeSnapshot } from "../queries/get-dashboard-home-snapshot";
import { getDashboardLiveSnapshot } from "../queries/get-dashboard-live-snapshot";
import { getOperationsEngineData } from "../queries/operations-engine-mock-data";
import {
  DASHBOARD_CARD_HREF,
  EMPTY_DASHBOARD_HOME_SNAPSHOT,
  resolveTaskHref,
  type DashboardActivityRow,
  type DashboardCardId,
  type DashboardHomeSnapshot,
  type DashboardPriorityQueueItem
} from "../utils/build-dashboard-home-snapshot";
import { DashboardCommandCenterAiPanel } from "./DashboardCommandCenterAiPanel";
import {
  ChevronRightSmall,
  FlowIcon,
  IconArrowRight,
  IconChevronDown,
  IconInfo,
  IconPlay,
  IconRefresh,
  IconSparkle,
  KpiIcon
} from "./dashboard-reference-icons";

type KpiTone = "green" | "gold" | "teal" | "orange";

type ReferenceKpiCard = {
  id: DashboardCardId;
  label: string;
  value: string;
  tone: KpiTone;
  href: string;
  note?: string;
};

type ReferenceFlowItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  status: "Başarılı" | "Uyarı" | "Bilgi";
  icon: "plus" | "alert" | "transfer" | "price" | "shelf" | "system";
  href: string;
  channel?: string;
};

type FlowRow = {
  key: string;
  title: string;
  subtitle: string;
  count: string;
  href: string;
};

type FlowFilter = "all" | "onay" | "operasyon" | "finans";

type AiQuickAction = {
  id: string;
  label: string;
};

const KPI_DEFINITIONS: Array<{ id: DashboardCardId; label: string; tone: KpiTone }> = [
  { id: "overdue", label: "Vadesi Geçen", tone: "orange" },
  { id: "approvals", label: "Onay Bekleyen", tone: "gold" },
  { id: "stock-risk", label: "Kritik Stok", tone: "gold" },
  { id: "deliveries", label: "Bugün Teslim", tone: "green" },
  { id: "orders", label: "Yeni Sipariş", tone: "green" },
  { id: "collections", label: "Tahsilat Bekleyen", tone: "teal" }
];

const FLOW_FILTER_LABELS: Record<FlowFilter, string> = {
  all: "Tümü",
  onay: "Onaylar",
  operasyon: "Operasyon",
  finans: "Finans"
};

const FLOW_FILTER_ORDER: FlowFilter[] = ["all", "onay", "operasyon", "finans"];

function statusClass(status: string): string {
  if (status === "Başarılı") return "ref-badge ref-badge--success";
  if (status === "Uyarı") return "ref-badge ref-badge--warn";
  return "ref-badge ref-badge--info";
}

function extractCountLabel(raw: string | undefined, fallback = "0"): string {
  if (!raw || raw === "—") return fallback;
  const match = raw.match(/^\d+/);
  const digits = match?.[0] ?? raw.replace(/\D/g, "");
  return digits || fallback;
}

function resolveCardValue(snapshot: DashboardHomeSnapshot, cardId: DashboardCardId): string {
  const raw = snapshot.cardValues[cardId];
  if (cardId === "approvals" && (!raw || raw === "0")) {
    return String(snapshot.counts.pendingApprovals);
  }
  return extractCountLabel(raw);
}

function buildKpiCards(snapshot: DashboardHomeSnapshot): ReferenceKpiCard[] {
  return KPI_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    value: resolveCardValue(snapshot, definition.id),
    tone: definition.tone,
    href: DASHBOARD_CARD_HREF[definition.id] ?? "/dashboard",
    note: snapshot.cardNotes[definition.id]
  }));
}

function buildFlow(snapshot: DashboardHomeSnapshot): FlowRow[] {
  return [
    {
      key: "orders",
      title: "Yeni Siparişler",
      subtitle: "Aktif sipariş",
      count: resolveCardValue(snapshot, "orders"),
      href: "/siparisler"
    },
    {
      key: "ship",
      title: "Sevkiyat Bekleyen",
      subtitle: "Teslimat odağı",
      count: resolveCardValue(snapshot, "deliveries"),
      href: "/teslimatlar"
    },
    {
      key: "pay",
      title: "Tahsilat Bekleyen",
      subtitle: "Ödeme takibi",
      count: resolveCardValue(snapshot, "collections"),
      href: "/tahsilatlar"
    },
    {
      key: "return",
      title: "İade Talebi",
      subtitle: "İade kayıtları",
      count: resolveCardValue(snapshot, "returns"),
      href: "/iadeler"
    },
    {
      key: "offer",
      title: "Teklif Bekleyen",
      subtitle: "Açık teklif",
      count: resolveCardValue(snapshot, "offers"),
      href: "/teklifler"
    }
  ];
}

function inferFlowIconFromChannel(channel: string): ReferenceFlowItem["icon"] {
  const normalized = channel.toLowerCase();
  if (normalized.includes("stok") || normalized.includes("ürün") || normalized.includes("depo")) {
    return "shelf";
  }
  if (normalized.includes("onay")) return "alert";
  if (normalized.includes("tahsilat") || normalized.includes("ödeme") || normalized.includes("finans")) {
    return "price";
  }
  if (normalized.includes("transfer") || normalized.includes("sevkiyat") || normalized.includes("teslim")) {
    return "transfer";
  }
  if (normalized.includes("sipariş") || normalized.includes("teklif")) return "plus";
  return "system";
}

function inferFlowStatusFromText(text: string): ReferenceFlowItem["status"] {
  const normalized = text.toLowerCase();
  if (normalized.includes("kritik") || normalized.includes("gecik") || normalized.includes("uyarı")) {
    return "Uyarı";
  }
  if (normalized.includes("tamam") || normalized.includes("başarı")) {
    return "Başarılı";
  }
  return "Bilgi";
}

function resolveActivityHref(
  row: DashboardActivityRow,
  tasksById: Map<string, Task>,
  approvalsById: Map<string, Approval>
): string {
  if (row.id.startsWith("ap_")) {
    const approvalId = row.id.slice(3);
    return approvalsById.has(approvalId) ? `/onaylar/${approvalId}` : "/onaylar";
  }
  if (row.id.startsWith("tk_")) {
    const taskId = row.id.slice(3);
    const task = tasksById.get(taskId);
    return task ? resolveTaskHref(task) : "/gorevler";
  }
  return "/gorevler";
}

function mapActivityRows(
  activity: DashboardActivityRow[],
  tasksById: Map<string, Task>,
  approvalsById: Map<string, Approval>
): ReferenceFlowItem[] {
  return activity.map((row) => ({
    id: row.id,
    title: row.channel?.trim() || "Operasyon",
    detail: row.text,
    time: row.time,
    status: inferFlowStatusFromText(row.text),
    icon: inferFlowIconFromChannel(row.channel ?? ""),
    href: resolveActivityHref(row, tasksById, approvalsById),
    channel: row.channel
  }));
}

function flowKeyToIcon(key: string): ReferenceFlowItem["icon"] {
  if (key === "orders" || key === "offer") return "plus";
  if (key === "return" || key === "pay") return "price";
  if (key === "ship") return "transfer";
  return "system";
}

function mapFlowRows(rows: FlowRow[]): ReferenceFlowItem[] {
  return rows.map((row) => {
    const numericCount = Number.parseInt(row.count, 10);
    return {
      id: `summary_${row.key}`,
      title: row.title,
      detail: `${row.subtitle} · ${row.count} kayıt`,
      time: "Özet",
      status: Number.isFinite(numericCount) && numericCount > 0 ? "Uyarı" : "Bilgi",
      icon: flowKeyToIcon(row.key),
      href: row.href,
      channel: "Özet"
    };
  });
}

function priorityIconToFlowIcon(icon: DashboardPriorityQueueItem["icon"]): ReferenceFlowItem["icon"] {
  if (icon === "package") return "shelf";
  if (icon === "wallet") return "price";
  if (icon === "alert") return "alert";
  if (icon === "rotate") return "transfer";
  return "plus";
}

function priorityToneToStatus(tone: DashboardPriorityQueueItem["tone"]): ReferenceFlowItem["status"] {
  if (tone === "approval" || tone === "collection") return "Uyarı";
  if (tone === "stock") return "Uyarı";
  return "Bilgi";
}

function mapPriorityQueue(items: DashboardPriorityQueueItem[]): ReferenceFlowItem[] {
  return items.map((item) => ({
    id: `priority_${item.taskId}`,
    title: "Öncelik sırası",
    detail: item.text,
    time: "Şimdi",
    status: priorityToneToStatus(item.tone),
    icon: priorityIconToFlowIcon(item.icon),
    href: item.href,
    channel: "Öncelik"
  }));
}

function mergeFlowItems(primary: ReferenceFlowItem[], secondary: ReferenceFlowItem[], limit = 8): ReferenceFlowItem[] {
  const merged: ReferenceFlowItem[] = [];
  const seen = new Set<string>();

  for (const item of [...primary, ...secondary]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

function buildReferenceFlowList(
  snapshot: DashboardHomeSnapshot,
  flowRows: FlowRow[],
  tasksById: Map<string, Task>,
  approvalsById: Map<string, Approval>
): ReferenceFlowItem[] {
  const fromActivity = mapActivityRows(snapshot.activity, tasksById, approvalsById);
  const fromPriority = mapPriorityQueue(snapshot.priorityQueue);
  const fromSummary = mapFlowRows(flowRows);

  if (fromActivity.length >= 5) {
    return mergeFlowItems(fromActivity, fromPriority, 8);
  }

  return mergeFlowItems(fromActivity, mergeFlowItems(fromPriority, fromSummary, 8), 8);
}

function buildAiQuickActions(snapshot: DashboardHomeSnapshot): AiQuickAction[] {
  const stock = resolveCardValue(snapshot, "stock-risk");
  const approvals = resolveCardValue(snapshot, "approvals");
  const overdue = resolveCardValue(snapshot, "overdue");
  const orders = resolveCardValue(snapshot, "orders");

  return [
    { id: "stock", label: `Kritik stokları göster (${stock})` },
    { id: "summary", label: "Günlük operasyon özetini hazırla" },
    { id: "approvals", label: `Bekleyen onayları listele (${approvals})` },
    { id: "overdue", label: `Vadesi geçen tahsilatları özetle (${overdue})` },
    { id: "orders", label: `Açık siparişleri özetle (${orders})` }
  ].slice(0, 4);
}

function buildAiPrompt(snapshot: DashboardHomeSnapshot): string {
  const { pendingApprovals, openOperationalTasks, criticalOrOverdueTasks } = snapshot.counts;

  if (pendingApprovals > 0 && openOperationalTasks > 0) {
    return `${pendingApprovals} onay ve ${openOperationalTasks} açık görev var. Önce hangi hattı netleştirelim?`;
  }
  if (pendingApprovals > 0) {
    return `${pendingApprovals} onay bekliyor. Risk ve tutar etkisini birlikte özetleyebilirim.`;
  }
  if (criticalOrOverdueTasks > 0) {
    return `${criticalOrOverdueTasks} kritik veya geciken görev var. Öncelik sırasını çıkaralım mı?`;
  }
  if (openOperationalTasks > 0) {
    return `${openOperationalTasks} operasyon kaydı açık. Tahsilat, sevkiyat veya stok odağında yardımcı olabilirim.`;
  }
  return "Tahsilat, onay, sevkiyat ve stok süreçlerinizde size nasıl yardımcı olabilirim?";
}

function matchesFlowFilter(item: ReferenceFlowItem, filter: FlowFilter): boolean {
  if (filter === "all") return true;
  const haystack = `${item.title} ${item.detail} ${item.channel ?? ""} ${item.href}`.toLowerCase();
  if (filter === "onay") {
    return haystack.includes("onay") || item.href.includes("/onaylar");
  }
  if (filter === "finans") {
    return (
      haystack.includes("tahsilat") ||
      haystack.includes("ödeme") ||
      haystack.includes("iade") ||
      item.href.includes("/tahsilatlar") ||
      item.href.includes("/iadeler")
    );
  }
  return (
    haystack.includes("sipariş") ||
    haystack.includes("teklif") ||
    haystack.includes("teslim") ||
    haystack.includes("sevkiyat") ||
    haystack.includes("stok") ||
    haystack.includes("depo") ||
    item.href.includes("/siparisler") ||
    item.href.includes("/teklifler") ||
    item.href.includes("/teslimatlar") ||
    item.href.includes("/stok")
  );
}

function dispatchAiQuickPrompt(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dashboard:ai-quick-prompt", { detail: { message } }));
}

function dispatchAiFocusComposer() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dashboard:ai-focus-composer"));
}

export function DashboardReferenceLayout() {
  const isDemo = dataSourceConfig.useDemoData;

  const [snapshot, setSnapshot] = useState<DashboardHomeSnapshot>(EMPTY_DASHBOARD_HOME_SNAPSHOT);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [flowFilter, setFlowFilter] = useState<FlowFilter>("all");

  const chatHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const loader = isDemo ? getDashboardHomeSnapshot() : getDashboardLiveSnapshot();
        const snap = await loader;
        if (!active) return;
        setSnapshot(snap);

        if (isDemo) {
          const engine = await getOperationsEngineData();
          if (!active) return;
          setTasks(engine.tasks);
          setApprovals(engine.approvals);
        } else {
          setTasks([]);
          setApprovals([]);
        }
      } catch {
        if (!active) return;
        setSnapshot(EMPTY_DASHBOARD_HOME_SNAPSHOT);
        setTasks([]);
        setApprovals([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [isDemo, refreshToken]);

  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const approvalsById = useMemo(() => new Map(approvals.map((approval) => [approval.id, approval])), [approvals]);

  const flowRows = useMemo(() => buildFlow(snapshot), [snapshot]);
  const kpiCards = useMemo(() => buildKpiCards(snapshot), [snapshot]);
  const flowItems = useMemo(
    () => buildReferenceFlowList(snapshot, flowRows, tasksById, approvalsById),
    [snapshot, flowRows, tasksById, approvalsById]
  );

  const filteredFlowItems = useMemo(
    () => flowItems.filter((item) => matchesFlowFilter(item, flowFilter)),
    [flowItems, flowFilter]
  );

  const aiQuickActions = useMemo(() => buildAiQuickActions(snapshot), [snapshot]);
  const aiPrompt = useMemo(() => buildAiPrompt(snapshot), [snapshot]);

  const flowFooterHref = useMemo(() => {
    if (flowFilter === "onay") return "/onaylar";
    if (flowFilter === "finans") return "/tahsilatlar";
    if (flowFilter === "operasyon") return "/siparisler";
    return isDemo ? "/hizli-islem/satis-masasi" : "/archive";
  }, [flowFilter, isDemo]);

  const handleRefresh = () => {
    setRefreshToken((value) => value + 1);
  };

  const cycleFlowFilter = () => {
    setFlowFilter((current) => {
      const index = FLOW_FILTER_ORDER.indexOf(current);
      return FLOW_FILTER_ORDER[(index + 1) % FLOW_FILTER_ORDER.length] ?? "all";
    });
  };

  const handleVideoPlay = () => {
    chatHostRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    dispatchAiFocusComposer();
  };

  const handleKpiInfo = (card: ReferenceKpiCard) => {
    if (!card.note) return;
    dispatchAiQuickPrompt(`${card.label}: ${card.note}. Bu KPI için ne önerirsin?`);
  };

  return (
    <div className="ref-dashboard ref-dashboard--embedded" data-page="dashboard-reference-layout">
      <section className="ref-kpi-row" aria-label="Özet göstergeler">
        {kpiCards.map((card) => (
          <article key={card.id} className={`ref-kpi-card ref-kpi-card--${card.tone}`}>
            <Link href={card.href} className="ref-kpi-card-link" aria-label={`${card.label}: ${card.value}`}>
              <div className={`ref-kpi-icon ref-kpi-icon--${card.tone}`}>
                <KpiIcon tone={card.tone} />
              </div>
              <div className="ref-kpi-body">
                <span className="ref-kpi-value">{loading ? "…" : card.value}</span>
                <span className="ref-kpi-label">{card.label}</span>
              </div>
            </Link>
            <button
              type="button"
              className="ref-kpi-info"
              aria-label={`${card.label} bilgisi`}
              title={card.note}
              disabled={!card.note}
              onClick={() => handleKpiInfo(card)}
            >
              <IconInfo className="ref-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <section className="ref-dashboard-split">
        <article className="ref-flow-panel">
          <header className="ref-panel-head">
            <div>
              <h2>Operasyon Akışı</h2>
              <p>
                {loading
                  ? "Güncel kayıtlar yükleniyor…"
                  : `${flowItems.length} kayıt · ${snapshot.counts.pendingApprovals} onay · ${snapshot.counts.openOperationalTasks} açık görev`}
              </p>
            </div>
            <div className="ref-panel-tools">
              <button
                type="button"
                className="ref-tool-btn"
                disabled={loading}
                aria-pressed={flowFilter !== "all"}
                onClick={cycleFlowFilter}
              >
                {FLOW_FILTER_LABELS[flowFilter]}
                <IconChevronDown className="ref-tool-btn-icon" />
              </button>
              <button
                type="button"
                className="ref-tool-btn ref-tool-btn--primary"
                disabled={loading}
                onClick={handleRefresh}
              >
                <IconRefresh className="ref-tool-btn-icon" />
                Yenile
              </button>
            </div>
          </header>

          <ul className="ref-flow-list" aria-busy={loading}>
            {loading && filteredFlowItems.length === 0 ? (
              <li className="ref-flow-item ref-flow-item--placeholder">
                <div className="ref-flow-text">
                  <strong>Veriler yükleniyor…</strong>
                  <span>Operasyon akışı hazırlanıyor.</span>
                </div>
              </li>
            ) : null}
            {!loading && filteredFlowItems.length === 0 ? (
              <li className="ref-flow-item ref-flow-item--placeholder">
                <div className="ref-flow-text">
                  <strong>Bu filtrede kayıt yok</strong>
                  <span>Farklı bir filtre seçin veya veriyi yenileyin.</span>
                </div>
              </li>
            ) : null}
            {filteredFlowItems.map((item) => (
              <li key={item.id} className="ref-flow-item">
                <Link href={item.href} className="ref-flow-item-link">
                  <span className={`ref-flow-icon ref-flow-icon--${item.icon}`}>
                    <FlowIcon kind={item.icon} />
                  </span>
                  <div className="ref-flow-text">
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <span className="ref-flow-time">{item.time}</span>
                  <span className={statusClass(item.status)}>{item.status}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Link href={flowFooterHref} className="ref-flow-footer-btn">
            Tüm Akışı Görüntüle
            <IconArrowRight className="ref-flow-footer-icon" />
          </Link>
        </article>

        <article className="ref-ai-panel ref-ai-panel--hybrid">
          <header className="ref-panel-head ref-panel-head--compact">
            <div>
              <h2>
                <IconSparkle className="ref-ai-title-icon" />
                AI Asistan
              </h2>
              <p>
                {snapshot.counts.aiOpenTasks > 0
                  ? `${snapshot.counts.aiOpenTasks} AI görevi açık`
                  : "Operasyonel süreçlerinizi kolaylaştırın"}
              </p>
            </div>
          </header>

          <div className="ref-ai-video">
            <div className="ref-ai-video-inner">
              <span className="ref-ai-video-logo">PREMIUM CRM</span>
              <p>Operasyon Akıllı Yönetim Asistanı</p>
              <button type="button" className="ref-ai-play" aria-label="Sohbete odaklan" onClick={handleVideoPlay}>
                <IconPlay />
              </button>
            </div>
            <div className="ref-ai-video-bar">
              <span>Canlı</span>
              <div className="ref-ai-video-track">
                <div
                  className="ref-ai-video-progress"
                  style={{
                    width: `${Math.min(100, Math.max(8, snapshot.counts.openOperationalTasks * 12))}%`
                  }}
                />
              </div>
              <span>{snapshot.counts.openOperationalTasks} görev</span>
            </div>
          </div>

          <p className="ref-ai-prompt">{aiPrompt}</p>

          <ul className="ref-ai-actions">
            {aiQuickActions.map((action) => (
              <li key={action.id}>
                <button
                  type="button"
                  className="ref-ai-action-btn"
                  onClick={() => dispatchAiQuickPrompt(action.label)}
                >
                  <span>{action.label}</span>
                  <ChevronRightSmall />
                </button>
              </li>
            ))}
          </ul>

          <div ref={chatHostRef} className="ref-ai-live-host" aria-label="Canlı AI sohbet">
            <DashboardCommandCenterAiPanel />
          </div>
        </article>
      </section>

      {isDemo ? (
        <p className="ref-dashboard-mode" role="status">
          Demo veri: snapshot + ops-engine ({tasks.length} görev, {approvals.length} onay). Kritik işlemler onay
          zincirinden geçer.
        </p>
      ) : (
        <p className="ref-dashboard-mode" role="status">
          Canlı API özeti · {snapshot.counts.pendingApprovals} onay bekliyor. AI yalnızca öneri üretir.
        </p>
      )}
    </div>
  );
}
