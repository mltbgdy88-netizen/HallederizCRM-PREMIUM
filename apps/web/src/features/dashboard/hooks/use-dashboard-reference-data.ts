"use client";

import { useMemo } from "react";
import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  DASHBOARD_REFERENCE_INITIAL,
  loadDashboardReferenceDemo,
  loadDashboardReferenceLive,
  type DashboardReferenceSnapshot
} from "../adapters/dashboard-reference-adapter";

export function useDashboardReferenceData() {
  const { data, loading, loadFailed, isDemo } = useReferenceData<DashboardReferenceSnapshot>({
    loadDemo: loadDashboardReferenceDemo,
    loadLive: loadDashboardReferenceLive,
    initialData: DASHBOARD_REFERENCE_INITIAL
  });

  return useMemo(() => ({ ...data, loading, loadFailed, isDemo }), [data, loading, loadFailed, isDemo]);
}
