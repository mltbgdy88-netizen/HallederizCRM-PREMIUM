"use client";

import { useState } from "react";
import { defaultWarehouseTaskFilters, type WarehouseTaskFilters } from "../schemas/warehouse-filter-schema";

export function useWarehouseTaskFilters() {
  const [filters, setFilters] = useState<WarehouseTaskFilters>(defaultWarehouseTaskFilters);

  function updateFilter<Key extends keyof WarehouseTaskFilters>(key: Key, value: WarehouseTaskFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(defaultWarehouseTaskFilters);
  }

  return {
    filters,
    updateFilter,
    resetFilters
  };
}
