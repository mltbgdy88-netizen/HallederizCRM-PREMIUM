"use client";

import { useCallback, useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadTeslimatlarRotaReferenceDemo,
  loadTeslimatlarRotaReferenceLive,
  TESLIMATLAR_ROTA_REFERENCE_INITIAL,
  type TeslimatlarRotaReferenceSnapshot
} from "../adapters/teslimatlar-rota-reference-adapter";

export function useTeslimatlarRotaReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<TeslimatlarRotaReferenceSnapshot>({
    loadDemo: loadTeslimatlarRotaReferenceDemo,
    loadLive: loadTeslimatlarRotaReferenceLive,
    initialData: TESLIMATLAR_ROTA_REFERENCE_INITIAL
  });

  const getContext = useCallback((rowId: string) => data.getContext(rowId), [data]);
  const getStops = useCallback((rowId: string) => data.getStops(rowId), [data]);

  return useMemo(
    () => ({ ...data, loading, loadFailed, isDemo, getContext, getStops }),
    [data, loading, loadFailed, isDemo, getContext, getStops]
  );
}
