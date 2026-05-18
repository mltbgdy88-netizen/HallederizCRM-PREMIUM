import type { Approval, Offer, SaleOrder, Task } from "@hallederiz/types";
import type { OperationsEngineData } from "../queries/operations-engine-mock-data";

/** Dashboard kart kimlikleri — DashboardHomePage ALL_CARDS ile aynı olmalı */
export type DashboardCardId =
  | "approvals"
  | "today-priority"
  | "critical-tasks"
  | "today-follow"
  | "open-work"
  | "offers"
  | "orders"
  | "customer-risk"
  | "customer-balance"
  | "collections"
  | "overdue"
  | "invoices"
  | "returns"
  | "stock-risk"
  | "warehouse"
  | "deliveries"
  | "factory-orders"
  | "wa"
  | "ai-suggestions"
  | "ai-approval";

export type DashboardPriorityQueueItem = {
  taskId: string;
  text: string;
  icon: "clipboard" | "package" | "wallet" | "alert" | "tag" | "fileCheck" | "rotate" | "card";
  tone: "delivery" | "stock" | "collection" | "approval";
  href: string;
};

export type DashboardActivityRow = {
  id: string;
  time: string;
  text: string;
  channel: string;
};

export type DashboardHomeSnapshot = {
  cardValues: Partial<Record<DashboardCardId, string>>;
  cardNotes: Partial<Record<DashboardCardId, string>>;
  priorityQueue: DashboardPriorityQueueItem[];
  activity: DashboardActivityRow[];
  counts: {
    pendingApprovals: number;
    criticalOrOverdueTasks: number;
    openOperationalTasks: number;
    aiOpenTasks: number;
  };
};

export const EMPTY_DASHBOARD_HOME_SNAPSHOT: DashboardHomeSnapshot = {
  cardValues: {},
  cardNotes: {},
  priorityQueue: [],
  activity: [],
  counts: {
    pendingApprovals: 0,
    criticalOrOverdueTasks: 0,
    openOperationalTasks: 0,
    aiOpenTasks: 0
  }
};

const OPEN_OFFER_STATUS = new Set<Offer["status"]>(["draft", "sent", "waiting_response", "approved"]);

const ACTIVE_ORDER_STATUS = new Set<SaleOrder["status"]>([
  "draft",
  "confirmed",
  "waiting_stock",
  "in_preparation",
  "ready",
  "partially_delivered"
]);

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export function resolveTaskHref(task: Task): string {
  switch (task.entityType) {
    case "customer":
      return `/cariler/${task.entityId}`;
    case "order":
      return `/siparisler/${task.entityId}`;
    case "delivery":
      return `/teslimatlar/${task.entityId}`;
    case "warehouse_order":
      return `/depo/emirler/${task.entityId}`;
    case "factory_order":
      return `/fabrikalar/siparisler/${task.entityId}`;
    case "product":
      return "/stok";
    case "invoice":
      return `/faturalar/${task.entityId}`;
    case "return":
      return `/iadeler/${task.entityId}`;
    case "offer":
      return `/teklifler/${task.entityId}`;
    case "payment":
      return `/tahsilatlar/${task.entityId}`;
    case "ai_proposal":
      return "/ai/onaylar";
    case "document":
      return "/belgeler";
    default:
      return "/gorevler";
  }
}

function priorityRank(p: Task["priority"]): number {
  const order: Record<Task["priority"], number> = { critical: 0, high: 1, normal: 2, low: 3 };
  return order[p] ?? 3;
}

function taskTone(task: Task): DashboardPriorityQueueItem["tone"] {
  if (task.approvalId || task.type === "approval_required") return "approval";
  if (task.type === "critical_stock" || task.type === "ai_stockout_prediction") return "stock";
  if (
    task.type === "payment_followup" ||
    task.type === "high_debt" ||
    task.type === "ai_payment_priority" ||
    task.entityType === "payment"
  )
    return "collection";
  return "delivery";
}

function taskIcon(task: Task): DashboardPriorityQueueItem["icon"] {
  const tone = taskTone(task);
  if (tone === "approval") return "alert";
  if (tone === "stock") return "package";
  if (tone === "collection") return "wallet";
  return "clipboard";
}

function pickPriorityTasks(tasks: Task[], limit: number): Task[] {
  const actionable = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  return [...actionable]
    .sort((a, b) => {
      const pr = priorityRank(a.priority) - priorityRank(b.priority);
      if (pr !== 0) return pr;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    })
    .slice(0, limit);
}

function buildPriorityQueue(tasks: Task[]): DashboardPriorityQueueItem[] {
  return pickPriorityTasks(tasks, 4).map((task) => ({
    taskId: task.id,
    text: task.title,
    icon: taskIcon(task),
    tone: taskTone(task),
    href: resolveTaskHref(task)
  }));
}

function buildActivity(tasks: Task[], approvals: Approval[], limit = 5): DashboardActivityRow[] {
  const rows: DashboardActivityRow[] = [];

  const pending = approvals.filter((a) => a.status === "pending");
  for (const a of [...pending]
    .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
    .slice(0, 2)) {
    rows.push({
      id: `ap_${a.id}`,
      time: fmtTime(a.createdAt),
      text: `${a.approvalNo}: ${a.payloadSummary}`,
      channel: "Onaylar"
    });
  }

  const taskRows = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);

  for (const t of taskRows) {
    if (rows.length >= limit) break;
    rows.push({
      id: `tk_${t.id}`,
      time: fmtTime(t.updatedAt),
      text: `${t.taskNo}: ${t.title}`,
      channel:
        t.source === "ai"
          ? "AI"
          : t.entityType === "warehouse_order"
            ? "Depo"
            : t.entityType === "order"
              ? "Operasyon"
              : t.entityType === "customer"
                ? "Cari"
                : "Görev"
    });
  }

  return rows.slice(0, limit);
}

export function buildDashboardHomeSnapshot(
  engine: OperationsEngineData,
  offers: Offer[],
  orders: SaleOrder[]
): DashboardHomeSnapshot {
  const { tasks, approvals } = engine;

  const pendingApprovals = approvals.filter((a) => a.status === "pending").length;
  const criticalOrOverdueTasks = tasks.filter((t) => t.priority === "critical" || t.status === "overdue").length;
  const openOperationalTasks = tasks.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "overdue"
  ).length;
  const aiOpenTasks = tasks.filter((t) => t.source === "ai" && t.status !== "done" && t.status !== "cancelled").length;

  const highPriorityOpen = tasks.filter(
    (t) => (t.priority === "high" || t.priority === "critical") && t.status !== "done" && t.status !== "cancelled"
  ).length;

  const stockRiskCount = tasks.filter((t) => t.type === "critical_stock" || t.type === "ai_stockout_prediction").length;
  const warehousePrepCount = tasks.filter((t) => t.entityType === "warehouse_order" || t.type === "warehouse_picking").length;
  const deliveryFocusCount = tasks.filter((t) => t.entityType === "delivery" || t.type === "delivery_waiting").length;
  const customerRiskCount = tasks.filter((t) => t.type === "customer_risk" || t.type === "high_debt").length;
  const openOffersCount = offers.filter((o) => OPEN_OFFER_STATUS.has(o.status)).length;
  const ordersToProcessCount = orders.filter((o) => ACTIVE_ORDER_STATUS.has(o.status)).length;
  const pendingAiApprovalCount = approvals.filter((a) => a.status === "pending" && a.entityType === "ai_proposal").length;

  const overduePaymentsApprox = orders.filter((o) => o.paymentStatus === "unpaid" || o.paymentStatus === "partial").length;

  const cardValues: Partial<Record<DashboardCardId, string>> = {
    approvals: String(pendingApprovals),
    "today-priority": String(Math.min(9, Math.max(highPriorityOpen, pendingApprovals))),
    "critical-tasks": String(criticalOrOverdueTasks),
    "today-follow": String(Math.min(openOperationalTasks, 99)),
    "open-work": String(openOperationalTasks),
    offers: String(openOffersCount),
    orders: String(ordersToProcessCount),
    "customer-risk": String(customerRiskCount),
    "stock-risk": String(stockRiskCount),
    warehouse: String(warehousePrepCount),
    deliveries: String(deliveryFocusCount),
    "ai-suggestions": String(aiOpenTasks),
    "ai-approval": String(pendingAiApprovalCount),
    overdue: String(overduePaymentsApprox)
  };

  const cardNotes: Partial<Record<DashboardCardId, string>> = {
    approvals: pendingApprovals ? "Bekleyen onay" : "Bekleyen yok",
    "critical-tasks": criticalOrOverdueTasks ? "Risk / gecikme" : "Kritik yok",
    "stock-risk": stockRiskCount ? "Stok sinyali" : "Uyarı yok",
    wa: "Kanal gelen kutusu",
    collections: "Operasyon özeti",
    invoices: "Belge akışı",
    returns: "İade takibi"
  };

  return {
    cardValues,
    cardNotes,
    priorityQueue: buildPriorityQueue(tasks),
    activity: buildActivity(tasks, approvals, 5),
    counts: {
      pendingApprovals,
      criticalOrOverdueTasks,
      openOperationalTasks,
      aiOpenTasks
    }
  };
}

export const DASHBOARD_CARD_HREF: Partial<Record<DashboardCardId, string>> = {
  approvals: "/onaylar",
  "today-priority": "/gorevler",
  "critical-tasks": "/gorevler/gecikenler",
  "today-follow": "/cariler",
  "open-work": "/gorevler",
  offers: "/teklifler",
  orders: "/siparisler",
  "customer-risk": "/cariler",
  "customer-balance": "/cariler",
  collections: "/tahsilatlar",
  overdue: "/tahsilatlar",
  invoices: "/faturalar",
  returns: "/iadeler",
  "stock-risk": "/stok",
  warehouse: "/depo",
  deliveries: "/teslimatlar",
  "factory-orders": "/fabrikalar/siparisler",
  wa: "/whatsapp",
  "ai-suggestions": "/ai/icgoruler",
  "ai-approval": "/ai/onaylar"
};
