import type { Customer, SaleOrder } from "@hallederiz/types";

export type QuickOperationOrderContext = {
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  amountDisplay: string;
  dateDisplay: string;
  openBalance: number | null;
};

function formatTrDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "—";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function resolveOrderOpenBalance(order: SaleOrder): number | null {
  const open = order.grandTotal - order.paidTotal;
  if (!Number.isFinite(open) || open <= 0) {
    return null;
  }
  return Math.round(open * 100) / 100;
}

export function mapOrderToQuickOperationContext(order: SaleOrder, customer?: Customer | null): QuickOperationOrderContext {
  return {
    orderId: order.id,
    orderNo: order.orderNo,
    customerId: order.customerId,
    customerName: customer?.name ?? order.customerId,
    amountDisplay: formatMoney(order.grandTotal, order.currency),
    dateDisplay: formatTrDate(order.createdAt),
    openBalance: resolveOrderOpenBalance(order)
  };
}
