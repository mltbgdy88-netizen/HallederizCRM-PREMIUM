"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  IADELER_DETAY_REFERENCE_INITIAL,
  loadIadelerDetayReferenceDemo,
  loadIadelerDetayReferenceLive,
  type IadelerDetayReferenceSnapshot
} from "../adapters/iadeler-detay-reference-adapter";
import { useIadeReturnId } from "./use-iade-return-id";

export function useIadelerDetayReferenceData(returnIdOverride?: string) {
  const returnId = useIadeReturnId(returnIdOverride);
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<IadelerDetayReferenceSnapshot>(IADELER_DETAY_REFERENCE_INITIAL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo
      ? Promise.resolve(loadIadelerDetayReferenceDemo())
      : loadIadelerDetayReferenceLive(returnId);

    loader
      .then((result) => {
        if (!mounted) return;
        setData(result);
      })
      .catch(() => {
        if (!mounted) return;
        setData(IADELER_DETAY_REFERENCE_INITIAL);
        setLoadFailed(!isDemo);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isDemo, returnId]);

  return { data, loading, loadFailed, isDemo, returnId };
}

