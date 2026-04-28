import type { Offer, OfferFollowUp } from "@hallederiz/types";
import { createOfferFollowUp, createOfferRecord, updateOfferRecord } from "../../../services/api/offers.service";

export async function createOfferMutation(payload: Partial<Offer>) {
  return createOfferRecord(payload);
}

export async function updateOfferMutation(offerId: string, payload: Partial<Offer>) {
  return updateOfferRecord(offerId, payload);
}

export async function addOfferFollowUpMutation(offerId: string, payload: Partial<OfferFollowUp>) {
  return createOfferFollowUp(offerId, payload);
}
