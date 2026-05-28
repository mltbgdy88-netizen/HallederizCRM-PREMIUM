"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  TESLIMATLAR_YENI_FORM_REFERENCE_INITIAL,
  loadTeslimatlarYeniFormReferenceDemo,
  loadTeslimatlarYeniFormReferenceLive
} from "../adapters/teslimatlar-yeni-form-reference-adapter";

export function useTeslimatlarYeniFormReferenceData() {
  return useReferenceData({
    loadDemo: loadTeslimatlarYeniFormReferenceDemo,
    loadLive: loadTeslimatlarYeniFormReferenceLive,
    initialData: TESLIMATLAR_YENI_FORM_REFERENCE_INITIAL
  });
}
