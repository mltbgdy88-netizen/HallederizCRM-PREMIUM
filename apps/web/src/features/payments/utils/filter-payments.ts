import type { Customer, PaymentReceipt } from "@hallederiz/types";
import type { PaymentFilters } from "../schemas/payment-filter-schema";

export function filterPayments(payments: PaymentReceipt[], customers: Customer[], filters: PaymentFilters): PaymentReceipt[] {
  return payments.filter((payment) => {
    const customer = customers.find((item) => item.id === payment.customerId);
    const searchText = `${payment.receiptNo} ${customer?.name ?? ""}`.toLocaleLowerCase("tr-TR");
    const matchesCustomer = filters.customer ? searchText.includes(filters.customer.toLocaleLowerCase("tr-TR")) : true;
    const matchesMethod = filters.method === "all" || payment.method === filters.method;
    const matchesStatus = filters.status === "all" || payment.status === filters.status;
    const matchesDocument =
      filters.documentType === "all" || payment.allocations.some((allocation) => allocation.targetType === filters.documentType);
    const matchesOpen = !filters.openOnly || payment.status === "draft" || payment.status === "confirmed" || payment.status === "partially_allocated";

    return matchesCustomer && matchesMethod && matchesStatus && matchesDocument && matchesOpen;
  });
}
