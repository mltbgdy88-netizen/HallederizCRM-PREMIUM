"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  CUSTOMERS_PORTFOLIO_DEMO_ROWS,
  isCustomersDemoRowId
} from "../data/customers-demo-rows";
import type { CustomerRow } from "../mappers/map-customer-row";
import type { CustomerFilters } from "../schemas/customer-filter-schema";
import {
  mapCustomerRowToTableRow,
  mapCustomerToContextPanel,
  mapCustomersToReferenceKpis
} from "../utils/map-customer-to-reference-desk";
import { useCustomerFilters } from "./use-customer-filters";
import { useCustomersData } from "./use-customers-data";

function filterDemoRows(rows: CustomerRow[], filters: CustomerFilters): CustomerRow[] {
  const searchQuery = filters.searchText.trim().toLocaleLowerCase("tr-TR");

  return rows.filter((row) => {
    if (searchQuery) {
      const blob = `${row.code} ${row.name} ${row.city} ${row.phone}`.toLocaleLowerCase("tr-TR");
      if (!blob.includes(searchQuery)) return false;
    }
    if (filters.city && row.city !== filters.city) return false;
    if (filters.riskLevel) {
      const level =
        row.riskTone === "danger" ? "high" : row.riskTone === "warning" ? "medium" : "low";
      if (level !== filters.riskLevel) return false;
    }
    if (filters.balanceState === "open_balance" && !row.balanceCreditLine.includes("alacak")) {
      return false;
    }
    if (filters.balanceState === "credit" && !row.balanceDebitLine.includes("borç")) {
      return false;
    }
    if (filters.balanceState === "zero" && row.balanceLabel !== "—" && row.balanceLabel !== "₺0") {
      return false;
    }
    return true;
  });
}

export function useCustomersPortfolioDeskState() {
  const { filters, updateFilter, resetFilters } = useCustomerFilters();
  const { loading, loadFailed, loadUnavailableTitle, loadUnavailableDetail, data, filteredCustomers, rows } =
    useCustomersData(filters);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const pageSize = 10;

  const usingDemoFallback = dataSourceConfig.useDemoData && !loading && data.customers.length === 0;

  const displayRows = useMemo(() => {
    if (usingDemoFallback) {
      return filterDemoRows(CUSTOMERS_PORTFOLIO_DEMO_ROWS, filters);
    }
    return rows;
  }, [usingDemoFallback, rows, filters]);

  const pagedRows = useMemo(
    () => displayRows.slice((page - 1) * pageSize, page * pageSize),
    [displayRows, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!displayRows.length) {
      setSelectedCustomerId(null);
      return;
    }
    if (!selectedCustomerId || !displayRows.some((row) => row.customerId === selectedCustomerId)) {
      setSelectedCustomerId(displayRows[0]!.customerId);
    }
  }, [displayRows, selectedCustomerId]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId || isCustomersDemoRowId(selectedCustomerId)) return null;
    return (
      data.customers.find((customer) => customer.id === selectedCustomerId) ??
      filteredCustomers.find((customer) => customer.id === selectedCustomerId) ??
      null
    );
  }, [data.customers, filteredCustomers, selectedCustomerId]);

  const selectedAccount = useMemo(
    () =>
      selectedCustomer
        ? data.accounts.find((account) => account.customerId === selectedCustomer.id) ?? null
        : null,
    [data.accounts, selectedCustomer]
  );

  const selectedPreviewRow = useMemo(() => {
    if (!usingDemoFallback || !selectedCustomerId) return null;
    return displayRows.find((row) => row.customerId === selectedCustomerId) ?? null;
  }, [usingDemoFallback, selectedCustomerId, displayRows]);

  const cities = useMemo(() => {
    if (usingDemoFallback) {
      return Array.from(new Set(CUSTOMERS_PORTFOLIO_DEMO_ROWS.map((row) => row.city))).sort();
    }
    return Array.from(new Set(data.customers.map((customer) => customer.city))).sort();
  }, [usingDemoFallback, data.customers]);

  const tableRows = useMemo(() => pagedRows.map(mapCustomerRowToTableRow), [pagedRows]);

  const kpis = useMemo(
    () => mapCustomersToReferenceKpis({ data, displayRows, usingDemo: usingDemoFallback }),
    [data, displayRows, usingDemoFallback]
  );

  const contextPanel = useMemo(
    () => mapCustomerToContextPanel(selectedCustomer, selectedAccount, selectedPreviewRow),
    [selectedCustomer, selectedAccount, selectedPreviewRow]
  );

  const tableTotalLabel = useMemo(() => {
    if (!displayRows.length) return "0 kayıt";
    return `Toplam ${new Intl.NumberFormat("tr-TR").format(displayRows.length)} kayıt`;
  }, [displayRows.length]);

  const paginationLabel = useMemo(() => {
    if (!displayRows.length) return "0 cari";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, displayRows.length);
    return `${start}–${end} / ${displayRows.length} cari`;
  }, [displayRows.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(displayRows.length / pageSize));

  const emptyFiltered = !usingDemoFallback && !loading && data.customers.length > 0 && rows.length === 0;

  const showDemoBanner = usingDemoFallback && !demoBannerDismissed;

  const isSelectedDemo = selectedCustomerId ? isCustomersDemoRowId(selectedCustomerId) : false;

  const resetAllFilters = useCallback(() => {
    resetFilters();
    setDemoBannerDismissed(false);
  }, [resetFilters]);

  return {
    loading,
    loadFailed,
    loadUnavailableTitle,
    loadUnavailableDetail,
    usingDemoFallback,
    showDemoBanner,
    dismissDemoBanner: () => setDemoBannerDismissed(true),
    filters,
    updateFilter,
    resetAllFilters,
    cities,
    selectedCustomerId,
    setSelectedCustomerId,
    page,
    setPage,
    pageSize,
    totalPages,
    paginationLabel,
    tableTotalLabel,
    tableRows,
    kpis,
    contextPanel,
    emptyFiltered,
    isSelectedDemo,
    displayRowsCount: displayRows.length
  };
}

export type CustomersPortfolioDeskState = ReturnType<typeof useCustomersPortfolioDeskState>;
