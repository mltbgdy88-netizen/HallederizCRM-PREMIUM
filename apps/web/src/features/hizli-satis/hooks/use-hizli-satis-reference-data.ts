"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  HIZLI_SATIS_REFERENCE_INITIAL,
  loadHizliSatisReferenceDemo,
  loadHizliSatisReferenceLive
} from "../adapters/hizli-satis-reference-adapter";

export function useHizliSatisReferenceData() {
  return useReferenceData({
    loadDemo: loadHizliSatisReferenceDemo,
    loadLive: loadHizliSatisReferenceLive,
    initialData: HIZLI_SATIS_REFERENCE_INITIAL
  });
}
