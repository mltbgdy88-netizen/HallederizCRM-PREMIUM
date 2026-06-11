"use client";

import type { Product } from "@hallederiz/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  filterStockDemoRows,
  isStockDemoRowId,
  STOCK_OPERATION_DEMO_ROWS
} from "../data/stock-demo-rows";
import type { StockRow } from "../mappers/map-stock-row";
import {
  mapStockRowToContextPanel,
  mapStockRowsToReferenceKpis,
  mapStockRowToTableRow
} from "../utils/map-stock-to-reference-desk";
import { useStockData } from "./use-stock-data";
import { useStockFilters } from "./use-stock-filters";

function getCategoryValues(products: Product[], slotNumber: 1 | 2 | 3 | 4): string[] {
  const values = new Set<string>();
  for (const product of products) {
    const value = product.categoryValues.find((item) => item.slotNumber === slotNumber)?.value;
    if (value) values.add(value);
  }
  return Array.from(values.values()).sort((a, b) => a.localeCompare(b, "tr"));
}

export function useStockOperationsDeskState() {
  const { filters, updateFilter, resetFilters } = useStockFilters();
  const { loading, products, rows, brands, factories, warehouses, categorySlots, priceSlots } =
    useStockData(filters);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailModalProductId, setDetailModalProductId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const pageSize = 10;

  const usingDemoFallback = dataSourceConfig.useDemoData && !loading && products.length === 0;

  const displayRows = useMemo(() => {
    if (usingDemoFallback) {
      return filterStockDemoRows(STOCK_OPERATION_DEMO_ROWS, filters, factories, brands, warehouses);
    }
    return rows;
  }, [usingDemoFallback, rows, filters, factories, brands, warehouses]);

  const pagedRows = useMemo(
    () => displayRows.slice((page - 1) * pageSize, page * pageSize),
    [displayRows, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!displayRows.length) {
      setSelectedProductId(null);
      return;
    }
    const first = displayRows[0];
    if (!first) {
      setSelectedProductId(null);
      return;
    }
    if (!selectedProductId || !displayRows.some((row) => row.productId === selectedProductId)) {
      setSelectedProductId(first.productId);
    }
  }, [displayRows, selectedProductId]);

  const selectedRow = useMemo(
    () => displayRows.find((row) => row.productId === selectedProductId) ?? null,
    [displayRows, selectedProductId]
  );

  const selectedProduct = useMemo<Product | null>(() => {
    if (!detailModalProductId || isStockDemoRowId(detailModalProductId)) return null;
    return products.find((product) => product.id === detailModalProductId) ?? null;
  }, [products, detailModalProductId]);

  const categoryLabel = useMemo(
    () => categorySlots.find((slot) => slot.slotNumber === 1)?.slotName ?? "Kategori",
    [categorySlots]
  );

  const categoryOptions = useMemo(() => {
    if (usingDemoFallback) {
      return Array.from(new Set(STOCK_OPERATION_DEMO_ROWS.map((row) => row.categorySummary.split(" · ")[0] ?? row.categorySummary))).sort();
    }
    return getCategoryValues(products, 1);
  }, [usingDemoFallback, products]);

  const priceSlotActiveCount = useMemo(() => priceSlots.filter((slot) => slot.active).length, [priceSlots]);

  const kpis = useMemo(
    () => mapStockRowsToReferenceKpis(displayRows, priceSlotActiveCount),
    [displayRows, priceSlotActiveCount]
  );

  const tableRows = useMemo(() => pagedRows.map(mapStockRowToTableRow), [pagedRows]);

  const contextPanel = useMemo(() => mapStockRowToContextPanel(selectedRow), [selectedRow]);

  const tableTotalLabel = useMemo(() => {
    if (!displayRows.length) return "0 kayıt";
    return `Toplam ${new Intl.NumberFormat("tr-TR").format(displayRows.length)} kayıt`;
  }, [displayRows.length]);

  const paginationLabel = useMemo(() => {
    if (!displayRows.length) return "0 ürün";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, displayRows.length);
    return `${start}–${end} / ${displayRows.length} ürün`;
  }, [displayRows.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(displayRows.length / pageSize));

  const emptyFiltered = !usingDemoFallback && !loading && products.length > 0 && rows.length === 0;

  const showDemoBanner = usingDemoFallback && !demoBannerDismissed;

  const isSelectedDemo = selectedProductId ? isStockDemoRowId(selectedProductId) : false;

  const resetAllFilters = useCallback(() => {
    resetFilters();
    setDemoBannerDismissed(false);
  }, [resetFilters]);

  const openDetailModal = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setDetailModalProductId(productId);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalProductId(null);
  }, []);

  return {
    loading,
    usingDemoFallback,
    showDemoBanner,
    dismissDemoBanner: () => setDemoBannerDismissed(true),
    filters,
    updateFilter,
    resetAllFilters,
    brands,
    factories,
    warehouses,
    products,
    categoryLabel,
    categoryOptions,
    priceSlots,
    categorySlots,
    selectedProductId,
    setSelectedProductId,
    selectedRow,
    selectedProduct,
    detailModalProductId,
    openDetailModal,
    closeDetailModal,
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

export type StockOperationsDeskState = ReturnType<typeof useStockOperationsDeskState>;
