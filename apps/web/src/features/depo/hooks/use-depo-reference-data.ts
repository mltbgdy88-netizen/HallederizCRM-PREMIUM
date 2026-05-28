"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  DEPO_REFERENCE_INITIAL,
  loadDepoReferenceDemo,
  loadDepoReferenceLive
} from "../adapters/depo-reference-adapter";

export function useDepoReferenceData() {
  return useReferenceData({
    loadDemo: loadDepoReferenceDemo,
    loadLive: loadDepoReferenceLive,
    initialData: DEPO_REFERENCE_INITIAL
  });
}
