"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadTeslimatlarReferenceDemo,
  loadTeslimatlarReferenceLive,
  TESLIMATLAR_REFERENCE_INITIAL,
  type TeslimatlarReferenceSnapshot
} from "../adapters/teslimatlar-reference-adapter";

export function useTeslimatlarReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<TeslimatlarReferenceSnapshot>({
    loadDemo: loadTeslimatlarReferenceDemo,
    loadLive: loadTeslimatlarReferenceLive,
    initialData: TESLIMATLAR_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
