"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadOnaylarReferenceDemo,
  loadOnaylarReferenceLive,
  ONAYLAR_REFERENCE_INITIAL,
  type OnaylarReferenceSnapshot
} from "../adapters/onaylar-reference-adapter";

export function useOnaylarReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<OnaylarReferenceSnapshot>({
    loadDemo: loadOnaylarReferenceDemo,
    loadLive: loadOnaylarReferenceLive,
    initialData: ONAYLAR_REFERENCE_INITIAL
  });

  const getDetailForId = useCallback((id: string) => data.getDetailForId(id), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getDetailForId }),
    [data, loading, loadFailed, isDemo, getDetailForId]
  );
}
