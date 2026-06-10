"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  DEPO_FIS_DETAY_REFERENCE_INITIAL,
  loadDepoFisDetayReferenceDemo,
  loadDepoFisDetayReferenceLive
} from "../adapters/depo-fis-detay-reference-adapter";

export function useDepoFisDetayReferenceData() {
  return useReferenceData({
    loadDemo: loadDepoFisDetayReferenceDemo,
    loadLive: loadDepoFisDetayReferenceLive,
    initialData: DEPO_FIS_DETAY_REFERENCE_INITIAL
  });
}
