"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadStokReferenceDemo,
  loadStokReferenceLive,
  STOK_REFERENCE_INITIAL,
  type StokReferenceSnapshot
} from "../adapters/stok-reference-adapter";

export function useStokReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<StokReferenceSnapshot>({
    loadDemo: loadStokReferenceDemo,
    loadLive: loadStokReferenceLive,
    initialData: STOK_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
