"use client";

import type { Approval } from "@hallederiz/types";
import { useCallback, useEffect, useState } from "react";
import { sdk } from "../../../lib/data-source";

export function useApprovalsFromApi(enabled: boolean) {
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    sdk.approvals
      .list()
      .then((res) => {
        setItems(res.items ?? []);
      })
      .catch((e: Error) => {
        setItems([]);
        setError(e.message ?? "Onay listesi alınamadı");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    reload();
  }, [enabled, reload]);

  return { items, loading, error, reload };
}
