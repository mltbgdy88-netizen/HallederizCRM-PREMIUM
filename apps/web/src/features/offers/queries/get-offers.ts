import type { Customer, Offer } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getNewOfferDraft, getOfferMockData } from "./offer-mock-data";

export interface OffersQueryResult {
  offers: Offer[];
  customers: Customer[];
}

export interface OfferDetailQueryResult extends OffersQueryResult {
  offer: Offer | null;
}

export async function getOffers(): Promise<OffersQueryResult> {
  return {
    offers: await getOfferMockData(),
    customers
  };
}

export async function getOfferDetail(offerId?: string, customerId?: string | null): Promise<OfferDetailQueryResult> {
  const offers = await getOfferMockData();
  const offer = offerId ? offers.find((item) => item.id === offerId || item.offerNo === offerId) ?? null : await getNewOfferDraft(customerId);

  return {
    offer,
    offers,
    customers
  };
}
