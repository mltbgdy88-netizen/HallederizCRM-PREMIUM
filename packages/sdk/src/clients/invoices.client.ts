import type { Invoice } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class InvoicesClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<Invoice>>("/invoices");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<Invoice>>(`/invoices/${id}`);
  }

  create(payload: Partial<Invoice>) {
    return this.api.post<ItemResponse<Invoice>>("/invoices", payload);
  }

  issue(id: string) {
    return this.api.post<ItemResponse<Invoice>>(`/invoices/${id}/issue`);
  }

  cancel(id: string) {
    return this.api.post<ItemResponse<Invoice>>(`/invoices/${id}/cancel`);
  }
}
