import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { customers } from "../../customers/queries/customer-mock-data";
import { getPaymentById, getPaymentMockData } from "./payment-mock-data";

export interface PaymentsQueryResult {
  payments: PaymentReceipt[];
  customers: Customer[];
}

export interface PaymentDetailQueryResult extends PaymentsQueryResult {
  payment: PaymentReceipt | null;
}

export async function getPayments(): Promise<PaymentsQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [paymentsResponse, customersResponse] = await Promise.all([sdk.payments.list(), sdk.customers.list()]);
    return {
      payments: paymentsResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    payments: await getPaymentMockData(),
    customers
  };
}

export async function getPaymentDetail(paymentId?: string): Promise<PaymentDetailQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [paymentsResponse, customersResponse] = await Promise.all([sdk.payments.list(), sdk.customers.list()]);
    const payment = paymentId ? (await sdk.payments.detail(paymentId)).item ?? null : null;
    return {
      payment,
      payments: paymentsResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    payment: await getPaymentById(paymentId),
    payments: await getPaymentMockData(),
    customers
  };
}
