"use client";

import type { WhatsAppSessionSnapshot } from "@hallederiz/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { mapWhatsAppChannelHealthView, type WhatsAppChannelHealthView } from "../utils/whatsapp-channel-health";
import { normalizeWhatsAppHealthSnapshot } from "../utils/normalize-whatsapp-health";
import { canSendWhatsAppOutbound } from "../utils/whatsapp-outbound-feedback";
import type { WhatsAppChannelHealthSnapshot } from "../utils/whatsapp-channel-health";

export function useWhatsAppChannel() {
  const useDemo = dataSourceConfig.useDemoData;
  const [health, setHealth] = useState<WhatsAppChannelHealthSnapshot | null>(null);
  const [session, setSession] = useState<WhatsAppSessionSnapshot | null>(null);
  const [loading, setLoading] = useState(!useDemo);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (useDemo) {
      setHealth(null);
      setSession(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [healthResult, sessionResult] = await Promise.all([
        sdk.whatsapp.getChannelHealth(),
        sdk.whatsapp.getSession()
      ]);
      setHealth(normalizeWhatsAppHealthSnapshot(healthResult.item));
      setSession(sessionResult.item ?? null);
    } catch {
      setHealth(null);
      setSession(null);
      setError("WhatsApp kanal durumu alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [useDemo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const channelView: WhatsAppChannelHealthView = useMemo(
    () => mapWhatsAppChannelHealthView(health, session, { useDemoData: useDemo }),
    [health, session, useDemo]
  );

  const canSend = useMemo(
    () => canSendWhatsAppOutbound(session, useDemo, health),
    [health, session, useDemo]
  );

  return {
    useDemo,
    health,
    session,
    channelView,
    canSend,
    loading,
    error,
    refresh
  };
}
