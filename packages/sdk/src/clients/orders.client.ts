import type { SaleOrder } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class OrdersClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<SaleOrder>>("/orders");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<SaleOrder>>(`/orders/${id}`);
  }

  create(payload: Partial<SaleOrder>) {
    return this.api.post<ItemResponse<SaleOrder>>("/orders", payload);
  }

  update(id: string, payload: Partial<SaleOrder>) {
    return this.api.patch<ItemResponse<SaleOrder>>(`/orders/${id}`, payload);
  }

  confirm(id: string) {
    return this.api.post<ItemResponse<SaleOrder>>(`/orders/${id}/confirm`);
  }

  cancel(id: string) {
    return this.api.post<ItemResponse<SaleOrder>>(`/orders/${id}/cancel`);
  }
}
