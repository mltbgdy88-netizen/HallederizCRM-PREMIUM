"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  BELGELER_YENI_FORM_REFERENCE_INITIAL,
  loadBelgelerYeniFormReferenceDemo,
  loadBelgelerYeniFormReferenceLive
} from "../adapters/belgeler-yeni-form-reference-adapter";

export function useBelgelerYeniFormReferenceData() {
  return useReferenceData({
    loadDemo: loadBelgelerYeniFormReferenceDemo,
    loadLive: loadBelgelerYeniFormReferenceLive,
    initialData: BELGELER_YENI_FORM_REFERENCE_INITIAL
  });
}
