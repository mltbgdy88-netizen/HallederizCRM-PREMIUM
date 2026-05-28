"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  FABRIKALAR_STOK_REFERENCE_INITIAL,
  loadFabrikalarStokReferenceDemo,
  loadFabrikalarStokReferenceLive
} from "../adapters/fabrikalar-stok-reference-adapter";

export function useFabrikalarStokReferenceData() {
  return useReferenceData({
    loadDemo: loadFabrikalarStokReferenceDemo,
    loadLive: loadFabrikalarStokReferenceLive,
    initialData: FABRIKALAR_STOK_REFERENCE_INITIAL
  });
}
