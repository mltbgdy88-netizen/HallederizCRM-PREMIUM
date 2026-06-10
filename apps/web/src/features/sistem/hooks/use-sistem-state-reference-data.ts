"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  SISTEM_STATE_REFERENCE_INITIAL,
  loadSistemStateReferenceDemo,
  loadSistemStateReferenceLive
} from "../adapters/sistem-state-reference-adapter";

export function useSistemStateReferenceData() {
  return useReferenceData({
    loadDemo: loadSistemStateReferenceDemo,
    loadLive: loadSistemStateReferenceLive,
    initialData: SISTEM_STATE_REFERENCE_INITIAL
  });
}
