"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  KULLANICILAR_ROLLER_REFERENCE_INITIAL,
  loadKullanicilarRollerReferenceDemo,
  loadKullanicilarRollerReferenceLive
} from "../adapters/kullanicilar-roller-reference-adapter";

export function useKullanicilarRollerReferenceData() {
  return useReferenceData({
    loadDemo: loadKullanicilarRollerReferenceDemo,
    loadLive: loadKullanicilarRollerReferenceLive,
    initialData: KULLANICILAR_ROLLER_REFERENCE_INITIAL
  });
}
