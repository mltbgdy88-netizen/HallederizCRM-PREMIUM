"use client";

import { useEffect, useMemo, useState } from "react";
import { mapOfferToRow } from "../mappers/map-offer-row";
import { getOffers, type OffersQueryResult } from "../queries/get-offers";
import { filterOffers } from "../utils/filter-offers";
import type { OfferFilters } from "../schemas/offer-filter-schema";

const emptyData: OffersQueryResult = {
  offers: [],
  customers: []
};

export function useOffersData(filters: OfferFilters) {
  const [data, setData] = useState<OffersQueryResult>(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getOffers()
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOffers = useMemo(() => filterOffers(data.offers, filters), [data.offers, filters]);
  const rows = useMemo(
    () =>
      filteredOffers.map((offer) =>
        mapOfferToRow(
          offer,
          data.customers.find((customer) => customer.id === offer.customerId)
        )
      ),
    [data.customers, filteredOffers]
  );

  return {
    loading,
    data,
    offers: data.offers,
    customers: data.customers,
    filteredOffers,
    rows
  };
}
