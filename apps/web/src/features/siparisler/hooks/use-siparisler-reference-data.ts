"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadSiparislerReferenceDemo,
  loadSiparislerReferenceLive,
  SIPARISLER_REFERENCE_INITIAL,
  type SiparislerReferenceSnapshot
} from "../adapters/siparisler-reference-adapter";

export function useSiparislerReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<SiparislerReferenceSnapshot>({
    loadDemo: loadSiparislerReferenceDemo,
    loadLive: loadSiparislerReferenceLive,
    initialData: SIPARISLER_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
