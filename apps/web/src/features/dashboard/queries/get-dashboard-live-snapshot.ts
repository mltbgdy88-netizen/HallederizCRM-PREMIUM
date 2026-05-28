import type { DashboardCard, Task } from "@hallederiz/types";
import { isOfflineLikeError } from "../../../lib/user-facing-data-error";
import {
  EMPTY_DASHBOARD_HOME_SNAPSHOT,
  type DashboardHomeSnapshot
} from "../utils/build-dashboard-home-snapshot";

function mapSummaryToSnapshot(summary: {
  taskCount?: number;
  approvalCount?: number;
  pendingApprovalCount?: number;
  workflowCount?: number;
}): DashboardHomeSnapshot {
  const pending = summary.pendingApprovalCount ?? 0;
  const tasks = summary.taskCount ?? 0;
  return {
    cardValues: {
      approvals: pending > 0 ? String(pending) : "—",
      "today-priority": tasks > 0 ? String(tasks) : "—",
      "open-work": tasks > 0 ? String(tasks) : "—",
      "customer-balance": "—",
      overdue: "—",
      wa: "—"
    },
    cardNotes: {
      approvals: pending > 0 ? "Bekleyen onay" : "Canlı veri bekleniyor",
      "today-priority": tasks > 0 ? "Açık görev" : "Canlı veri bekleniyor",
      "customer-balance": "Canlı veri bekleniyor",
      overdue: "Canlı veri bekleniyor",
      wa: "Canlı veri bekleniyor"
    },
    priorityQueue: [],
    activity: [],
    counts: {
      pendingApprovals: pending,
      criticalOrOverdueTasks: 0,
      openOperationalTasks: tasks,
      aiOpenTasks: 0
    }
  };
}

function mapCardsToSnapshot(cards: DashboardCard[], cardTasks: Task[]): Partial<DashboardHomeSnapshot> {
  const cardValues: DashboardHomeSnapshot["cardValues"] = {};
  const cardNotes: DashboardHomeSnapshot["cardNotes"] = {};

  for (const card of cards) {
    const value = card.value > 0 ? String(card.value) : "—";
    if (card.type === "new_orders") {
      cardValues.orders = value;
      cardNotes.orders = card.detail ?? "Canlı kayıt";
    }
    if (card.type === "ai_risk_alerts") {
      cardValues["ai-approval"] = value;
      cardNotes["ai-approval"] = card.detail ?? "Canlı kayıt";
    }
  }

  const priorityQueue = cardTasks.slice(0, 4).map((task) => ({
    taskId: task.id,
    text: task.title,
    icon: "clipboard" as const,
    tone: "approval" as const,
    href: task.approvalId ? `/onaylar/${task.approvalId}` : "/onaylar"
  }));

  return { cardValues, cardNotes, priorityQueue };
}

export async function getDashboardLiveSnapshot(): Promise<DashboardHomeSnapshot> {
  try {
    const { sdk } = await import("../../../lib/data-source");
    const [summaryResponse, cardsResponse] = await Promise.all([
      sdk.dashboard.summary(),
      sdk.dashboard.cards()
    ]);

    const summary = (summaryResponse.item ?? {}) as {
      taskCount?: number;
      approvalCount?: number;
      pendingApprovalCount?: number;
      workflowCount?: number;
    };

    const base = mapSummaryToSnapshot(summary);
    const cards = cardsResponse.items ?? [];

    let cardTasks: Task[] = [];
    const firstCard = cards[0];
    if (firstCard?.type) {
      const tasksResponse = await sdk.dashboard.cardTasks(firstCard.type);
      cardTasks = tasksResponse.items ?? [];
    }

    const mapped = mapCardsToSnapshot(cards, cardTasks);
    return {
      ...base,
      cardValues: { ...base.cardValues, ...mapped.cardValues },
      cardNotes: { ...base.cardNotes, ...mapped.cardNotes },
      priorityQueue: mapped.priorityQueue?.length ? mapped.priorityQueue : base.priorityQueue
    };
  } catch (error) {
    if (isOfflineLikeError(error)) {
      return EMPTY_DASHBOARD_HOME_SNAPSHOT;
    }
    return EMPTY_DASHBOARD_HOME_SNAPSHOT;
  }
}
