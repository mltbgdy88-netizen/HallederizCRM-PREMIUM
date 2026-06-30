"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import {
  canOperateErpIntegration,
  mapErpChannelHealthView,
  type ErpChannelHealthView
} from "../utils/map-erp-channel-view";
import { normalizeErpHealthSnapshot, type ErpHealthSnapshot } from "../utils/normalize-erp-health";

export function useErpChannel() {
  const useDemo = dataSourceConfig.useDemoData;
  const [health, setHealth] = useState<ErpHealthSnapshot | null>(null);
  const [loading, setLoading] = useState(!useDemo);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (useDemo) {
      setHealth(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.erp.getChannelHealth();
      setHealth(normalizeErpHealthSnapshot(result.item));
    } catch {
      setHealth(null);
      setError("ERP kanal durumu alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [useDemo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const channelView: ErpChannelHealthView = useMemo(
    () => mapErpChannelHealthView(health, { useDemoData: useDemo }),
    [health, useDemo]
  );

  const canOperate = useMemo(() => canOperateErpIntegration(health, useDemo), [health, useDemo]);

  return {
    useDemo,
    health,
    channelView,
    canOperate,
    loading,
    error,
    refresh
  };
}
