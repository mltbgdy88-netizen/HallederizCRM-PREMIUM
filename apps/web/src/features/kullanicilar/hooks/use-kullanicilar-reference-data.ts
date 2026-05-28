"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  KULLANICILAR_REFERENCE_INITIAL,
  loadKullanicilarReferenceDemo,
  loadKullanicilarReferenceLive
} from "../adapters/kullanicilar-reference-adapter";

export function useKullanicilarReferenceData() {
  return useReferenceData({
    loadDemo: loadKullanicilarReferenceDemo,
    loadLive: loadKullanicilarReferenceLive,
    initialData: KULLANICILAR_REFERENCE_INITIAL
  });
}
