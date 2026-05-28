"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  SIPARISLER_YENI_HUB_REFERENCE_INITIAL,
  loadSiparislerYeniHubReferenceDemo,
  loadSiparislerYeniHubReferenceLive
} from "../adapters/siparisler-yeni-hub-reference-adapter";

export function useSiparislerYeniHubReferenceData() {
  return useReferenceData({
    loadDemo: loadSiparislerYeniHubReferenceDemo,
    loadLive: loadSiparislerYeniHubReferenceLive,
    initialData: SIPARISLER_YENI_HUB_REFERENCE_INITIAL
  });
}
