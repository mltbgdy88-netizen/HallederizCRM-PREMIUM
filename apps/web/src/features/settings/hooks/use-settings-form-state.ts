"use client";

import type { PlatformSettings } from "@hallederiz/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { getPilotSetupData } from "../queries";
import type { SettingsLoadFailure } from "../utils/resolve-settings-load-error";
import { resolveSettingsLoadError } from "../utils/resolve-settings-load-error";

export type SettingsFormCategoryId =
  | "firma"
  | "fiyatlar"
  | "para-birimi"
  | "depolar"
  | "baglantilar"
  | "whatsapp"
  | "belgeler"
  | "guvenlik";

export const SETTINGS_FORM_CATEGORIES: { id: SettingsFormCategoryId; label: string }[] = [
  { id: "firma", label: "Firma" },
  { id: "fiyatlar", label: "Fiyatlar" },
  { id: "para-birimi", label: "Para Birimi" },
  { id: "depolar", label: "Depolar" },
  { id: "baglantilar", label: "Bağlantılar" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "belgeler", label: "Belgeler" },
  { id: "guvenlik", label: "Güvenlik" }
];

function cloneSettings(settings: PlatformSettings): PlatformSettings {
  return JSON.parse(JSON.stringify(settings)) as PlatformSettings;
}

export function useSettingsFormState() {
  const { pushToast } = useToast();
  const searchParams = useSearchParams();
  const baselineRef = useRef<PlatformSettings | null>(null);
  const mountedRef = useRef(false);
  const loadRequestSeqRef = useRef(0);
  const saveTimeoutRef = useRef<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<SettingsFormCategoryId>("firma");
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<SettingsLoadFailure | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    const requestId = loadRequestSeqRef.current + 1;
    loadRequestSeqRef.current = requestId;
    const isCurrentRequest = () => mountedRef.current && loadRequestSeqRef.current === requestId;

    setLoading(true);
    setLoadError(null);
    void getPilotSetupData()
      .then((data) => {
        if (!isCurrentRequest()) return;
        const next = cloneSettings(data.settings);
        setSettings(next);
        baselineRef.current = cloneSettings(data.settings);
      })
      .catch((error) => {
        if (!isCurrentRequest()) return;
        setLoadError(resolveSettingsLoadError(error, "Ayarlar yüklenemedi."));
      })
      .finally(() => {
        if (isCurrentRequest()) setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
      loadRequestSeqRef.current += 1;
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [loadData]);

  useEffect(() => {
    const section = searchParams.get("bolum");
    if (!section) return;
    if (SETTINGS_FORM_CATEGORIES.some((item) => item.id === section)) {
      setActiveCategory(section as SettingsFormCategoryId);
    }
  }, [searchParams]);

  const checklistDone = useMemo(() => {
    if (!settings) return 0;
    return settings.pilotSetup.checklist.filter((item) => item.completed).length;
  }, [settings]);

  const assistantCopy = useMemo(() => {
    const map: Record<SettingsFormCategoryId, { hint: string; next: string }> = {
      firma: {
        hint: "Fatura ve belgelerde görünen temel şirket bilgileri.",
        next: "Firma bilgileri tamamsa fiyat slotlarını kontrol edin."
      },
      fiyatlar: {
        hint: "Satış ve teklif ekranlarında kullanılan fiyat slotları.",
        next: "Kur ve yuvarlama ayarlarını gözden geçirin."
      },
      "para-birimi": {
        hint: "Kur kaynağı ve yuvarlama kuralları.",
        next: "Depo listesini doğrulayın."
      },
      depolar: {
        hint: "Stok ve sevkiyat için aktif depo tanımları.",
        next: "Entegrasyon bağlantılarını kontrol edin."
      },
      baglantilar: {
        hint: "ERP, fabrika ve kanal bağlantı durumları.",
        next: "WhatsApp otomasyon ayarlarını gözden geçirin."
      },
      whatsapp: {
        hint: "Bağlantı yöntemleri ve kanal operasyon ayarları. Meta Cloud API resmi production yoludur.",
        next: "Staging kontrolünden WhatsApp sağlığını doğrulayın."
      },
      belgeler: {
        hint: "PDF şablonu ve arşiv tercihleri.",
        next: "Güvenlik ve onay politikalarını gözden geçirin."
      },
      guvenlik: {
        hint: "Ayar değişiklikleri kaydetmeden uygulanmaz.",
        next: "Hazırlık kontrol ekranından servis sağlığını doğrulayın."
      }
    };
    return map[activeCategory];
  }, [activeCategory]);

  const handleSave = () => {
    if (!settings) return;
    setSaving(true);
    saveTimeoutRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      baselineRef.current = cloneSettings(settings);
      setSaving(false);
      saveTimeoutRef.current = null;
      pushToast("Demo: ayar kaydetme sonraki fazda bağlanacak.");
    }, 280);
  };

  const handleRevert = () => {
    if (!baselineRef.current) {
      pushToast("Geri alınacak kayıtlı sürüm yok.");
      return;
    }
    setSettings(cloneSettings(baselineRef.current));
    pushToast("Son kayıtlı sürüme dönüldü.");
  };

  return {
    activeCategory,
    setActiveCategory,
    settings,
    setSettings,
    loading,
    loadError,
    saving,
    checklistDone,
    assistantCopy,
    loadData,
    handleSave,
    handleRevert
  };
}
