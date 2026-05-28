"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadFaturalarReferenceDemo,
  loadFaturalarReferenceLive,
  FATURALAR_REFERENCE_INITIAL,
  type FaturalarReferenceSnapshot
} from "../adapters/faturalar-reference-adapter";

export function useFaturalarReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<FaturalarReferenceSnapshot>({
    loadDemo: loadFaturalarReferenceDemo,
    loadLive: loadFaturalarReferenceLive,
    initialData: FATURALAR_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
