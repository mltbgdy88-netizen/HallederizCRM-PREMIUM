import type { Return } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class ReturnsClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<Return>>("/returns");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<Return>>(`/returns/${id}`);
  }

  create(payload: Partial<Return>) {
    return this.api.post<ItemResponse<Return>>("/returns", payload);
  }

  approve(id: string) {
    return this.api.post<ItemResponse<Return>>(`/returns/${id}/approve`);
  }

  receive(id: string) {
    return this.api.post<ItemResponse<Return>>(`/returns/${id}/receive`);
  }

  complete(id: string) {
    return this.api.post<ItemResponse<Return>>(`/returns/${id}/complete`);
  }

  cancel(id: string) {
    return this.api.post<ItemResponse<Return>>(`/returns/${id}/cancel`);
  }
}
