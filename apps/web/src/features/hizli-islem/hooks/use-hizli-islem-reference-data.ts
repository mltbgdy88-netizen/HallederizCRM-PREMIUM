"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  HIZLI_ISLEM_MERKEZI_INITIAL,
  loadHizliIslemMerkeziDemo,
  loadHizliIslemMerkeziLive,
  type HizliIslemMerkeziSnapshot
} from "../adapters/hizli-islem-reference-adapter";

export function useHizliIslemReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<HizliIslemMerkeziSnapshot>({
    loadDemo: loadHizliIslemMerkeziDemo,
    loadLive: loadHizliIslemMerkeziLive,
    initialData: HIZLI_ISLEM_MERKEZI_INITIAL
  });

  return {
    data,
    loading,
    loadFailed,
    isDemo,
    demoBanner: data.demoBanner
  };
}
