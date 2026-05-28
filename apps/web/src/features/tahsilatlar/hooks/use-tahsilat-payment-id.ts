"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";

/** Resolves tahsilat id from prop, `?paymentId=` / `?id=`, or demo primary payment. */
export function useTahsilatPaymentId(override?: string): string {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("paymentId") ?? searchParams.get("id");
  const resolved = (override ?? fromQuery ?? REFERENCE_ROUTE_IDS.paymentId).trim();
  return resolved || REFERENCE_ROUTE_IDS.paymentId;
}
