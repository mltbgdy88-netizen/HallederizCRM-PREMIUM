"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  CARILER_KATMAN_REFERENCE_INITIAL,
  loadCarilerKatmanReferenceDemo,
  loadCarilerKatmanReferenceLive,
  type CarilerKatmanReferenceSnapshot
} from "../adapters/cariler-katman-reference-adapter";
import { useCarilerCustomerId } from "./use-cariler-customer-id";

export function useCarilerKatmanReferenceData(customerIdOverride?: string) {
  const customerId = useCarilerCustomerId(customerIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<CarilerKatmanReferenceSnapshot>(CARILER_KATMAN_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadCarilerKatmanReferenceDemo())
      : loadCarilerKatmanReferenceLive(customerId);

    loader
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(CARILER_KATMAN_REFERENCE_INITIAL);
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
  }, [isDemo, customerId]);

  return { data, loading, loadFailed, isDemo, customerId };
}
