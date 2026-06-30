"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import {
  canOperateFactoryIntegration,
  mapFactoryChannelHealthView,
  type FactoryChannelHealthView
} from "../utils/map-factory-channel-view";
import { normalizeFactoryHealthSnapshot, type FactoryHealthSnapshot } from "../utils/normalize-factory-health";

export function useFactoryChannel() {
  const useDemo = dataSourceConfig.useDemoData;
  const [health, setHealth] = useState<FactoryHealthSnapshot | null>(null);
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
      const result = await sdk.factory.getChannelHealth();
      setHealth(normalizeFactoryHealthSnapshot(result.item));
    } catch {
      setHealth(null);
      setError("Fabrika kanal durumu alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [useDemo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const channelView: FactoryChannelHealthView = useMemo(
    () => mapFactoryChannelHealthView(health, { useDemoData: useDemo }),
    [health, useDemo]
  );

  const canOperate = useMemo(() => canOperateFactoryIntegration(health, useDemo), [health, useDemo]);

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
