import type { Delivery } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class DeliveriesClient {
  constructor(private readonly api: ApiClient) {}
  list() {
    return this.api.get<ListResponse<Delivery>>("/deliveries");
  }
  detail(id: string) {
    return this.api.get<ItemResponse<Delivery>>(`/deliveries/${id}`);
  }
}
