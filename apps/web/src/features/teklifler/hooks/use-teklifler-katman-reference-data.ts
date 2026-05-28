"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  loadTekliflerKatmanReferenceDemo,
  loadTekliflerKatmanReferenceLive,
  type TekliflerKatmanReferenceSnapshot
} from "../adapters/teklifler-katman-reference-adapter";
import { useTeklifOfferId } from "./use-teklif-offer-id";

export function useTekliflerKatmanReferenceData(offerIdOverride?: string) {
  const offerId = useTeklifOfferId(offerIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<TekliflerKatmanReferenceSnapshot>(loadTekliflerKatmanReferenceDemo());
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadTekliflerKatmanReferenceDemo())
      : loadTekliflerKatmanReferenceLive(offerId);

    loader
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!mounted) return;
        setData(loadTekliflerKatmanReferenceDemo());
        setLoadFailed(!isDemo);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isDemo, offerId]);

  return { data, loading, loadFailed, isDemo, offerId };
}

