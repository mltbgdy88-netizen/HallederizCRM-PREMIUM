"use client";

import { useEffect, useState } from "react";
import { getStockCatalog, type StockCatalogQueryResult } from "../queries/get-stock-catalog";

export function useStockCatalogQuery() {
  const [data, setData] = useState<StockCatalogQueryResult>({
    products: [],
    brands: [],
    factories: [],
    warehouses: [],
    categorySlots: [],
    priceSlots: [],
    exchangeRates: [],
    exchangeRatePolicy: {
      baseCurrency: "TRY",
      useSellingRateForOrder: true,
      additionalSpreadPercent: 0,
      roundingPrecision: 2,
      snapshotOnOrder: true
    },
    customerPricingProfiles: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getStockCatalog()
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    data,
    loading
  };
}
