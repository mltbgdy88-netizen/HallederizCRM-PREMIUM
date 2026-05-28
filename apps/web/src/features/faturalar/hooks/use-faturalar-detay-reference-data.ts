"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  FATURALAR_DETAY_REFERENCE_INITIAL,
  loadFaturalarDetayReferenceDemo,
  loadFaturalarDetayReferenceLive,
  type FaturalarDetayReferenceSnapshot
} from "../adapters/faturalar-detay-reference-adapter";
import { useFaturaInvoiceId } from "./use-fatura-invoice-id";

export function useFaturalarDetayReferenceData(invoiceIdOverride?: string) {
  const invoiceId = useFaturaInvoiceId(invoiceIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<FaturalarDetayReferenceSnapshot>(FATURALAR_DETAY_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadFaturalarDetayReferenceDemo())
      : loadFaturalarDetayReferenceLive(invoiceId);

    loader
      .then((result) => {
        if (!mounted) return;
        setData(result);
      })
      .catch(() => {
        if (!mounted) return;
        setData(FATURALAR_DETAY_REFERENCE_INITIAL);
        setLoadFailed(!isDemo);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isDemo, invoiceId]);

  return { data, loading, loadFailed, isDemo, invoiceId };
}

