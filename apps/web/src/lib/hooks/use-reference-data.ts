"use client";

import { useEffect, useState } from "react";
import { dataSourceConfig } from "../data-source";

export interface ReferenceDataState<T> {
  data: T;
  loading: boolean;
  loadFailed: boolean;
  isDemo: boolean;
}

export interface UseReferenceDataOptions<T> {
  loadDemo: () => T | Promise<T>;
  loadLive: () => Promise<T>;
  initialData: T;
}

export function useReferenceData<T>({
  loadDemo,
  loadLive,
  initialData
}: UseReferenceDataOptions<T>): ReferenceDataState<T> {
  const isDemo = dataSourceConfig.useDemoData;
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setLoadFailed(false);

    const loader = isDemo ? Promise.resolve(loadDemo()) : loadLive();

    loader
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(initialData);
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
    // loadDemo/loadLive/initialData are stable module-level bindings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  return { data, loading, loadFailed, isDemo };
}
