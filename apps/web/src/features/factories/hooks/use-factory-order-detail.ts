"use client";

import { useCallback, useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import type { FactoryOrder, IntegrationLog } from "@hallederiz/types";
import { getFactoryOrderById } from "../queries";

export function useFactoryOrderDetail(factoryOrderId: string) {
  const [order, setOrder] = useState<FactoryOrder | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getFactoryOrderById(factoryOrderId);
      setOrder(next.order);
      setLogs(next.logs);
      if (!next.order) {
        setError("Fabrika siparişi bulunamadı.");
      }
    } catch {
      setOrder(null);
      setLogs([]);
      setError("Fabrika sipariş detayı alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [factoryOrderId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    order,
    logs,
    loading,
    error,
    refresh,
    useDemo: dataSourceConfig.useDemoData
  };
}
