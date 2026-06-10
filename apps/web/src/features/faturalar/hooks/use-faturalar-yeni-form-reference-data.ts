"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  FATURALAR_YENI_FORM_REFERENCE_INITIAL,
  loadFaturalarYeniFormReferenceDemo,
  loadFaturalarYeniFormReferenceLive
} from "../adapters/faturalar-yeni-form-reference-adapter";

export function useFaturalarYeniFormReferenceData() {
  return useReferenceData({
    loadDemo: loadFaturalarYeniFormReferenceDemo,
    loadLive: loadFaturalarYeniFormReferenceLive,
    initialData: FATURALAR_YENI_FORM_REFERENCE_INITIAL
  });
}
