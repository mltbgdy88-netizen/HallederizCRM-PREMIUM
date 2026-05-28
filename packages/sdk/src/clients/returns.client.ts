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
}
