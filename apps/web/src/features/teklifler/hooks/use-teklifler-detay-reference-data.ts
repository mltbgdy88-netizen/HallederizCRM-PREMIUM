"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  loadTekliflerDetayReferenceDemo,
  loadTekliflerDetayReferenceLive,
  TEKLIFLER_DETAY_REFERENCE_INITIAL,
  type TekliflerDetayReferenceSnapshot
} from "../adapters/teklifler-detay-reference-adapter";
import { useTeklifOfferId } from "./use-teklif-offer-id";

export function useTekliflerDetayReferenceData(offerIdOverride?: string) {
  const offerId = useTeklifOfferId(offerIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<TekliflerDetayReferenceSnapshot>(TEKLIFLER_DETAY_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadTekliflerDetayReferenceDemo())
      : loadTekliflerDetayReferenceLive(offerId);

    loader
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(TEKLIFLER_DETAY_REFERENCE_INITIAL);
          setLoadFailed(!isDemo);
        }
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
