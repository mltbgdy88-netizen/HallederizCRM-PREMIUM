"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";

export function useTeklifOfferId(override?: string): string {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("offerId") ?? searchParams.get("id");
  const resolved = (override ?? fromQuery ?? REFERENCE_ROUTE_IDS.offerId).trim();
  return resolved || REFERENCE_ROUTE_IDS.offerId;
}
