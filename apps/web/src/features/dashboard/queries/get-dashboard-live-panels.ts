import type { DashboardCardType, Offer, PaymentReceipt, SaleOrder, Task } from "@hallederiz/types";
import { formatUserFacingStatus } from "../../../lib/user-facing-labels";
import { isOfflineLikeError } from "../../../lib/user-facing-data-error";
import type { DashboardCardId, DashboardHomeSnapshot } from "../utils/build-dashboard-home-snapshot";
import { getDashboardLiveSnapshot } from "./get-dashboard-live-snapshot";

export type DashboardRecentRow = {
  date: string;
  type: string;
  record: string;
  customer: string;
  amount: string;
  status: string;
};

export type DashboardLivePanels = {
  snapshot: DashboardHomeSnapshot;
  tasks: Task[];
  recentRows: DashboardRecentRow[];
};

const CARD_TYPE_TO_ID: Partial<Record<DashboardCardType, DashboardCardId>> = {
  new_orders: "orders",
  delivery_waiting: "deliveries",
  pending_payments: "collections",
  payment_request_needed: "collections",
  critical_stock: "stock-risk",
  warehouse_preparation: "warehouse",
  high_debt_customers: "overdue",
  inactive_payers: "overdue",
  ai_risk_alerts: "ai-approval",
  factory_order_needed: "factory-orders"
};

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "—";
  }
}

function fmtMoney(value: number, currency = "TRY"): string {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

function orderStatusLabel(status: SaleOrder["status"]): string {
  return formatUserFacingStatus(status);
}

function paymentStatusLabel(status: PaymentReceipt["status"]): string {
  return formatUserFacingStatus(status);
}

function offerStatusLabel(status: Offer["status"]): string {
  return formatUserFacingStatus(status);
}

async function fetchLiveTasks(): Promise<Task[]> {
  const { sdk } = await import("../../../lib/data-source");
  const cardsResponse = await sdk.dashboard.cards();
  const cards = cardsResponse.items ?? [];
  const taskLists = await Promise.all(
    cards.map((card) =>
      sdk.dashboard
        .cardTasks(card.type)
        .then((response) => response.items ?? [])
        .catch(() => [] as Task[])
    )
  );
  const byId = new Map<string, Task>();
  for (const list of taskLists) {
    for (const task of list) {
      byId.set(task.id, task);
    }
  }
  return [...byId.values()];
}

async function fetchLiveRecentRows(): Promise<DashboardRecentRow[]> {
  const { sdk } = await import("../../../lib/data-source");
  const [ordersResponse, paymentsResponse, offersResponse, customersResponse] = await Promise.all([
    sdk.orders.list().catch(() => ({ items: [] as SaleOrder[] })),
    sdk.payments.list().catch(() => ({ items: [] as PaymentReceipt[] })),
    sdk.offers.list().catch(() => ({ items: [] as Offer[] })),
    sdk.customers.list().catch(() => ({ items: [] as Array<{ id: string; name: string }> }))
  ]);

  const customerNameById = new Map(
    (customersResponse.items ?? []).map((customer) => [customer.id, customer.name] as const)
  );
  const resolveCustomer = (customerId: string) => customerNameById.get(customerId) ?? "—";

  const rows: Array<DashboardRecentRow & { sortAt: number }> = [];

  for (const order of ordersResponse.items ?? []) {
    rows.push({
      date: fmtDateTime(order.updatedAt ?? order.createdAt),
      type: "Sipariş",
      record: order.orderNo,
      customer: resolveCustomer(order.customerId),
      amount: fmtMoney(order.grandTotal, order.currency),
      status: orderStatusLabel(order.status),
      sortAt: new Date(order.updatedAt ?? order.createdAt).getTime()
    });
  }

  for (const payment of paymentsResponse.items ?? []) {
    rows.push({
      date: fmtDateTime(payment.receivedAt ?? payment.createdAt),
      type: "Tahsilat",
      record: payment.receiptNo,
      customer: resolveCustomer(payment.customerId),
      amount: fmtMoney(payment.amount, payment.currency),
      status: paymentStatusLabel(payment.status),
      sortAt: new Date(payment.receivedAt ?? payment.createdAt).getTime()
    });
  }

  for (const offer of offersResponse.items ?? []) {
    rows.push({
      date: fmtDateTime(offer.updatedAt ?? offer.createdAt),
      type: "Teklif",
      record: offer.offerNo,
      customer: resolveCustomer(offer.customerId),
      amount: fmtMoney(offer.grandTotal, offer.currency),
      status: offerStatusLabel(offer.status),
      sortAt: new Date(offer.updatedAt ?? offer.createdAt).getTime()
    });
  }

  return rows
    .sort((a, b) => b.sortAt - a.sortAt)
    .slice(0, 8)
    .map(({ sortAt: _sortAt, ...row }) => row);
}

export async function getDashboardLivePanels(): Promise<DashboardLivePanels> {
  try {
    const { sdk } = await import("../../../lib/data-source");
    const [snapshot, tasks, recentRows, cardsResponse] = await Promise.all([
      getDashboardLiveSnapshot(),
      fetchLiveTasks(),
      fetchLiveRecentRows(),
      sdk.dashboard.cards().catch(() => ({ items: [] }))
    ]);

    const cardValues = { ...snapshot.cardValues };
    const cardNotes = { ...snapshot.cardNotes };
    for (const card of cardsResponse.items ?? []) {
      const mappedId = CARD_TYPE_TO_ID[card.type];
      if (!mappedId) continue;
      cardValues[mappedId] = card.value > 0 ? String(card.value) : cardValues[mappedId] ?? "0";
      if (card.detail) {
        cardNotes[mappedId] = card.detail;
      }
    }

    return {
      snapshot: {
        ...snapshot,
        cardValues,
        cardNotes,
        counts: {
          ...snapshot.counts,
          openOperationalTasks: tasks.filter((t) => t.status !== "done" && t.status !== "cancelled").length
        }
      },
      tasks,
      recentRows
    };
  } catch (error) {
    if (isOfflineLikeError(error)) {
      return { snapshot: await getDashboardLiveSnapshot(), tasks: [], recentRows: [] };
    }
    return { snapshot: await getDashboardLiveSnapshot(), tasks: [], recentRows: [] };
  }
}
