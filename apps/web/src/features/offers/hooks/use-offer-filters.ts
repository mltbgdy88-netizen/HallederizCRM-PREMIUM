"use client";

import { useState } from "react";
import { defaultOfferFilters, type OfferFilters } from "../schemas/offer-filter-schema";

export function useOfferFilters() {
  const [filters, setFilters] = useState<OfferFilters>(defaultOfferFilters);

  function updateFilter<Key extends keyof OfferFilters>(key: Key, value: OfferFilters[Key]) {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetFilters() {
    setFilters(defaultOfferFilters);
  }

  return {
    filters,
    updateFilter,
    resetFilters
  };
}
