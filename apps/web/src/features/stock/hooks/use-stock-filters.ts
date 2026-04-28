"use client";

import { useState } from "react";
import { defaultStockFilters, type StockFilters } from "../schemas/stock-filter-schema";

export function useStockFilters() {
  const [filters, setFilters] = useState<StockFilters>(defaultStockFilters);

  function updateFilter<Key extends keyof StockFilters>(key: Key, value: StockFilters[Key]) {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetFilters() {
    setFilters(defaultStockFilters);
  }

  return {
    filters,
    updateFilter,
    resetFilters
  };
}
