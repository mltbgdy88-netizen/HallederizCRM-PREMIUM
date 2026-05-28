"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  CARILER_DETAY_REFERENCE_INITIAL,
  loadCarilerDetayReferenceDemo,
  loadCarilerDetayReferenceLive,
  type CarilerDetayReferenceSnapshot
} from "../adapters/cariler-detay-reference-adapter";
import { useCarilerCustomerId } from "./use-cariler-customer-id";

export function useCarilerDetayReferenceData(customerIdOverride?: string) {
  const customerId = useCarilerCustomerId(customerIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<CarilerDetayReferenceSnapshot>(CARILER_DETAY_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadCarilerDetayReferenceDemo())
      : loadCarilerDetayReferenceLive(customerId);

    loader
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(CARILER_DETAY_REFERENCE_INITIAL);
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
