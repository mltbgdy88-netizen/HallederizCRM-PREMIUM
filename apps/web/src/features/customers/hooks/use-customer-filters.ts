"use client";

import { useState } from "react";
import { defaultCustomerFilters, type CustomerFilters } from "../schemas/customer-filter-schema";

export function useCustomerFilters() {
  const [filters, setFilters] = useState<CustomerFilters>(defaultCustomerFilters);

  function updateFilter<Key extends keyof CustomerFilters>(key: Key, value: CustomerFilters[Key]) {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetFilters() {
    setFilters(defaultCustomerFilters);
  }

  return {
    filters,
    updateFilter,
    resetFilters
  };
}
