"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadTahsilatlarReferenceDemo,
  loadTahsilatlarReferenceLive,
  TAHSILATLAR_REFERENCE_INITIAL,
  type TahsilatlarReferenceSnapshot
} from "../adapters/tahsilatlar-reference-adapter";

export function useTahsilatlarReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<TahsilatlarReferenceSnapshot>({
    loadDemo: loadTahsilatlarReferenceDemo,
    loadLive: loadTahsilatlarReferenceLive,
    initialData: TAHSILATLAR_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
