"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  loadTeslimatlarDetayReferenceDemo,
  loadTeslimatlarDetayReferenceLive,
  TESLIMATLAR_DETAY_REFERENCE_INITIAL,
  type TeslimatlarDetayReferenceSnapshot
} from "../adapters/teslimatlar-detay-reference-adapter";
import { useTeslimatlarDeliveryId } from "./use-teslimatlar-delivery-id";

export function useTeslimatlarDetayReferenceData(deliveryIdOverride?: string) {
  const deliveryId = useTeslimatlarDeliveryId(deliveryIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<TeslimatlarDetayReferenceSnapshot>(TESLIMATLAR_DETAY_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadTeslimatlarDetayReferenceDemo())
      : loadTeslimatlarDetayReferenceLive(deliveryId);

    loader
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(TESLIMATLAR_DETAY_REFERENCE_INITIAL);
          setLoadFailed(!isDemo);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isDemo, deliveryId]);

  return { ...data, deliveryId, loading, loadFailed, isDemo };
}
