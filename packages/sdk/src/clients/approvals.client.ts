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
  approve(id: string) {
    return this.api.post<ItemResponse<Approval>>(`/approvals/${id}/approve`);
  }
  reject(id: string) {
    return this.api.post<ItemResponse<Approval>>(`/approvals/${id}/reject`);
  }
  execute(id: string) {
    return this.api.post<
      ItemResponse<Approval> & {
        execution?: unknown;
      }
    >(`/approvals/${id}/execute`);
  }
}
