"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { dataSourceConfig } from "../../../lib/data-source";
import { getPilotSetupData } from "../queries";
import { AHB_PAGE_COPY, buildSettingsHubCards, type SettingsHubCard } from "../utils/map-settings-hub-cards";

export function useSettingsHubState() {
  const router = useRouter();
  const { pushToast } = useToast();

  const cards = useMemo(() => buildSettingsHubCards(), []);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checklistDone, setChecklistDone] = useState(0);
  const [checklistTotal, setChecklistTotal] = useState(0);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    void getPilotSetupData()
      .then((data) => {
        if (!active) return;
        const done = data.settings.pilotSetup.checklist.filter((item) => item.completed).length;
        setChecklistDone(done);
        setChecklistTotal(data.settings.pilotSetup.checklist.length);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Ayar özeti yüklenemedi.");
        setChecklistDone(0);
        setChecklistTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const statusBand = useMemo(() => {
    if (loadError) {
      return { kind: "error" as const, message: loadError };
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
    checklistDone,
    checklistTotal,
    usingDemoData: dataSourceConfig.useDemoData,
    statusBand,
    showDemoBanner,
    dismissDemoBanner: () => setDemoBannerDismissed(true),
    handleCardActivate
  };
}
