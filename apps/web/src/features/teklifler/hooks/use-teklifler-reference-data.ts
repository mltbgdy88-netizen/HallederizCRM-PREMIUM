"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadTekliflerReferenceDemo,
  loadTekliflerReferenceLive,
  TEKLIFLER_REFERENCE_INITIAL,
  type TekliflerReferenceSnapshot
} from "../adapters/teklifler-reference-adapter";

export function useTekliflerReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<TekliflerReferenceSnapshot>({
    loadDemo: loadTekliflerReferenceDemo,
    loadLive: loadTekliflerReferenceLive,
    initialData: TEKLIFLER_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
