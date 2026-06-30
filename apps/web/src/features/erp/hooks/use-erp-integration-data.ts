"use client";

import { useCallback, useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getErpIntegrationData, type ErpIntegrationData } from "../queries";

export function useErpIntegrationData() {
  const [data, setData] = useState<ErpIntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getErpIntegrationData();
      setData(next);
    } catch {
      setData(null);
      setError("ERP entegrasyon verileri alınamadı.");
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
