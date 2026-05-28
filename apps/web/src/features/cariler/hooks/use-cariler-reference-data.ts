"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  CARILER_REFERENCE_INITIAL,
  loadCarilerReferenceDemo,
  loadCarilerReferenceLive,
  type CarilerReferenceSnapshot
} from "../adapters/cariler-reference-adapter";

export function useCarilerReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<CarilerReferenceSnapshot>({
    loadDemo: loadCarilerReferenceDemo,
    loadLive: loadCarilerReferenceLive,
    initialData: CARILER_REFERENCE_INITIAL
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
