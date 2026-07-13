"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { dataSourceConfig } from "../../../lib/data-source";
import { getPilotSetupData } from "../queries";
import { AHB_PAGE_COPY, buildSettingsHubCards, type SettingsHubCard } from "../utils/map-settings-hub-cards";
import type { SettingsLoadFailure } from "../utils/resolve-settings-load-error";
import { resolveSettingsLoadError } from "../utils/resolve-settings-load-error";

export function useSettingsHubState() {
  const router = useRouter();
  const { pushToast } = useToast();

  const cards = useMemo(() => buildSettingsHubCards(), []);
  const mountedRef = useRef(false);
  const loadRequestSeqRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<SettingsLoadFailure | null>(null);
  const [checklistDone, setChecklistDone] = useState(0);
  const [checklistTotal, setChecklistTotal] = useState(0);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);

  const reloadSummary = useCallback(() => {
    const requestId = loadRequestSeqRef.current + 1;
    loadRequestSeqRef.current = requestId;
    const isCurrentRequest = () => mountedRef.current && loadRequestSeqRef.current === requestId;

    setLoading(true);
    setLoadError(null);
    void getPilotSetupData()
      .then((data) => {
        if (!isCurrentRequest()) return;
        const done = data.settings.pilotSetup.checklist.filter((item) => item.completed).length;
        setChecklistDone(done);
        setChecklistTotal(data.settings.pilotSetup.checklist.length);
      })
      .catch((error) => {
        if (!isCurrentRequest()) return;
        setLoadError(resolveSettingsLoadError(error, "Ayar özeti yüklenemedi."));
        setChecklistDone(0);
        setChecklistTotal(0);
      })
      .finally(() => {
        if (isCurrentRequest()) setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    reloadSummary();
    return () => {
      mountedRef.current = false;
      loadRequestSeqRef.current += 1;
    };
  }, [reloadSummary]);

  const statusBand = useMemo(() => {
    if (loadError) {
      return { kind: "error" as const, message: loadError.message, failure: loadError };
    }
    const pilotNote =
      checklistTotal > 0 ? ` Pilot kurulum: ${checklistDone}/${checklistTotal} tamamlandı.` : "";
    if (dataSourceConfig.useDemoData) {
      return {
        kind: "demo" as const,
        message: `Önizleme modu: ayar hub kartları yönlendirme sağlar; kaydetme bu ekranda yapılmaz.${pilotNote}`
      };
    }
    return {
      kind: "info" as const,
      message: `Ayarlar kiracı yapılandırmasını gösterir; hub kartları ilgili ekranlara yönlendirir.${pilotNote}`
    };
  }, [checklistDone, checklistTotal, loadError]);

  const showDemoBanner = dataSourceConfig.useDemoData && !demoBannerDismissed && statusBand.kind === "demo";

  const handleCardActivate = useCallback(
    (card: SettingsHubCard) => {
      if (card.action.kind === "navigate") {
        pushToast("Yönlendiriliyor…");
        router.push(card.action.href);
        return;
      }
      pushToast(card.action.message);
    },
    [pushToast, router]
  );

  return {
    pageCopy: AHB_PAGE_COPY,
    cards,
    loading,
    loadError,
    reloadSummary,
    checklistDone,
    checklistTotal,
    usingDemoData: dataSourceConfig.useDemoData,
    statusBand,
    showDemoBanner,
    dismissDemoBanner: () => setDemoBannerDismissed(true),
    handleCardActivate
  };
}
