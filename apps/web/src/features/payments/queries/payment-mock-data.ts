import type { PaymentMethod, PaymentReceipt, PaymentStatus } from "@hallederiz/types";

const tenantId = "tenant_1";
const createdBy = "user_1";

export async function getPaymentMockData(): Promise<PaymentReceipt[]> {
  return [
    {
      id: "payment_154",
      tenantId,
      receiptNo: "TH-2026-00154",
      customerId: "customer_1",
      amount: 48200,
      currency: "TRY",
      method: "transfer",
      status: "partially_allocated",
      description: "Kısmi havale tahsilatı, bakiye devam ediyor.",
      referenceNo: "ZRT-20260526-001",
      documentCount: 2,
      receivedAt: "2026-05-26T09:10:00.000Z",
      createdBy,
      createdAt: "2026-05-26T09:00:00.000Z",
      confirmedAt: "2026-05-26T09:15:00.000Z",
      allocations: [
        {
          id: "alloc_154_1",
          tenantId,
          paymentId: "payment_154",
          customerId: "customer_1",
          targetType: "order",
          targetId: "order_154",
          targetNo: "SP-2026-0085",
          targetTotal: 74000,
          openBalance: 25800,
          allocatedAmount: 22400,
          currency: "TRY",
          createdAt: "2026-05-26T09:15:00.000Z"
        }
      ]
    },
    {
      id: "payment_153",
      tenantId,
      receiptNo: "TH-2026-00153",
      customerId: "customer_3",
      amount: 12750,
      currency: "TRY",
      method: "cash",
      status: "allocated",
      description: "Tam nakit tahsilat.",
      referenceNo: "KASA-88",
      documentCount: 1,
      receivedAt: "2026-05-26T08:30:00.000Z",
      createdBy,
      createdAt: "2026-05-26T08:20:00.000Z",
      confirmedAt: "2026-05-26T08:35:00.000Z",
      allocations: [
        {
          id: "alloc_153_1",
          tenantId,
          paymentId: "payment_153",
          customerId: "customer_3",
          targetType: "order",
          targetId: "order_153",
          targetNo: "SP-2026-0081",
          targetTotal: 12750,
          openBalance: 0,
          allocatedAmount: 12750,
          currency: "TRY",
          createdAt: "2026-05-26T08:35:00.000Z"
        }
      ]
    },
    {
      id: "payment_152",
      tenantId,
      receiptNo: "TH-2026-00152",
      customerId: "customer_2",
      amount: 35600,
      currency: "TRY",
      method: "card",
      status: "allocated",
      description: "Kredi kartı tam tahsilat.",
      referenceNo: "POS-9912",
      documentCount: 1,
      receivedAt: "2026-05-25T14:20:00.000Z",
      createdBy,
      createdAt: "2026-05-25T14:15:00.000Z",
      confirmedAt: "2026-05-25T14:25:00.000Z",
      allocations: [
        {
          id: "alloc_152_1",
          tenantId,
          paymentId: "payment_152",
          customerId: "customer_2",
          targetType: "order",
          targetId: "order_152",
          targetNo: "SP-2026-0078",
          targetTotal: 35600,
          openBalance: 0,
          allocatedAmount: 35600,
          currency: "TRY",
          createdAt: "2026-05-25T14:25:00.000Z"
        }
      ]
    },
    {
      id: "payment_151",
      tenantId,
      receiptNo: "TH-2026-00151",
      customerId: "customer_4",
      amount: 18900,
      currency: "TRY",
      method: "transfer",
      status: "partially_allocated",
      description: "Kısmi havale, kalan borç takipte.",
      referenceNo: "ZRT-20260524-003",
      documentCount: 1,
      receivedAt: "2026-05-24T11:00:00.000Z",
      createdBy,
      createdAt: "2026-05-24T10:55:00.000Z",
      confirmedAt: "2026-05-24T11:05:00.000Z",
      allocations: [
        {
          id: "alloc_151_1",
          tenantId,
          paymentId: "payment_151",
          customerId: "customer_4",
          targetType: "order",
          targetId: "order_151",
          targetNo: "SP-2026-0074",
          targetTotal: 25000,
          openBalance: 6100,
          allocatedAmount: 12800,
          currency: "TRY",
          createdAt: "2026-05-24T11:05:00.000Z"
        }
      ]
    },
    {
      id: "payment_150",
      tenantId,
      receiptNo: "TH-2026-00150",
      customerId: "customer_5",
      amount: 25000,
      currency: "TRY",
      method: "check",
      status: "allocated",
      description: "Çek ile tam tahsilat.",
      referenceNo: "CEK-44120",
      documentCount: 2,
      receivedAt: "2026-05-23T09:45:00.000Z",
      createdBy,
      createdAt: "2026-05-23T09:40:00.000Z",
      confirmedAt: "2026-05-23T09:50:00.000Z",
      allocations: [
        {
          id: "alloc_150_1",
          tenantId,
          paymentId: "payment_150",
          customerId: "customer_5",
          targetType: "order",
          targetId: "order_150",
          targetNo: "SP-2026-0070",
          targetTotal: 25000,
          openBalance: 0,
          allocatedAmount: 25000,
          currency: "TRY",
          createdAt: "2026-05-23T09:50:00.000Z"
        }
      ]
    },
    {
      id: "payment_149",
      tenantId,
      receiptNo: "TH-2026-00149",
      customerId: "customer_6",
      amount: 14300,
      currency: "TRY",
      method: "transfer",
      status: "confirmed",
      description: "Havale alındı, tahsis bekliyor.",
      referenceNo: "ZRT-20260522-007",
      documentCount: 0,
      receivedAt: "2026-05-22T16:00:00.000Z",
      createdBy,
      createdAt: "2026-05-22T15:55:00.000Z",
      confirmedAt: "2026-05-22T16:05:00.000Z",
      allocations: []
    },
    {
      id: "payment_148",
      tenantId,
      receiptNo: "TH-2026-00148",
      customerId: "customer_7",
      amount: 9850,
      currency: "TRY",
      method: "cash",
      status: "allocated",
      description: "Nakit tam tahsilat.",
      referenceNo: "KASA-76",
      documentCount: 1,
      receivedAt: "2026-05-21T10:20:00.000Z",
      createdBy,
      createdAt: "2026-05-21T10:15:00.000Z",
      confirmedAt: "2026-05-21T10:25:00.000Z",
      allocations: [
        {
          id: "alloc_148_1",
          tenantId,
          paymentId: "payment_148",
          customerId: "customer_7",
          targetType: "order",
          targetId: "order_148",
          targetNo: "SP-2026-0065",
          targetTotal: 9850,
          openBalance: 0,
          allocatedAmount: 9850,
          currency: "TRY",
          createdAt: "2026-05-21T10:25:00.000Z"
        }
      ]
    },
    {
      id: "payment_147",
      tenantId,
      receiptNo: "TH-2026-00147",
      customerId: "customer_8",
      amount: 22400,
      currency: "TRY",
      method: "transfer",
      status: "partially_allocated",
      description: "Kısmi ödeme, kalan kısım ay sonuna ertelendi.",
      referenceNo: "ZRT-20260520-009",
      documentCount: 1,
      receivedAt: "2026-05-20T13:30:00.000Z",
      createdBy,
      createdAt: "2026-05-20T13:25:00.000Z",
      confirmedAt: "2026-05-20T13:35:00.000Z",
      allocations: [
        {
          id: "alloc_147_1",
          tenantId,
          paymentId: "payment_147",
          customerId: "customer_8",
          targetType: "order",
          targetId: "order_147",
          targetNo: "SP-2026-0061",
          targetTotal: 30000,
          openBalance: 7600,
          allocatedAmount: 14800,
          currency: "TRY",
          createdAt: "2026-05-20T13:35:00.000Z"
        }
      ]
    },
    {
      id: "payment_146",
      tenantId,
      receiptNo: "TH-2026-00146",
      customerId: "customer_1",
      amount: 31500,
      currency: "TRY",
      method: "transfer",
      status: "confirmed",
      description: "Havale alındı, belge eşleşmesi bekleniyor.",
      referenceNo: "ZRT-20260519-002",
      documentCount: 0,
      receivedAt: "2026-05-19T08:50:00.000Z",
      createdBy,
      createdAt: "2026-05-19T08:45:00.000Z",
      confirmedAt: "2026-05-19T08:55:00.000Z",
      allocations: []
    },
    {
      id: "payment_145",
      tenantId,
      receiptNo: "TH-2026-00145",
      customerId: "customer_3",
      amount: 7230,
      currency: "TRY",
      method: "card",
      status: "allocated",
      description: "Kart ile tam tahsilat.",
      referenceNo: "POS-8821",
      documentCount: 1,
      receivedAt: "2026-05-18T15:10:00.000Z",
      createdBy,
      createdAt: "2026-05-18T15:05:00.000Z",
      confirmedAt: "2026-05-18T15:15:00.000Z",
      allocations: [
        {
          id: "alloc_145_1",
          tenantId,
          paymentId: "payment_145",
          customerId: "customer_3",
          targetType: "order",
          targetId: "order_145",
          targetNo: "SP-2026-0055",
          targetTotal: 7230,
          openBalance: 0,
          allocatedAmount: 7230,
          currency: "TRY",
          createdAt: "2026-05-18T15:15:00.000Z"
        }
      ]
    },
    {
      id: "payment_144",
      tenantId,
      receiptNo: "TH-2026-00144",
      customerId: "customer_2",
      amount: 54000,
      currency: "TRY",
      method: "transfer",
      status: "allocated",
      description: "Proje ödemesi tam tahsilat.",
      referenceNo: "ZRT-20260517-005",
      documentCount: 2,
      receivedAt: "2026-05-17T10:00:00.000Z",
      createdBy,
      createdAt: "2026-05-17T09:55:00.000Z",
      confirmedAt: "2026-05-17T10:05:00.000Z",
      allocations: [
        {
          id: "alloc_144_1",
          tenantId,
          paymentId: "payment_144",
          customerId: "customer_2",
          targetType: "order",
          targetId: "order_144",
          targetNo: "SP-2026-0051",
          targetTotal: 54000,
          openBalance: 0,
          allocatedAmount: 54000,
          currency: "TRY",
          createdAt: "2026-05-17T10:05:00.000Z"
        }
      ]
    },
    {
      id: "payment_143",
      tenantId,
      receiptNo: "TH-2026-00143",
      customerId: "customer_5",
      amount: 8900,
      currency: "TRY",
      method: "cash",
      status: "allocated",
      description: "Nakit ön ödeme.",
      referenceNo: "KASA-71",
      documentCount: 1,
      receivedAt: "2026-05-16T12:00:00.000Z",
      createdBy,
      createdAt: "2026-05-16T11:55:00.000Z",
      confirmedAt: "2026-05-16T12:05:00.000Z",
      allocations: [
        {
          id: "alloc_143_1",
          tenantId,
          paymentId: "payment_143",
          customerId: "customer_5",
          targetType: "order",
          targetId: "order_143",
          targetNo: "SP-2026-0048",
          targetTotal: 8900,
          openBalance: 0,
          allocatedAmount: 8900,
          currency: "TRY",
          createdAt: "2026-05-16T12:05:00.000Z"
        }
      ]
    }
  ];
}

export async function getPaymentById(paymentId?: string): Promise<PaymentReceipt | null> {
  const payments = await getPaymentMockData();

  if (!paymentId) {
    const first = payments[0];
    return first ?? null;
  }

  return payments.find((payment) => payment.id === paymentId || payment.receiptNo === paymentId) ?? null;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    cash: "Nakit",
    card: "Kredi Kartı",
    transfer: "Havale",
    check: "Çek",
    mixed: "Karma"
  };
  return labels[method];
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    draft: "Taslak",
    confirmed: "Bekliyor",
    reversed: "Ters Kayıt",
    partially_allocated: "Kısmi",
    allocated: "Tahsil Edildi"
  };
  return labels[status];
}

export function getPaymentBankLabel(method: PaymentMethod, referenceNo?: string): string {
  if (method === "transfer") {
    if (referenceNo?.startsWith("ZRT")) return "Banka: Ziraat";
    if (referenceNo?.startsWith("ISB")) return "Banka: İş Bankası";
    return "Banka: EFT";
  }
  if (method === "card") return "POS terminali";
  if (method === "cash") return "Kasa";
  if (method === "check") return "Çek — Merkez Bankası";
  return "—";
}

export function getPaymentSummary(payment: PaymentReceipt) {
  const allocatedTotal = payment.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  return {
    allocatedTotal,
    remainingAmount: Math.max(payment.amount - allocatedTotal, 0),
    allocationCount: payment.allocations.length
  };
}

export function getDaysOverdue(payment: PaymentReceipt): number {
  if (payment.status !== "confirmed" && payment.status !== "partially_allocated") return 0;
  const received = new Date(payment.receivedAt);
  const now = new Date("2026-05-26T00:00:00.000Z");
  const diff = Math.floor((now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}
