"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  GOREVLER_REFERENCE_INITIAL,
  loadGorevlerReferenceDemo,
  loadGorevlerReferenceLive
} from "../adapters/gorevler-reference-adapter";

export function useGorevlerReferenceData() {
  return useReferenceData({
    loadDemo: loadGorevlerReferenceDemo,
    loadLive: loadGorevlerReferenceLive,
    initialData: GOREVLER_REFERENCE_INITIAL
  });
}
