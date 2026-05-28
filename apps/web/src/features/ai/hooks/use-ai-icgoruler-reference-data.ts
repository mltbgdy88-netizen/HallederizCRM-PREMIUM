"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  AI_ICGORULER_REFERENCE_INITIAL,
  loadAiIcgorulerReferenceDemo,
  loadAiIcgorulerReferenceLive
} from "../adapters/ai-reference-adapter";

export function useAiIcgorulerReferenceData() {
  return useReferenceData({
    loadDemo: loadAiIcgorulerReferenceDemo,
    loadLive: loadAiIcgorulerReferenceLive,
    initialData: AI_ICGORULER_REFERENCE_INITIAL
  });
}
