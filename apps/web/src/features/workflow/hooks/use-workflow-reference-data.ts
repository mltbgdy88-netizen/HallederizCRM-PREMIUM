"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  WORKFLOW_REFERENCE_INITIAL,
  loadWorkflowReferenceDemo,
  loadWorkflowReferenceLive
} from "../adapters/workflow-reference-adapter";

export function useWorkflowReferenceData() {
  return useReferenceData({
    loadDemo: loadWorkflowReferenceDemo,
    loadLive: loadWorkflowReferenceLive,
    initialData: WORKFLOW_REFERENCE_INITIAL
  });
}
