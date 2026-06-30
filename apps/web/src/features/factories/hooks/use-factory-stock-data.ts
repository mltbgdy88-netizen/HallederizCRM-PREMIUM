"use client";

import { useCallback, useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getFactoryStockData, type FactoryStockData } from "../queries";

export function useFactoryStockData() {
  const [data, setData] = useState<FactoryStockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getFactoryStockData();
      setData(next);
    } catch {
      setData(null);
      setError("Fabrika stok verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    useDemo: dataSourceConfig.useDemoData
  };
}
