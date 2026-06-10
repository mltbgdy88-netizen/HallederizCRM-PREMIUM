"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  loadSiparislerDetayReferenceDemo,
  loadSiparislerDetayReferenceLive,
  SIPARISLER_DETAY_REFERENCE_INITIAL,
  type SiparislerDetayReferenceSnapshot
} from "../adapters/siparisler-detay-reference-adapter";
import { useSiparisOrderId } from "./use-siparis-order-id";

export function useSiparislerDetayReferenceData(orderIdOverride?: string) {
  const orderId = useSiparisOrderId(orderIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<SiparislerDetayReferenceSnapshot>(SIPARISLER_DETAY_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadSiparislerDetayReferenceDemo())
      : loadSiparislerDetayReferenceLive(orderId);

    loader
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(SIPARISLER_DETAY_REFERENCE_INITIAL);
          setLoadFailed(!isDemo);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isDemo, orderId]);

  return { data, loading, loadFailed, isDemo, orderId };
}
