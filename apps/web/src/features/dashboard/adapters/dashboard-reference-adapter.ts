import { getDashboardLiveSnapshot } from "../queries/get-dashboard-live-snapshot";
import { formatCount } from "../../../lib/reference/formatters";
import {
  AI_QUICK_ACTIONS,
  FLOW_ITEMS,
  KPI_CARDS,
  type AiQuickAction,
  type FlowItem,
  type KpiCard
} from "../data/dashboard-reference-mock";

export type DashboardReferenceSnapshot = {
  kpiCards: KpiCard[];
  flowItems: FlowItem[];
  aiQuickActions: AiQuickAction[];
  demoBanner: string | null;
};

export function loadDashboardReferenceDemo(): DashboardReferenceSnapshot {
  return {
    kpiCards: KPI_CARDS,
    flowItems: FLOW_ITEMS,
    aiQuickActions: AI_QUICK_ACTIONS,
    demoBanner: null
  };
}

export async function loadDashboardReferenceLive(): Promise<DashboardReferenceSnapshot> {
  const snapshot = await getDashboardLiveSnapshot();

  const kpiCards: KpiCard[] = [
    {
      id: "approvals",
      label: "Bekleyen Onay",
      value: snapshot.cardValues.approvals ?? "—",
      tone: "orange"
    },
    {
      id: "tasks",
      label: "Açık Görev",
      value: snapshot.cardValues["open-work"] ?? snapshot.cardValues["today-priority"] ?? "—",
      tone: "green"
    },
    {
      id: "orders",
      label: "Yeni Sipariş",
      value: snapshot.cardValues.orders ?? "—",
      tone: "teal"
    },
    {
      id: "customers",
      label: "Cari Bakiye",
      value: snapshot.cardValues["customer-balance"] ?? "—",
      tone: "gold"
    },
    {
      id: "wa",
      label: "WhatsApp",
      value: snapshot.cardValues.wa ?? "—",
      tone: "green"
    },
    {
      id: "overdue",
      label: "Geciken",
      value: snapshot.cardValues.overdue ?? "—",
      tone: "orange"
    }
  ];

  const flowItems: FlowItem[] = snapshot.activity.length
    ? snapshot.activity.map((item, index) => ({
        id: String(index + 1),
        title: item.text,
        detail: item.channel || "Canlı operasyon kaydı",
        time: "—",
        status: "Bilgi" as const,
        icon: "system" as const
      }))
    : snapshot.priorityQueue.map((item, index) => ({
        id: String(index + 1),
        title: item.text,
        detail: item.href,
        time: "—",
        status: "Bilgi" as const,
        icon: "system" as const
      }));

  if (!flowItems.length) {
    return {
      kpiCards,
      flowItems: [
        {
          id: "live-empty",
          title: "Canlı operasyon akışı",
          detail: `${formatCount(snapshot.counts.pendingApprovals)} bekleyen onay · ${formatCount(snapshot.counts.openOperationalTasks)} açık görev`,
          time: "—",
          status: "Bilgi",
          icon: "system"
        }
      ],
      aiQuickActions: AI_QUICK_ACTIONS,
      demoBanner: null
    };
  }

  return {
    kpiCards,
    flowItems,
    aiQuickActions: AI_QUICK_ACTIONS,
    demoBanner: null
  };
}

export const DASHBOARD_REFERENCE_INITIAL = loadDashboardReferenceDemo();

