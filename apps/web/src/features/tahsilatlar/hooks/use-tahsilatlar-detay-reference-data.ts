"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  loadTahsilatlarDetayReferenceDemo,
  loadTahsilatlarDetayReferenceLive,
  TAHSILATLAR_DETAY_REFERENCE_INITIAL,
  type TahsilatlarDetayReferenceSnapshot
} from "../adapters/tahsilatlar-detay-reference-adapter";
import { useTahsilatPaymentId } from "./use-tahsilat-payment-id";

export function useTahsilatlarDetayReferenceData(paymentIdOverride?: string) {
  const paymentId = useTahsilatPaymentId(paymentIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<TahsilatlarDetayReferenceSnapshot>(TAHSILATLAR_DETAY_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadTahsilatlarDetayReferenceDemo())
      : loadTahsilatlarDetayReferenceLive(paymentId);

    loader
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(TAHSILATLAR_DETAY_REFERENCE_INITIAL);
          setLoadFailed(!isDemo);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isDemo, paymentId]);

  return { data, loading, loadFailed, isDemo, paymentId };
}
