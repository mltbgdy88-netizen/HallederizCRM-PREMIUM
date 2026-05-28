"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";

/** Resolves cari id from prop, `?customerId=` / `?id=`, or demo primary customer. */
export function useCarilerCustomerId(override?: string): string {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("customerId") ?? searchParams.get("id");
  const resolved = (override ?? fromQuery ?? REFERENCE_ROUTE_IDS.customerId).trim();
  return resolved || REFERENCE_ROUTE_IDS.customerId;
}
