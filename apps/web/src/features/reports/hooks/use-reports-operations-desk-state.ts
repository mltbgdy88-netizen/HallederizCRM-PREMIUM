"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { useAuth } from "../../../providers/auth-provider";
import { metricMatchesChip, REPORTS_DEMO_METRICS, REPORTS_USE_DEMO_DATA } from "../data/reports-demo-data";
import type { ReportCategoryChip } from "../types";
import {
  buildReportsReferenceKpis,
  chipToRomTab,
  mapMetricToContext,
  mapMetricToTableRow,
  romTabToChip,
  type RomTabId
} from "../utils/map-reports-to-reference-desk";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface TenantUsageSummary {
  totalEvents: number;
  limitExceeded: boolean;
}

export function useReportsOperationsDeskState() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { session, state } = useAuth();

  const baseRows = useMemo(() => (REPORTS_USE_DEMO_DATA ? REPORTS_DEMO_METRICS : []), []);

  const [activeTab, setActiveTab] = useState<RomTabId>("genel");
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [segment, setSegment] = useState("all");
  const [compare, setCompare] = useState("prev");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    REPORTS_USE_DEMO_DATA && REPORTS_DEMO_METRICS.length > 0 ? (REPORTS_DEMO_METRICS[0]?.id ?? null) : null
  );
  const [actionLocks, setActionLocks] = useState<Record<string, boolean>>({});
  const [rowMoreLocks, setRowMoreLocks] = useState<Record<string, boolean>>({});
  const [usageSummary, setUsageSummary] = useState<TenantUsageSummary | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);

  const chipFilter = useMemo(() => romTabToChip(activeTab), [activeTab]);

  const filtered = useMemo(
    () => baseRows.filter((row) => metricMatchesChip(row, chipFilter)),
    [baseRows, chipFilter]
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev && filtered.some((row) => row.id === prev)) return prev;
      return filtered[0]?.id ?? null;
    });
  }, [filtered]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, segment, compare, dateFrom, dateTo]);

  useEffect(() => {
    if (state !== "authenticated" || !session?.tenant.id) {
      setUsageSummary(null);
      return;
    }
    const controller = new AbortController();
    void fetch(`${API_BASE_URL}/platform/tenant-usage/summary`, {
      method: "GET",
      headers: { "x-tenant-id": session.tenant.id },
      credentials: "include",
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => (response.ok ? ((await response.json()) as { item: TenantUsageSummary }).item : null))
      .then((item) => setUsageSummary(item))
      .catch(() => setUsageSummary(null));
    return () => controller.abort();
  }, [session?.tenant.id, state]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pagedRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const selectedMetric = useMemo(() => {
    if (!selectedId) return null;
    return filtered.find((row) => row.id === selectedId) ?? baseRows.find((row) => row.id === selectedId) ?? null;
  }, [selectedId, filtered, baseRows]);

  const kpis = useMemo(() => buildReportsReferenceKpis(REPORTS_USE_DEMO_DATA), []);
  const tableRows = useMemo(() => pagedRows.map(mapMetricToTableRow), [pagedRows]);
  const contextPanel = useMemo(() => mapMetricToContext(selectedMetric), [selectedMetric]);

  const tableTotalLabel = useMemo(() => {
    if (!filtered.length) return "Toplam 0 kayıt";
    return `Toplam ${new Intl.NumberFormat("tr-TR").format(filtered.length)} kayıt`;
  }, [filtered.length]);

  const paginationLabel = useMemo(() => {
    if (!filtered.length) return "0 kayıt";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, filtered.length);
    return `${start}–${end} / ${filtered.length} metrik`;
  }, [filtered.length, page, pageSize]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const start = Math.max(1, Math.min(page - 2, totalPages - maxButtons + 1));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i += 1) nums.push(i);
    return nums;
  }, [page, totalPages]);

  const showDemoBanner = REPORTS_USE_DEMO_DATA && !demoBannerDismissed;

  const statusBand = useMemo(() => {
    if (REPORTS_USE_DEMO_DATA) {
      const usageNote = usageSummary
        ? ` Kiracı kullanım API'si bağlı: ${usageSummary.totalEvents} olay, limit aşımı ${usageSummary.limitExceeded ? "var" : "yok"}.`
        : " Kiracı kullanım API sonucu yok veya oturum bekleniyor.";
      return {
        kind: "demo" as const,
        message: `Önizleme modu: örnek rapor metrikleri gösteriliyor.${usageNote}`
      };
    }
    return {
      kind: "live" as const,
      message: "Canlı rapor verisi bekleniyor. Metrik listesi API bağlandığında dolar; sahte KPI veya grafik üretilmez."
    };
  }, [usageSummary]);

  const lockAction = useCallback(
    (key: string, msg: string) => {
      pushToast(msg);
      setActionLocks((current) => ({ ...current, [key]: true }));
    },
    [pushToast]
  );

  const resetFilters = useCallback(() => {
    setActiveTab("genel");
    setDateFrom("2026-05-01");
    setDateTo("2026-05-31");
    setSegment("all");
    setCompare("prev");
    pushToast("Filtreler sıfırlandı.");
  }, [pushToast]);

  const navigateSafe = useCallback(
    (href: string) => {
      pushToast("Yönlendiriliyor…");
      router.push(href);
    },
    [pushToast, router]
  );

  const setActiveChip = useCallback((chip: ReportCategoryChip | "all") => {
    setActiveTab(chipToRomTab(chip));
  }, []);

  const handleRowView = useCallback(
    (rowId: string) => {
      setSelectedId(rowId);
      pushToast("Metrik seçildi; detay sağ panelde.");
    },
    [pushToast]
  );

  const handleRowMore = useCallback(
    (rowId: string) => {
      setSelectedId(rowId);
      if (rowMoreLocks[rowId]) return;
      pushToast("Demo: PDF ve Excel dışa aktarma kuyruğa alındı.");
      setRowMoreLocks((current) => ({ ...current, [rowId]: true }));
    },
    [pushToast, rowMoreLocks]
  );

  return {
    usingDemoData: REPORTS_USE_DEMO_DATA,
    showDemoBanner,
    dismissDemoBanner: () => setDemoBannerDismissed(true),
    statusBand,
    kpis,
    activeTab,
    setActiveTab,
    setActiveChip,
    chipFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    segment,
    setSegment,
    compare,
    setCompare,
    resetFilters,
    filteredCount: filtered.length,
    tableRows,
    selectedId,
    setSelectedId,
    selectedMetric,
    contextPanel,
    tableTotalLabel,
    paginationLabel,
    page,
    setPage,
    pageSize,
    totalPages,
    pageNumbers,
    actionLocks,
    rowMoreLocks,
    lockAction,
    navigateSafe,
    handleRowView,
    handleRowMore,
    pushToast
  };
}
