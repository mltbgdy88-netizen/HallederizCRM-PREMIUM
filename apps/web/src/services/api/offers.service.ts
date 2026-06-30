import type { Offer, OfferFollowUp } from "@hallederiz/types";
import { apiClient, dataSourceConfig } from "../../lib/data-source";

export async function createOfferRecord(payload: Partial<Offer>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Offer), id: payload.id ?? `offer_${Date.now()}` } as Offer;
  }
  const response = await apiClient.post<{ item: Offer }>("/offers", payload);
  return response.item;
}

export async function updateOfferRecord(offerId: string, payload: Partial<Offer>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Offer), id: offerId } as Offer;
  }
  const response = await apiClient.patch<{ item: Offer }>(`/offers/${offerId}`, payload);
  return response.item;
}

export async function createOfferFollowUp(offerId: string, payload: Partial<OfferFollowUp>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as OfferFollowUp), id: payload.id ?? `followup_${Date.now()}`, offerId } as OfferFollowUp;
  }
  const response = await apiClient.post<{ item: Offer }>(`/offers/${offerId}/followups`, payload);
  return response.item;
}
