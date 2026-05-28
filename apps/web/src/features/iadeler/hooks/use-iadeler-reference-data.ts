"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadIadelerReferenceDemo,
  loadIadelerReferenceLive,
  IADELER_REFERENCE_INITIAL,
  type IadelerReferenceSnapshot
} from "../adapters/iadeler-reference-adapter";

export function useIadelerReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<IadelerReferenceSnapshot>({
    loadDemo: loadIadelerReferenceDemo,
    loadLive: loadIadelerReferenceLive,
    initialData: IADELER_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext }),
    [data, loading, loadFailed, isDemo, getContext]
  );
}
