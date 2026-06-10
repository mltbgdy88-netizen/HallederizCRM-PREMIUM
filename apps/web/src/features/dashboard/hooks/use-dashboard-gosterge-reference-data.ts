// @ts-nocheck
"use client";

import { useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  DASHBOARD_GOSTERGE_REFERENCE_INITIAL,
  loadDashboardGostergeReferenceDemo,
  loadDashboardGostergeReferenceLive,
  type DashboardGostergeReferenceSnapshot
} from "../adapters/dashboard-gosterge-reference-adapter";

export function useDashboardGostergeReferenceData(options?: { demoOnly?: boolean }) {
  const { data, loading, loadFailed, isDemo } = useReferenceData<DashboardGostergeReferenceSnapshot>({
    loadDemo: loadDashboardGostergeReferenceDemo,
    loadLive: loadDashboardGostergeReferenceLive,
    initialData: DASHBOARD_GOSTERGE_REFERENCE_INITIAL,
    demoOnly: options?.demoOnly
  });

  return useMemo(() => ({ ...data, loading, loadFailed, isDemo }), [data, loading, loadFailed, isDemo]);
}

