"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";

/** Resolves teslimat id from prop, `?deliveryId=` / `?id=`, or demo primary delivery. */
export function useTeslimatlarDeliveryId(override?: string): string {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("deliveryId") ?? searchParams.get("id");
  const resolved = (override ?? fromQuery ?? REFERENCE_ROUTE_IDS.deliveryId).trim();
  return resolved || REFERENCE_ROUTE_IDS.deliveryId;
}
