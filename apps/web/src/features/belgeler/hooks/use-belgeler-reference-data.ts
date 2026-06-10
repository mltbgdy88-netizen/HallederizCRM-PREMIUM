"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  BELGELER_REFERENCE_INITIAL,
  loadBelgelerReferenceDemo,
  loadBelgelerReferenceLive,
  type BelgelerReferenceSnapshot
} from "../adapters/belgeler-reference-adapter";

export function useBelgelerReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<BelgelerReferenceSnapshot>({
    loadDemo: loadBelgelerReferenceDemo,
    loadLive: loadBelgelerReferenceLive,
    initialData: BELGELER_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
