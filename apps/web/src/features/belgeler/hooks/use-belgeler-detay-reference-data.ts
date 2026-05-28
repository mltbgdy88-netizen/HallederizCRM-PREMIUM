"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  BELGELER_DETAY_REFERENCE_INITIAL,
  loadBelgelerDetayReferenceDemo,
  loadBelgelerDetayReferenceLive
} from "../adapters/belgeler-detay-reference-adapter";

export function useBelgelerDetayReferenceData() {
  return useReferenceData({
    loadDemo: loadBelgelerDetayReferenceDemo,
    loadLive: loadBelgelerDetayReferenceLive,
    initialData: BELGELER_DETAY_REFERENCE_INITIAL
  });
}
