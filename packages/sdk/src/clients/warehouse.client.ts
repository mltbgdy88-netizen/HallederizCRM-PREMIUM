import type { WarehouseOrder } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class WarehouseClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<WarehouseOrder>>("/warehouse-orders");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<WarehouseOrder>>(`/warehouse-orders/${id}`);
  }
}
