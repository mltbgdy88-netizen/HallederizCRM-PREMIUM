import type { Customer, Offer } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
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
  if (!dataSourceConfig.useDemoData) {
    const [offersResponse, customersResponse] = await Promise.all([sdk.offers.list(), sdk.customers.list()]);
    return {
      offers: offersResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    offers: await getOfferMockData(),
    customers
  };
}

export async function getOfferDetail(offerId?: string, customerId?: string | null): Promise<OfferDetailQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [offersResponse, customersResponse] = await Promise.all([sdk.offers.list(), sdk.customers.list()]);
    const offer = offerId
      ? (await sdk.offers.detail(offerId)).item ?? null
      : await getNewOfferDraft(customerId);

    return {
      offer,
      offers: offersResponse.items,
      customers: customersResponse.items
    };
  }

  const offers = await getOfferMockData();
  const offer = offerId ? offers.find((item) => item.id === offerId || item.offerNo === offerId) ?? null : await getNewOfferDraft(customerId);

  return {
    offer,
    offers,
    customers
  };
}
