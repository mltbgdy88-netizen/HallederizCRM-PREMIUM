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
}
