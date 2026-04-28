import type { Offer } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class OffersClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<Offer>>("/offers");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<Offer>>(`/offers/${id}`);
  }

  convertToOrder(id: string) {
    return this.api.post<ItemResponse<unknown>>(`/offers/${id}/convert-to-order`);
  }
}
