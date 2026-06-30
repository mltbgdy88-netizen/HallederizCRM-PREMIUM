"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { getSalesAssistantHealth } from "../queries";
import {
  canRunLocalAiInsights,
  mapLocalAiChannelHealthView,
  type LocalAiChannelHealthView,
  type SalesAssistantHealthSnapshot
} from "../utils/map-local-ai-channel-view";
import { normalizeLocalAiHealthSnapshot, type LocalAiHealthSnapshot } from "../utils/normalize-local-ai-health";

export function useLocalAiChannel() {
  const useDemo = dataSourceConfig.useDemoData;
  const [localHealth, setLocalHealth] = useState<LocalAiHealthSnapshot | null>(null);
  const [salesHealth, setSalesHealth] = useState<SalesAssistantHealthSnapshot | null>(null);
  const [loading, setLoading] = useState(!useDemo);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (useDemo) {
      setLocalHealth(null);
      setSalesHealth(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [localResult, salesResult] = await Promise.all([sdk.ai.getLocalAiHealth(), getSalesAssistantHealth()]);
      setLocalHealth(normalizeLocalAiHealthSnapshot(localResult.item));
      const salesItem = salesResult.item;
      setSalesHealth({
        status: salesItem.status as SalesAssistantHealthSnapshot["status"],
        reason: salesItem.reason,
        model: salesItem.model,
        fallbackModel: salesItem.fallbackModel,
        modelReady: salesItem.modelReady,
        fallbackReady: salesItem.fallbackReady
      });
    } catch {
      setLocalHealth(null);
      setSalesHealth(null);
      setError("Yerel yapay zekâ durumu alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [useDemo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const channelView: LocalAiChannelHealthView = useMemo(
    () => mapLocalAiChannelHealthView(localHealth, salesHealth, { useDemoData: useDemo }),
    [localHealth, salesHealth, useDemo]
  );

  const canRunInsights = useMemo(
    () => canRunLocalAiInsights(localHealth, salesHealth, useDemo),
    [localHealth, salesHealth, useDemo]
  );

  return {
    useDemo,
    localHealth,
    salesHealth,
    channelView,
    canRunInsights,
    loading,
    error,
    refresh
  };
}
