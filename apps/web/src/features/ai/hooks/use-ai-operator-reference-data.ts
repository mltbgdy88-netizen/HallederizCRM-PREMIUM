// @ts-nocheck
"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  AI_OPERATOR_REFERENCE_INITIAL,
  loadAiOperatorReferenceDemo,
  loadAiOperatorReferenceLive
} from "../adapters/ai-reference-adapter";

export function useAiOperatorReferenceData() {
  return useReferenceData({
    loadDemo: loadAiOperatorReferenceDemo,
    loadLive: loadAiOperatorReferenceLive,
    initialData: AI_OPERATOR_REFERENCE_INITIAL
  });
}

