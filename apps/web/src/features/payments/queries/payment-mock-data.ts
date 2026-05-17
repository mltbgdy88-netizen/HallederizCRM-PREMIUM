import { buildPaymentAllocationSummary } from "@hallederiz/domain";
import type { PaymentMethod, PaymentReceipt, PaymentStatus } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";

const tenantId = "tenant_1";
const createdBy = "user_1";

export async function getPaymentMockData(): Promise<PaymentReceipt[]> {
  const orders = await getOrderMockData();
  const orderOne = orders[0];
  const orderTwo = orders[1];

  if (!orderOne || !orderTwo) {
    return [];
  }

  return [
    {
      id: "payment_1",
      tenantId,
      receiptNo: "PAY-930",
      customerId: orderOne.customerId,
      amount: 25000,
      currency: "TRY",
      method: "transfer",
      status: "allocated",
      description: "SO-2481 icin kismi tahsilat.",
      referenceNo: "TRF-20260428-001",
      documentCount: 1,
      receivedAt: "2026-04-28T10:10:00.000Z",
      createdBy,
      createdAt: "2026-04-28T10:00:00.000Z",
      confirmedAt: "2026-04-28T10:15:00.000Z",
      allocations: [
        {
          id: "allocation_1",
          tenantId,
          paymentId: "payment_1",
          customerId: orderOne.customerId,
          targetType: "order",
          targetId: orderOne.id,
          targetNo: orderOne.orderNo,
          targetTotal: orderOne.grandTotal,
          openBalance: Math.max(orderOne.grandTotal - 25000, 0),
          allocatedAmount: 25000,
          currency: "TRY",
          createdAt: "2026-04-28T10:15:00.000Z"
        }
      ]
    },
    {
      id: "payment_2",
      tenantId,
      receiptNo: "PAY-928",
      customerId: orderTwo.customerId,
      amount: 60000,
      currency: "TRY",
      method: "card",
      status: "partially_allocated",
      description: "Kurumsal proje on odemesi, bir kismi acik hesapta bekliyor.",
      referenceNo: "POS-7781",
      documentCount: 2,
      receivedAt: "2026-04-27T13:40:00.000Z",
      createdBy,
      createdAt: "2026-04-27T13:35:00.000Z",
      confirmedAt: "2026-04-27T13:45:00.000Z",
      allocations: [
        {
          id: "allocation_2",
          tenantId,
          paymentId: "payment_2",
          customerId: orderTwo.customerId,
          targetType: "order",
          targetId: orderTwo.id,
          targetNo: orderTwo.orderNo,
          targetTotal: orderTwo.grandTotal,
          openBalance: Math.max(orderTwo.grandTotal - 40000, 0),
          allocatedAmount: 40000,
          currency: "TRY",
          createdAt: "2026-04-27T13:45:00.000Z"
        },
        {
          id: "allocation_3",
          tenantId,
          paymentId: "payment_2",
          customerId: orderTwo.customerId,
          targetType: "open_account",
          targetNo: "ACIK-HESAP",
          targetTotal: 20000,
          openBalance: 0,
          allocatedAmount: 20000,
          currency: "TRY",
          createdAt: "2026-04-27T13:45:00.000Z"
        }
      ]
    },
    {
      id: "payment_3",
      tenantId,
      receiptNo: "PAY-923",
      customerId: "customer_3",
      amount: 12500,
      currency: "TRY",
      method: "cash",
      status: "confirmed",
      description: "Allocation bekleyen nakit tahsilat.",
      referenceNo: "KASA-45",
      documentCount: 0,
      receivedAt: "2026-04-26T16:20:00.000Z",
      createdBy,
      createdAt: "2026-04-26T16:22:00.000Z",
      confirmedAt: "2026-04-26T16:25:00.000Z",
      allocations: []
    }
  ];
}

export async function getPaymentById(paymentId?: string): Promise<PaymentReceipt | null> {
  const payments = await getPaymentMockData();

  if (!paymentId) {
    const order = (await getOrderMockData())[0];
    if (!order) {
      return null;
    }

    return {
      id: "payment_new",
      tenantId,
      receiptNo: "Yeni Tahsilat",
      customerId: order.customerId,
      amount: 0,
      currency: "TRY",
      method: "transfer",
      status: "draft",
      description: "Yeni tahsilat taslagi.",
      documentCount: 0,
      receivedAt: new Date().toISOString(),
      createdBy,
      createdAt: new Date().toISOString(),
      allocations: [
        {
          id: "allocation_new_1",
          tenantId,
          paymentId: "payment_new",
          customerId: order.customerId,
          targetType: "order",
          targetId: order.id,
          targetNo: order.orderNo,
          targetTotal: order.grandTotal,
          openBalance: order.grandTotal,
          allocatedAmount: 0,
          currency: "TRY",
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  return payments.find((payment) => payment.id === paymentId || payment.receiptNo === paymentId) ?? null;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    cash: "Nakit",
    card: "Kart",
    transfer: "Havale/EFT",
    check: "Çek",
    mixed: "Karma"
  };
  return labels[method];
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    draft: "Taslak",
    confirmed: "Doğrulandı",
    reversed: "Ters kayıt",
    partially_allocated: "Kısmi tahsis",
    allocated: "Dağıtıldı"
  };
  return labels[status];
}

export function getPaymentSummary(payment: PaymentReceipt) {
  return buildPaymentAllocationSummary(payment);
}

export { customers };
