"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  GOREVLER_DETAY_REFERENCE_INITIAL,
  loadGorevlerDetayReferenceDemo,
  loadGorevlerDetayReferenceLive
} from "../adapters/gorevler-detay-reference-adapter";

export function useGorevlerDetayReferenceData() {
  return useReferenceData({
    loadDemo: loadGorevlerDetayReferenceDemo,
    loadLive: loadGorevlerDetayReferenceLive,
    initialData: GOREVLER_DETAY_REFERENCE_INITIAL
  });
}
