"use client";

import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useSiparisOrderId } from "./use-siparis-order-id";
import type { SiparislerKatmanReferenceSnapshot } from "../adapters/siparisler-katman-reference-adapter";
import { loadSiparislerKatmanReferenceDemo, loadSiparislerKatmanReferenceLive } from "../adapters/siparisler-katman-reference-adapter";

export function useSiparislerKatmanReferenceData(overrideOrderId?: string): {
  orderId: string;
  loading: boolean;
  error: string | null;
  data: SiparislerKatmanReferenceSnapshot;
} {
  const orderId = useSiparisOrderId(overrideOrderId);
  const isDemo = dataSourceConfig.useDemoData;
  const initial = useMemo(() => loadSiparislerKatmanReferenceDemo(), []);

  const [data, setData] = useState<SiparislerKatmanReferenceSnapshot>(initial);
  const [loading, setLoading] = useState<boolean>(!isDemo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (isDemo) {
        setLoading(false);
        setError(null);
        setData(loadSiparislerKatmanReferenceDemo());
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const snap = await loadSiparislerKatmanReferenceLive(orderId);
        if (cancelled) return;
        setData(snap);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Bilinmeyen hata");
        setData(loadSiparislerKatmanReferenceDemo());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isDemo, orderId]);

  return { orderId, loading, error, data };
}

