"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  IADELER_YENI_FORM_REFERENCE_INITIAL,
  loadIadelerYeniFormReferenceDemo,
  loadIadelerYeniFormReferenceLive
} from "../adapters/iadeler-yeni-form-reference-adapter";

export function useIadelerYeniFormReferenceData() {
  return useReferenceData({
    loadDemo: loadIadelerYeniFormReferenceDemo,
    loadLive: loadIadelerYeniFormReferenceLive,
    initialData: IADELER_YENI_FORM_REFERENCE_INITIAL
  });
}
