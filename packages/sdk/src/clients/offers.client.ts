import type { Offer, OfferLine } from "@hallederiz/types";
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

  create(payload: Partial<Offer>) {
    return this.api.post<ItemResponse<Offer>>("/offers", payload);
  }

  update(id: string, payload: Partial<Offer>) {
    return this.api.patch<ItemResponse<Offer>>(`/offers/${id}`, payload);
  }

  addLine(id: string, payload: Partial<OfferLine>) {
    return this.api.post<ItemResponse<Offer>>(`/offers/${id}/lines`, payload);
  }

  send(id: string) {
    return this.api.post<ItemResponse<Offer>>(`/offers/${id}/send`);
  }
}
