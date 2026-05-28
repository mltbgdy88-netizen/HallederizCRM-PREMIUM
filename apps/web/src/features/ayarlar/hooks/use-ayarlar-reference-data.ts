"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  AYARLAR_REFERENCE_INITIAL,
  loadAyarlarReferenceDemo,
  loadAyarlarReferenceLive
} from "../adapters/ayarlar-reference-adapter";

export function useAyarlarReferenceData() {
  return useReferenceData({
    loadDemo: loadAyarlarReferenceDemo,
    loadLive: loadAyarlarReferenceLive,
    initialData: AYARLAR_REFERENCE_INITIAL
  });
}
