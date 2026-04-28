"use client";

import { useState } from "react";
import { defaultOrderFilters, type OrderFilters } from "../schemas/order-filter-schema";

export function useOrderFilters() {
  const [filters, setFilters] = useState<OrderFilters>(defaultOrderFilters);

  function updateFilter<Key extends keyof OrderFilters>(key: Key, value: OrderFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(defaultOrderFilters);
  }

  return {
    filters,
    updateFilter,
    resetFilters
  };
}
