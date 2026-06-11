import type { PaymentAllocation, PaymentReceipt, PaymentReversalLineRecord } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class PaymentsClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<PaymentReceipt>>("/payments");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<PaymentReceipt>>(`/payments/${id}`);
  }

  allocations(id: string) {
    return this.api.get<{ items: PaymentAllocation[] }>(`/payments/${id}/allocations`);
  }

  create(payload: Partial<PaymentReceipt>, options?: { idempotencyKey?: string }) {
    const headers: Record<string, string> = {};
    if (options?.idempotencyKey?.trim()) {
      headers["idempotency-key"] = options.idempotencyKey.trim();
    }
    return this.api.post<ItemResponse<PaymentReceipt>>("/payments", payload, { headers });
  }

  confirm(paymentId: string, options?: { idempotencyKey?: string }) {
    const headers: Record<string, string> = {};
    if (options?.idempotencyKey?.trim()) {
      headers["idempotency-key"] = options.idempotencyKey.trim();
    }
    return this.api.post<ItemResponse<PaymentReceipt>>(`/payments/${paymentId}/confirm`, undefined, { headers });
  }

  listReversals(paymentId: string) {
    return this.api.get<ListResponse<PaymentReversalLineRecord>>(`/payments/${paymentId}/reversals`);
  }

  createReversal(paymentId: string, payload: { amount: number; currency?: string; reason: string; idempotencyKey?: string }) {
    return this.api.post<ItemResponse<PaymentReversalLineRecord>>(`/payments/${paymentId}/reversals`, payload);
  }
}
