"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useAuth } from "../../../providers/auth-provider";
import type { ApprovalClientConfig } from "../../approvals/api/approval-client";
import { getAiAssistantData, type AiAssistantData } from "../queries";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function useAiAssistantData() {
  const { accessToken, session } = useAuth();
  const [data, setData] = useState<AiAssistantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const approvalClientConfig = useMemo<ApprovalClientConfig>(
    () => ({
      apiBaseUrl: API_BASE_URL,
      accessToken,
      tenantId: session?.tenant.id ?? dataSourceConfig.tenantId
    }),
    [accessToken, session?.tenant.id]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getAiAssistantData(
        dataSourceConfig.useDemoData ? undefined : { approvalClientConfig }
      );
      setData(next);
    } catch {
      setData(null);
      setError("Yapay zekâ verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [approvalClientConfig]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    useDemo: dataSourceConfig.useDemoData
  };
}
