"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  TAHSILATLAR_YENI_FORM_REFERENCE_INITIAL,
  loadTahsilatlarYeniFormReferenceDemo,
  loadTahsilatlarYeniFormReferenceLive
} from "../adapters/tahsilatlar-yeni-form-reference-adapter";

export function useTahsilatlarYeniFormReferenceData() {
  return useReferenceData({
    loadDemo: loadTahsilatlarYeniFormReferenceDemo,
    loadLive: loadTahsilatlarYeniFormReferenceLive,
    initialData: TAHSILATLAR_YENI_FORM_REFERENCE_INITIAL
  });
}
