"use client";

import type { PlatformSettings } from "@hallederiz/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { getPilotSetupData } from "../queries";

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
  const [activeCategory, setActiveCategory] = useState<SettingsFormCategoryId>("firma");
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    void getPilotSetupData()
      .then((data) => {
        const next = cloneSettings(data.settings);
        setSettings(next);
        baselineRef.current = cloneSettings(data.settings);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Ayarlar yüklenemedi.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
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
    window.setTimeout(() => {
      baselineRef.current = cloneSettings(settings);
      setSaving(false);
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
