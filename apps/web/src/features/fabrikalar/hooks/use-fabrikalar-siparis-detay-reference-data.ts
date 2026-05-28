"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  FABRIKALAR_SIPARIS_DETAY_REFERENCE_INITIAL,
  loadFabrikalarSiparisDetayReferenceDemo,
  loadFabrikalarSiparisDetayReferenceLive
} from "../adapters/fabrikalar-siparis-detay-reference-adapter";

export function useFabrikalarSiparisDetayReferenceData() {
  return useReferenceData({
    loadDemo: loadFabrikalarSiparisDetayReferenceDemo,
    loadLive: loadFabrikalarSiparisDetayReferenceLive,
    initialData: FABRIKALAR_SIPARIS_DETAY_REFERENCE_INITIAL
  });
}
