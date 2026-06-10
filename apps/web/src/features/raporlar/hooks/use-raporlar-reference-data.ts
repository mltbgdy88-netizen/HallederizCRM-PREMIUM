"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadRaporlarReferenceDemo,
  loadRaporlarReferenceLive,
  RAPORLAR_REFERENCE_INITIAL,
  type RaporlarReferenceSnapshot
} from "../adapters/raporlar-reference-adapter";

export function useRaporlarReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<RaporlarReferenceSnapshot>({
    loadDemo: loadRaporlarReferenceDemo,
    loadLive: loadRaporlarReferenceLive,
    initialData: RAPORLAR_REFERENCE_INITIAL
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
