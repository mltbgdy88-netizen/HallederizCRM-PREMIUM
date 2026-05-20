import type { PaymentAllocation, PaymentReceipt } from "@hallederiz/types";
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

  create(payload: Partial<PaymentReceipt>) {
    return this.api.post<ItemResponse<PaymentReceipt>>("/payments", payload);
  }
}
