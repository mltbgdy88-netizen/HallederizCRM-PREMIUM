import type { Customer, PaymentReceipt } from "@hallederiz/types";
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
  return {
    payments: await getPaymentMockData(),
    customers
  };
}

export async function getPaymentDetail(paymentId?: string): Promise<PaymentDetailQueryResult> {
  return {
    payment: await getPaymentById(paymentId),
    payments: await getPaymentMockData(),
    customers
  };
}
