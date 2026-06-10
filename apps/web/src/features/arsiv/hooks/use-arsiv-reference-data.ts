"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  ARSIV_REFERENCE_INITIAL,
  loadArsivReferenceDemo,
  loadArsivReferenceLive,
  type ArsivReferenceSnapshot
} from "../adapters/arsiv-reference-adapter";

export function useArsivReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<ArsivReferenceSnapshot>({
    loadDemo: loadArsivReferenceDemo,
    loadLive: loadArsivReferenceLive,
    initialData: ARSIV_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({
      ...data,
      loading,
      loadFailed,
      isDemo,
      getContext
    }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
