"use client";

import { useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  GELEN_KUTU_REFERENCE_INITIAL,
  loadGelenKutuReferenceDemo,
  loadGelenKutuReferenceLive,
  type GelenKutuReferenceSnapshot
} from "../adapters/gelen-kutu-reference-adapter";

export function useGelenKutuReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<GelenKutuReferenceSnapshot>({
    loadDemo: loadGelenKutuReferenceDemo,
    loadLive: loadGelenKutuReferenceLive,
    initialData: GELEN_KUTU_REFERENCE_INITIAL
  });

  return useMemo(
    () => ({
      ...data,
      loading,
      loadFailed,
      isDemo
    }),
    [data, loading, loadFailed, isDemo]
  );
}
