"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  ERP_REFERENCE_INITIAL,
  loadErpReferenceDemo,
  loadErpReferenceLive
} from "../adapters/erp-reference-adapter";

export function useErpReferenceData() {
  return useReferenceData({
    loadDemo: loadErpReferenceDemo,
    loadLive: loadErpReferenceLive,
    initialData: ERP_REFERENCE_INITIAL
  });
}
