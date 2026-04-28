import type { Offer, OfferFollowUp } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";

const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export async function createOfferRecord(payload: Partial<Offer>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Offer), id: payload.id ?? `offer_${Date.now()}` } as Offer;
  }
  const response = await api.post<{ item: Offer }>("/offers", payload);
  return response.item;
}

export async function updateOfferRecord(offerId: string, payload: Partial<Offer>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Offer), id: offerId } as Offer;
  }
  const response = await api.patch<{ item: Offer }>(`/offers/${offerId}`, payload);
  return response.item;
}

export async function createOfferFollowUp(offerId: string, payload: Partial<OfferFollowUp>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as OfferFollowUp), id: payload.id ?? `followup_${Date.now()}`, offerId } as OfferFollowUp;
  }
  const response = await api.post<{ item: Offer }>(`/offers/${offerId}/followups`, payload);
  return response.item;
}
