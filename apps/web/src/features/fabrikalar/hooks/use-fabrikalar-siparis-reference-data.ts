"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  FABRIKALAR_SIPARIS_REFERENCE_INITIAL,
  loadFabrikalarSiparisReferenceDemo,
  loadFabrikalarSiparisReferenceLive
} from "../adapters/fabrikalar-siparis-reference-adapter";

export function useFabrikalarSiparisReferenceData() {
  return useReferenceData({
    loadDemo: loadFabrikalarSiparisReferenceDemo,
    loadLive: loadFabrikalarSiparisReferenceLive,
    initialData: FABRIKALAR_SIPARIS_REFERENCE_INITIAL
  });
}
