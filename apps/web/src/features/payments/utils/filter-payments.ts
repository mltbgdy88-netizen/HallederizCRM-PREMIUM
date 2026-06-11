import type { Customer, PaymentReceipt } from "@hallederiz/types";
import type { PaymentFilters } from "../schemas/payment-filter-schema";

function matchesDateRange(receivedAt: string, dateRange: PaymentFilters["dateRange"]): boolean {
  if (dateRange === "all") return true;
  const received = new Date(receivedAt);
  const now = new Date("2026-05-26T00:00:00.000Z");

  if (dateRange === "today") {
    return (
      received.getFullYear() === now.getFullYear() &&
      received.getMonth() === now.getMonth() &&
      received.getDate() === now.getDate()
    );
  }

  if (dateRange === "week") {
    const diff = (now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }

  if (dateRange === "month") {
    return received.getFullYear() === now.getFullYear() && received.getMonth() === now.getMonth();
  }

  return true;
}

export function filterPayments(payments: PaymentReceipt[], customers: Customer[], filters: PaymentFilters): PaymentReceipt[] {
  return payments.filter((payment) => {
    const customer = customers.find((c) => c.id === payment.customerId);
    const searchText = `${payment.receiptNo} ${customer?.name ?? ""}`.toLocaleLowerCase("tr-TR");

    const matchesCustomer = filters.customer
      ? searchText.includes(filters.customer.toLocaleLowerCase("tr-TR"))
      : true;

    const matchesMethod = filters.method === "all" || payment.method === filters.method;
    const matchesStatus = filters.status === "all" || payment.status === filters.status;
    const matchesDate = matchesDateRange(payment.receivedAt, filters.dateRange);
    const matchesGroup =
      filters.customerGroup === "all" || (customer?.type ?? "") === filters.customerGroup;

    return matchesCustomer && matchesMethod && matchesStatus && matchesDate && matchesGroup;
  });
}
