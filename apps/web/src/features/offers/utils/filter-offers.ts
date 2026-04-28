import type { Offer } from "@hallederiz/types";
import type { OfferFilters } from "../schemas/offer-filter-schema";

export function filterOffers(offers: Offer[], filters: OfferFilters): Offer[] {
  return offers.filter((offer) => {
    if (filters.customerId && offer.customerId !== filters.customerId) {
      return false;
    }

    if (filters.status && offer.status !== filters.status) {
      return false;
    }

    if (filters.convertedOnly && offer.status !== "converted") {
      return false;
    }

    if (filters.followUpState === "planned" && !offer.followUps.some((followUp) => !followUp.completedAt)) {
      return false;
    }

    if (filters.followUpState === "waiting" && !offer.followUps.some((followUp) => followUp.responseState === "waiting")) {
      return false;
    }

    if (filters.followUpState === "completed" && !offer.followUps.some((followUp) => followUp.completedAt)) {
      return false;
    }

    if (filters.dateRange === "all") {
      return true;
    }

    const createdAt = new Date(offer.createdAt);
    const now = new Date("2026-04-28T12:00:00.000Z");
    const diffMs = now.getTime() - createdAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (filters.dateRange === "today") {
      return diffDays <= 1;
    }

    if (filters.dateRange === "week") {
      return diffDays <= 7;
    }

    return diffDays <= 31;
  });
}
