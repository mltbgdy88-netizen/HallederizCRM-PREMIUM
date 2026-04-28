import type { Approval } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class ApprovalsClient {
  constructor(private readonly api: ApiClient) {}
  list() {
    return this.api.get<ListResponse<Approval>>("/approvals");
  }
  detail(id: string) {
    return this.api.get<ItemResponse<Approval>>(`/approvals/${id}`);
  }
}
