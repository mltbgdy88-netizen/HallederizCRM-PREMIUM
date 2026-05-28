"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  HIZLI_ISLEM_SATIS_MASASI_INITIAL,
  loadHizliIslemSatisMasasiDemo,
  loadHizliIslemSatisMasasiLive,
  type HizliIslemSatisMasasiSnapshot
} from "../adapters/hizli-islem-satis-masasi-reference-adapter";

export function useHizliIslemSatisMasasiReferenceData() {
  return useReferenceData<HizliIslemSatisMasasiSnapshot>({
    loadDemo: loadHizliIslemSatisMasasiDemo,
    loadLive: loadHizliIslemSatisMasasiLive,
    initialData: HIZLI_ISLEM_SATIS_MASASI_INITIAL
  });
}
