import type { Customer, CustomerAccount, CustomerLedgerEntry } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class CustomersClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<Customer>>("/customers");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<Customer>>(`/customers/${id}`);
  }

  accountSummary(id: string) {
    return this.api.get<ItemResponse<CustomerAccount>>(`/customers/${id}/account-summary`);
  }

  ledger(id: string) {
    return this.api.get<{ items: CustomerLedgerEntry[] }>(`/customers/${id}/ledger`);
  }

  create(payload: Partial<Customer>) {
    return this.api.post<ItemResponse<Customer>>("/customers", payload);
  }

  update(id: string, payload: Partial<Customer>) {
    return this.api.patch<ItemResponse<Customer>>(`/customers/${id}`, payload);
  }
}
