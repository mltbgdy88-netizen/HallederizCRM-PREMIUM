// @ts-nocheck
"use client";

import { useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  loadWhatsAppReferenceDemo,
  loadWhatsAppReferenceLive,
  WHATSAPP_REFERENCE_INITIAL,
  type WhatsAppReferenceSnapshot
} from "../adapters/whatsapp-reference-adapter";

export function useWhatsAppReferenceData(options?: { demoOnly?: boolean }) {
  const { data, loading, loadFailed, isDemo } = useReferenceData<WhatsAppReferenceSnapshot>({
    loadDemo: loadWhatsAppReferenceDemo,
    loadLive: loadWhatsAppReferenceLive,
    initialData: WHATSAPP_REFERENCE_INITIAL,
    demoOnly: options?.demoOnly
  });

  return useMemo(() => ({ ...data, loading, loadFailed, isDemo }), [data, loading, loadFailed, isDemo]);
}

