"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";

export function useFaturaInvoiceId(override?: string): string {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("invoiceId") ?? searchParams.get("id");
  const resolved = (override ?? fromQuery ?? REFERENCE_ROUTE_IDS.invoiceId).trim();
  return resolved || REFERENCE_ROUTE_IDS.invoiceId;
}

