"use client";

import { useMemo } from "react";
import type { Product } from "@hallederiz/types";
import { mapProductToStockRow } from "../mappers/map-stock-row";
import type { StockFilters } from "../schemas/stock-filter-schema";
import { getStockCatalog } from "../queries/get-stock-catalog";
import { filterProducts } from "../utils/filter-products";
import { useStockCatalogQuery } from "./use-stock-query";

export interface StockDataState {
  loading: boolean;
  products: Product[];
  filteredProducts: Product[];
  rows: ReturnType<typeof mapProductToStockRow>[];
  brands: Awaited<ReturnType<typeof getStockCatalog>>["brands"];
  factories: Awaited<ReturnType<typeof getStockCatalog>>["factories"];
  warehouses: Awaited<ReturnType<typeof getStockCatalog>>["warehouses"];
  categorySlots: Awaited<ReturnType<typeof getStockCatalog>>["categorySlots"];
  priceSlots: Awaited<ReturnType<typeof getStockCatalog>>["priceSlots"];
}

export function useStockData(filters: StockFilters): StockDataState {
  const { data, loading } = useStockCatalogQuery();

  const filteredProducts = useMemo(
    () =>
      filterProducts({
        products: data.products,
        filters,
        warehouses: data.warehouses
      }),
    [data.products, data.warehouses, filters]
  );

  const rows = useMemo(
    () =>
      filteredProducts.map((product) =>
        mapProductToStockRow({
          product,
          brands: data.brands,
          warehouses: data.warehouses
        })
      ),
    [filteredProducts, data.brands, data.warehouses]
  );

  return {
    loading,
    products: data.products,
    filteredProducts,
    rows,
    brands: data.brands,
    factories: data.factories,
    warehouses: data.warehouses,
    categorySlots: data.categorySlots,
    priceSlots: data.priceSlots
  };
}
