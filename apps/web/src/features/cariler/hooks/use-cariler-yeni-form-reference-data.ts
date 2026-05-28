"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  CARILER_YENI_FORM_REFERENCE_INITIAL,
  loadCarilerYeniFormReferenceDemo,
  loadCarilerYeniFormReferenceLive
} from "../adapters/cariler-yeni-form-reference-adapter";

export function useCarilerYeniFormReferenceData() {
  return useReferenceData({
    loadDemo: loadCarilerYeniFormReferenceDemo,
    loadLive: loadCarilerYeniFormReferenceLive,
    initialData: CARILER_YENI_FORM_REFERENCE_INITIAL
  });
}
