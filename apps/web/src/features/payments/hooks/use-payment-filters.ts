"use client";

import { useState } from "react";
import { defaultPaymentFilters, type PaymentFilters } from "../schemas/payment-filter-schema";

export function usePaymentFilters() {
  const [filters, setFilters] = useState<PaymentFilters>(defaultPaymentFilters);

  function updateFilter<Key extends keyof PaymentFilters>(key: Key, value: PaymentFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(defaultPaymentFilters);
  }

  return {
    filters,
    updateFilter,
    resetFilters
  };
}
