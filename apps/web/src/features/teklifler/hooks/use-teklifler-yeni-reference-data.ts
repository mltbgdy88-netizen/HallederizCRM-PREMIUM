"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  TEKLIFLER_YENI_REFERENCE_INITIAL,
  loadTekliflerYeniReferenceDemo,
  loadTekliflerYeniReferenceLive
} from "../adapters/teklifler-yeni-reference-adapter";

export function useTekliflerYeniReferenceData() {
  return useReferenceData({
    loadDemo: loadTekliflerYeniReferenceDemo,
    loadLive: loadTekliflerYeniReferenceLive,
    initialData: TEKLIFLER_YENI_REFERENCE_INITIAL
  });
}
