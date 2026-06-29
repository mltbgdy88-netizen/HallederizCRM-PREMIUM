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

  create(payload: Partial<Delivery>) {
    return this.api.post<ItemResponse<Delivery>>("/deliveries", payload);
  }

  validate(id: string) {
    return this.api.post<ItemResponse<Delivery>>(`/deliveries/${id}/validate`);
  }

  complete(id: string) {
    return this.api.post<ItemResponse<Delivery>>(`/deliveries/${id}/complete`);
  }

  rollback(id: string) {
    return this.api.post<ItemResponse<Delivery>>(`/deliveries/${id}/rollback`);
  }
}
