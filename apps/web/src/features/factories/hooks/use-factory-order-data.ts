"use client";

import { useCallback, useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import type { FactoryOrder, IntegrationLog } from "@hallederiz/types";
import { getFactoryOrderData } from "../queries";

export function useFactoryOrderData() {
  const [orders, setOrders] = useState<FactoryOrder[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getFactoryOrderData();
      setOrders(next.orders);
      setLogs(next.logs);
    } catch {
      setOrders([]);
      setLogs([]);
      setError("Fabrika sipariş verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    orders,
    logs,
    loading,
    error,
    refresh,
    useDemo: dataSourceConfig.useDemoData
  };
}
