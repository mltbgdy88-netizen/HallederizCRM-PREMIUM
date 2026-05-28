"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";

export function useIadeReturnId(override?: string): string {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("returnId") ?? searchParams.get("id");
  const resolved = (override ?? fromQuery ?? REFERENCE_ROUTE_IDS.returnId).trim();
  return resolved || REFERENCE_ROUTE_IDS.returnId;
}

