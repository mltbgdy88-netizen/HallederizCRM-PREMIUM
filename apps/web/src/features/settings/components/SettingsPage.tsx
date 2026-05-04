"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  CategorySlotConfig,
  PlatformSettings,
  PriceSlotConfig,
  RolePresetItem,
  User,
  WarehouseSetupItem,
  WhatsAppIntent
} from "@hallederiz/types";
import { savePlatformSettings, quickCreateUser } from "../mutations";
import { getPilotSetupData } from "../queries";
import { IntentRuleAssistantPanel, WhatsAppIntentRulesSection } from "./WhatsAppIntentRulesSection";
import { useToast } from "../../../providers/toast-provider";
import {
  IconArchive,
  IconBarChart3,
  IconClipboardCheck,
  IconDatabase,
  IconExternalLink,
  IconMessageCircle,
  IconPackage,
  IconRotateCcw,
  IconSave,
  IconShieldCheck,
  IconUpload,
  IconUser,
  IconWarehouse,
  IconZap
} from "../../dashboard/components/dashboard-inline-icons";

export type SettingsCategoryId =
  | "firma"
  | "fiyatlar"
  | "para-birimi"
  | "depolar"
  | "kullanicilar"
  | "baglantilar"
  | "whatsapp"
  | "kural-onay"
  | "ai-onay"
  | "belgeler"
  | "veri-yukleme"
  | "guvenlik";

const CATEGORIES: { id: SettingsCategoryId; label: string }[] = [
  { id: "firma", label: "Firma" },
  { id: "fiyatlar", label: "Fiyatlar" },
  { id: "para-birimi", label: "Para Birimi" },
  { id: "depolar", label: "Depolar" },
  { id: "kullanicilar", label: "Kullanıcılar" },
  { id: "baglantilar", label: "Bağlantılar" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "kural-onay", label: "Kural ve Onay" },
  { id: "ai-onay", label: "AI ve Onay" },
  { id: "belgeler", label: "Belgeler" },
  { id: "veri-yukleme", label: "Veri Yükleme" },
  { id: "guvenlik", label: "Güvenlik" }
];

function cloneSettings(settings: PlatformSettings): PlatformSettings {
  return JSON.parse(JSON.stringify(settings)) as PlatformSettings;
}

function parseNumber(input: string, fallback = 0): number {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function companyProfileStatus(c: PlatformSettings["company"]): "Dolu" | "Eksik" {
  const ok =
    c.companyName.trim().length > 0 &&
    c.taxNumber.trim().length > 0 &&
    c.email.trim().length > 0 &&
    c.phone.trim().length > 0;
  return ok ? "Dolu" : "Eksik";
}

function erpLabel(provider: PlatformSettings["erp"]["provider"]): string {
  switch (provider) {
    case "netsis":
      return "Netsis";
    case "sap":
      return "SAP";
    case "custom":
      return "Özel";
    default:
      return "Kapalı";
  }
}

export function SettingsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const baselineRef = useRef<PlatformSettings | null>(null);

  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId>("firma");
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [rolePresets, setRolePresets] = useState<RolePresetItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRoleCode, setNewUserRoleCode] = useState("satis");
  const [selectedRuleIntentId, setSelectedRuleIntentId] = useState<WhatsAppIntent>("stok");
  const [ruleSidebarEditMode, setRuleSidebarEditMode] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setFeedback(null);
    void getPilotSetupData()
      .then((data) => {
        const next = cloneSettings(data.settings);
        setSettings(next);
        baselineRef.current = cloneSettings(data.settings);
        setRolePresets(data.rolePresets);
        setUsers(data.users);
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
    if (activeCategory === "kural-onay") {
      setSelectedRuleIntentId("stok");
      setRuleSidebarEditMode(false);
    }
  }, [activeCategory]);

  const checklistDone = useMemo(() => {
    if (!settings) return 0;
    return settings.pilotSetup.checklist.filter((item) => item.completed).length;
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setFeedback(null);
    setFeedbackIsError(false);
    try {
      const next = await savePlatformSettings(settings);
      const cloned = cloneSettings(next);
      setSettings(cloned);
      baselineRef.current = cloned;
      pushToast("Ayarlar kaydedildi.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Kaydetme sırasında hata oluştu.";
      setFeedback(msg);
      setFeedbackIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    if (!baselineRef.current) {
      pushToast("Geri alınacak kayıtlı sürüm yok.");
      return;
    }
    setSettings(cloneSettings(baselineRef.current));
    setFeedback(null);
    setFeedbackIsError(false);
    pushToast("Son kaydedilen sürüme dönüldü.");
  };

  const handleUserCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!newUserName || !newUserEmail) {
      pushToast("Ad soyad ve e-posta zorunludur.");
      return;
    }
    try {
      const created = await quickCreateUser({
        fullName: newUserName,
        email: newUserEmail,
        status: "active",
        roleCode: newUserRoleCode,
        title: "Yerel Geliştirme Kullanıcısı"
      });
      setUsers((previous) => [created, ...previous]);
      setNewUserName("");
      setNewUserEmail("");
      pushToast("Kullanıcı eklendi.");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Kullanıcı eklenemedi.");
    }
  };

  const assistantCopy = useMemo(() => {
    const map: Record<SettingsCategoryId, { hint: string; next: string }> = {
      firma: {
        hint: "Vergi numarası ve IBAN belge çıktılarında kullanılır.",
        next: "Firma bilgileri tamamsa fiyat gruplarını kontrol edin."
      },
      fiyatlar: {
        hint: "Varsayılan fiyat grubu satış ekranında öne çıkar.",
        next: "Fiyatlar tamamsa döviz ve yuvarlama ayarlarını gözden geçirin."
      },
      "para-birimi": {
        hint: "Kur güncellemesi fiyatlandırmayı doğrudan etkiler.",
        next: "Kur ayarlarından sonra depo listesini doğrulayın."
      },
      depolar: {
        hint: "Varsayılan depo sipariş ve stok hareketlerinde kullanılır.",
        next: "Depolar hazırsa kullanıcı ve rolleri kontrol edin."
      },
      kullanicilar: {
        hint: "Roller, menü ve onay kapsamını belirler.",
        next: "Kullanıcılar sonrası bağlantı ve kanal ayarlarına geçin."
      },
      baglantilar: {
        hint: "Dış sistemlerle veri uyumu buradan izlenir.",
        next: "Bağlantılar tamamsa WhatsApp mesaj akışını açın."
      },
      whatsapp: {
        hint: "Mesajların onaya düşmesi riski azaltır.",
        next: "WhatsApp sonrası kural matrisi ve AI onaylarını gözden geçirin."
      },
      "kural-onay": {
        hint: "Niyet bazlı Evet / Hayır / Koşullu kararlar ve şablonlar burada.",
        next: "Matrisi kaydettikten sonra AI ve onay güvenlik ayarlarını kontrol edin."
      },
      "ai-onay": {
        hint: "Kritik işlemler için insan onayı önerilir.",
        next: "AI ayarlarından sonra belge ve arşiv seçeneklerini kontrol edin."
      },
      belgeler: {
        hint: "PDF arşivi bulunabilirlik sağlar.",
        next: "Belge ayarlarından sonra toplu veri yüklemeyi planlayın."
      },
      "veri-yukleme": {
        hint: "Şablonlarla hızlı içe aktarım yapılır.",
        next: "Veri yükledikten sonra canlıya hazırlık kontrolünü çalıştırın."
      },
      guvenlik: {
        hint: "Ayar değişiklikleri kaydetmeden uygulanmaz.",
        next: "Kurulum maddelerini tamamlayıp hazırlık ekranına gidin."
      }
    };
    return map[activeCategory];
  }, [activeCategory]);

  if (loading && !settings) {
    return (
      <div className="hz-settings-page">
        <div className="hz-settings-loading">
          <div className="hz-settings-loading-inner">
            <p className="hz-settings-loading-title">Ayarlar yükleniyor</p>
            <p className="hz-settings-loading-sub">Firma ve kullanıcı bilgileri hazırlanıyor.</p>
            <div className="hz-settings-skel-line" style={{ width: "88%" }} />
            <div className="hz-settings-skel-line" style={{ width: "72%" }} />
            <div className="hz-settings-skel-line" style={{ width: "64%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!settings && loadError) {
    return (
      <div className="hz-settings-page">
        <div className="hz-settings-error">
          <div className="hz-settings-error-card">
            <h2>Ayarlar yüklenemedi</h2>
            <p>{loadError}</p>
            <button type="button" className="hz-settings-retry-btn" onClick={loadData}>
              Tekrar dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const s = settings;
  const selectedIntentRow =
    s.whatsappIntentRules.intents.find((r) => r.intentId === selectedRuleIntentId) ?? s.whatsappIntentRules.intents[0];

  return (
    <div className="hz-settings-page">
      <div className="hz-settings-layout">
        <div className="hz-settings-main">
          <header className="hz-settings-topbar">
            <div className="hz-settings-topbar-text">
              <h1 className="hz-settings-topbar-title">
                Ayarlar
                <span className="hz-settings-pilot-pill" title="Pilot kurulum adımları">
                  {checklistDone}/{s.pilotSetup.checklist.length}
                </span>
              </h1>
            </div>
            <div className="hz-settings-topbar-actions">
              <button
                type="button"
                className="hz-settings-toolbar-btn hz-settings-toolbar-btn--primary"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                <IconSave size={14} />
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
              <button type="button" className="hz-settings-toolbar-btn hz-settings-toolbar-btn--outline" onClick={handleRevert}>
                <IconRotateCcw size={14} />
                Geri Al
              </button>
              <button
                type="button"
                className="hz-settings-toolbar-btn hz-settings-toolbar-btn--outline"
                onClick={() => router.push("/ayarlar/veri-yukleme")}
              >
                <IconUpload size={14} />
                Veri
              </button>
              <button
                type="button"
                className="hz-settings-toolbar-btn hz-settings-toolbar-btn--outline"
                onClick={() => router.push("/ayarlar/kullanim-hazirligi")}
              >
                <IconClipboardCheck size={14} />
                Canlıya
              </button>
            </div>
          </header>

          <div className="hz-settings-category-tabs" role="tablist" aria-label="Ayar bölümleri">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === c.id}
                className={`hz-settings-category-tab${activeCategory === c.id ? " hz-settings-category-tab--active" : ""}`}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {feedback ? (
            <div className={`hz-settings-feedback${feedbackIsError ? " hz-settings-feedback--error" : ""}`}>{feedback}</div>
          ) : null}

          <div className="hz-settings-main-scroll">
            {activeCategory === "firma" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Firma bilgileri</h2>
                  <p className="hz-settings-section-desc">Fatura, teklif ve belgelerde görünecek temel bilgiler.</p>
                </div>
                <div className="hz-settings-form-grid">
                  <label className="hz-settings-label">
                    Firma adı
                    <input
                      className="hz-settings-input"
                      value={s.company.companyName}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, companyName: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Ticari unvan
                    <input
                      className="hz-settings-input"
                      value={s.company.legalName}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, legalName: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Vergi dairesi
                    <input
                      className="hz-settings-input"
                      value={s.company.taxOffice}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, taxOffice: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Vergi numarası
                    <input
                      className="hz-settings-input"
                      value={s.company.taxNumber}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, taxNumber: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Mersis no
                    <input
                      className="hz-settings-input"
                      value={s.company.mersisNo}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, mersisNo: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Telefon
                    <input
                      className="hz-settings-input"
                      value={s.company.phone}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, phone: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    E-posta
                    <input
                      className="hz-settings-input"
                      type="email"
                      value={s.company.email}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, email: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    IBAN
                    <input
                      className="hz-settings-input"
                      value={s.company.iban}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, iban: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label hz-settings-field--full">
                    Adres
                    <textarea
                      className="hz-settings-textarea"
                      value={s.company.address}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, address: e.target.value } })}
                      rows={3}
                    />
                  </label>
                </div>
                <div className="hz-settings-subgrid">
                  <label className="hz-settings-label">
                    Varsayılan para birimi
                    <input className="hz-settings-input" value={s.company.defaultCurrency} readOnly />
                  </label>
                  <label className="hz-settings-label">
                    Muhasebe yılı başlangıcı
                    <input className="hz-settings-input" value={s.company.accountingYearStart} readOnly />
                  </label>
                  <label className="hz-settings-label">
                    Varsayılan vade (gün)
                    <input
                      className="hz-settings-input"
                      value={s.company.defaultDueDay}
                      onChange={(e) =>
                        setSettings({ ...s, company: { ...s.company, defaultDueDay: parseNumber(e.target.value, s.company.defaultDueDay) } })
                      }
                    />
                  </label>
                  <label className="hz-settings-label">
                    Varsayılan KDV (%)
                    <input
                      className="hz-settings-input"
                      value={s.company.defaultVatRate}
                      onChange={(e) =>
                        setSettings({ ...s, company: { ...s.company, defaultVatRate: parseNumber(e.target.value, s.company.defaultVatRate) } })
                      }
                    />
                  </label>
                  <label className="hz-settings-label">
                    Teslim şekli
                    <input
                      className="hz-settings-input"
                      value={s.company.defaultDeliveryMethod}
                      onChange={(e) => setSettings({ ...s, company: { ...s.company, defaultDeliveryMethod: e.target.value } })}
                    />
                  </label>
                </div>
              </article>
            ) : null}

            {activeCategory === "fiyatlar" ? (
              <>
                <article className="hz-settings-section">
                  <div className="hz-settings-section-head">
                    <h2 className="hz-settings-section-title">Fiyat grupları</h2>
                    <p className="hz-settings-section-desc">Bayi, perakende, proje gibi satış fiyatlarını düzenleyin.</p>
                  </div>
                  {s.priceSlots.slots.map((slot) => (
                    <div key={slot.slotNumber} className="hz-settings-slot-row">
                      <span className="hz-settings-slot-num">{slot.slotNumber}</span>
                      <label className="hz-settings-label">
                        Slot adı
                        <input
                          className="hz-settings-input"
                          value={slot.slotName}
                          onChange={(e) =>
                            setSettings({
                              ...s,
                              priceSlots: {
                                slots: s.priceSlots.slots.map((item) =>
                                  item.slotNumber === slot.slotNumber ? { ...item, slotName: e.target.value } : item
                                )
                              }
                            })
                          }
                        />
                      </label>
                      <label className="hz-settings-label">
                        Para
                        <select
                          className="hz-settings-select"
                          value={slot.currency}
                          onChange={(e) =>
                            setSettings({
                              ...s,
                              priceSlots: {
                                slots: s.priceSlots.slots.map((item) =>
                                  item.slotNumber === slot.slotNumber
                                    ? { ...item, currency: e.target.value as PriceSlotConfig["currency"] }
                                    : item
                                )
                              }
                            })
                          }
                        >
                          <option value="TRY">TRY</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </label>
                      <label className="hz-settings-label">
                        Aktif
                        <input
                          type="checkbox"
                          checked={slot.active}
                          onChange={(e) =>
                            setSettings({
                              ...s,
                              priceSlots: {
                                slots: s.priceSlots.slots.map((item) =>
                                  item.slotNumber === slot.slotNumber ? { ...item, active: e.target.checked } : item
                                )
                              }
                            })
                          }
                        />
                      </label>
                      <div className="hz-settings-slot-actions">
                        <label className="hz-settings-label">
                          Varsayılan
                          <input
                            type="radio"
                            checked={s.company.defaultPriceSlotNo === slot.slotNumber}
                            onChange={() => setSettings({ ...s, company: { ...s.company, defaultPriceSlotNo: slot.slotNumber } })}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </article>
                <article className="hz-settings-section">
                  <div className="hz-settings-section-head">
                    <h2 className="hz-settings-section-title">Ürün kategorisi grupları</h2>
                    <p className="hz-settings-section-desc">Dört kategori alanı; rapor ve fiyatlandırmada kullanılır.</p>
                  </div>
                  {s.categorySlots.slots.map((slot: CategorySlotConfig) => (
                    <div key={slot.slotNumber} className="hz-settings-slot-row" style={{ gridTemplateColumns: "44px 1fr 52px" }}>
                      <span className="hz-settings-slot-num">{slot.slotNumber}</span>
                      <label className="hz-settings-label">
                        Ad
                        <input
                          className="hz-settings-input"
                          value={slot.slotName}
                          onChange={(e) =>
                            setSettings({
                              ...s,
                              categorySlots: {
                                slots: s.categorySlots.slots.map((item) =>
                                  item.slotNumber === slot.slotNumber ? { ...item, slotName: e.target.value } : item
                                )
                              }
                            })
                          }
                        />
                      </label>
                      <label className="hz-settings-label">
                        Aktif
                        <input
                          type="checkbox"
                          checked={slot.active}
                          onChange={(e) =>
                            setSettings({
                              ...s,
                              categorySlots: {
                                slots: s.categorySlots.slots.map((item) =>
                                  item.slotNumber === slot.slotNumber ? { ...item, active: e.target.checked } : item
                                )
                              }
                            })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </article>
              </>
            ) : null}

            {activeCategory === "para-birimi" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Kur ve yuvarlama</h2>
                  <p className="hz-settings-section-desc">Döviz kuru ve fiyat yuvarlama davranışını belirleyin.</p>
                </div>
                <div className="hz-settings-form-grid">
                  <label className="hz-settings-label">
                    Kur kaynağı
                    <select
                      className="hz-settings-select"
                      value={s.exchangeRate.provider}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          exchangeRate: { ...s.exchangeRate, provider: e.target.value as "manual" | "api" }
                        })
                      }
                    >
                      <option value="manual">Manuel giriş</option>
                      <option value="api">Dış kaynak</option>
                    </select>
                  </label>
                  <label className="hz-settings-label">
                    Fiyatlama kuru
                    <select
                      className="hz-settings-select"
                      value={s.exchangeRate.pricingRateMode ?? "mb_satis"}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          exchangeRate: { ...s.exchangeRate, pricingRateMode: e.target.value as "mb_satis" | "mb_satis_ek_kur" }
                        })
                      }
                    >
                      <option value="mb_satis">Merkez Bankası satış</option>
                      <option value="mb_satis_ek_kur">MB satış + ek fark</option>
                    </select>
                  </label>
                  <label className="hz-settings-label">
                    Yuvarlama
                    <select
                      className="hz-settings-select"
                      value={s.exchangeRate.roundingType ?? "matematiksel"}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          exchangeRate: {
                            ...s.exchangeRate,
                            roundingType: e.target.value as "matematiksel" | "yukari" | "asagi"
                          }
                        })
                      }
                    >
                      <option value="matematiksel">Matematiksel</option>
                      <option value="yukari">Yukarı</option>
                      <option value="asagi">Aşağı</option>
                    </select>
                  </label>
                  <label className="hz-settings-label">
                    Ek kur farkı (%)
                    <input
                      className="hz-settings-input"
                      value={s.exchangeRate.additionalSpreadPercent ?? 0}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          exchangeRate: { ...s.exchangeRate, additionalSpreadPercent: parseNumber(e.target.value, 0) }
                        })
                      }
                    />
                  </label>
                  <label className="hz-settings-label">
                    Ek kur sabit tutar
                    <input
                      className="hz-settings-input"
                      value={s.exchangeRate.spreadFixedAmount ?? 0}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          exchangeRate: { ...s.exchangeRate, spreadFixedAmount: parseNumber(e.target.value, 0) }
                        })
                      }
                    />
                  </label>
                  <label className="hz-settings-label">
                    Otomatik güncelleme (dk)
                    <input
                      className="hz-settings-input"
                      value={s.exchangeRate.updateIntervalMinutes}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          exchangeRate: { ...s.exchangeRate, updateIntervalMinutes: parseNumber(e.target.value, 60) }
                        })
                      }
                    />
                  </label>
                </div>
                <p className="hz-settings-risk-note" style={{ marginTop: "10px" }}>
                  Son güncelleme: {s.exchangeRate.lastUpdatedAt ?? "—"} · Kaynak: {s.exchangeRate.sourceLabel ?? "—"}
                </p>
              </article>
            ) : null}

            {activeCategory === "depolar" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Depolar</h2>
                  <p className="hz-settings-section-desc">Merkez, şube ve transfer depolarını yönetin.</p>
                </div>
                {s.warehouses.map((warehouse: WarehouseSetupItem) => (
                  <div key={warehouse.id} className="hz-settings-wh-row">
                    <span className="hz-settings-badge hz-settings-badge--neutral">{warehouse.code}</span>
                    <label className="hz-settings-label">
                      Depo adı
                      <input
                        className="hz-settings-input"
                        value={warehouse.name}
                        onChange={(e) =>
                          setSettings({
                            ...s,
                            warehouses: s.warehouses.map((item) => (item.id === warehouse.id ? { ...item, name: e.target.value } : item))
                          })
                        }
                      />
                    </label>
                    <label className="hz-settings-label">
                      Tip
                      <select
                        className="hz-settings-select"
                        value={warehouse.warehouseType}
                        onChange={(e) =>
                          setSettings({
                            ...s,
                            warehouses: s.warehouses.map((item) =>
                              item.id === warehouse.id
                                ? { ...item, warehouseType: e.target.value as WarehouseSetupItem["warehouseType"] }
                                : item
                            )
                          })
                        }
                      >
                        <option value="center">Merkez</option>
                        <option value="branch">Şube</option>
                        <option value="transfer">Transfer</option>
                      </select>
                    </label>
                    <label className="hz-settings-label">
                      Aktif
                      <input
                        type="checkbox"
                        checked={warehouse.active}
                        onChange={(e) =>
                          setSettings({
                            ...s,
                            warehouses: s.warehouses.map((item) =>
                              item.id === warehouse.id ? { ...item, active: e.target.checked } : item
                            )
                          })
                        }
                      />
                    </label>
                    <label className="hz-settings-label">
                      Sıra
                      <input
                        className="hz-settings-input"
                        value={warehouse.sortOrder}
                        onChange={(e) =>
                          setSettings({
                            ...s,
                            warehouses: s.warehouses.map((item) =>
                              item.id === warehouse.id ? { ...item, sortOrder: parseNumber(e.target.value, item.sortOrder) } : item
                            )
                          })
                        }
                      />
                    </label>
                    <label className="hz-settings-label">
                      Varsayılan
                      <input
                        type="radio"
                        checked={warehouse.isDefault}
                        onChange={() =>
                          setSettings({
                            ...s,
                            warehouses: s.warehouses.map((item) => ({ ...item, isDefault: item.id === warehouse.id })),
                            company: { ...s.company, defaultWarehouseId: warehouse.id }
                          })
                        }
                      />
                    </label>
                  </div>
                ))}
              </article>
            ) : null}

            {activeCategory === "kullanicilar" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Kullanıcılar ve yetkiler</h2>
                  <p className="hz-settings-section-desc">Ekibinizi ekleyin; rol özetlerini buradan izleyin.</p>
                </div>
                <h3 className="hz-settings-side-card-title" style={{ marginBottom: "6px" }}>
                  Rol özetleri
                </h3>
                {rolePresets.map((preset) => (
                  <div key={preset.id} className="hz-settings-preset-row">
                    <div className="hz-settings-preset-name">{preset.name}</div>
                    <div className="hz-settings-preset-desc">{preset.description}</div>
                    <div className="hz-settings-preset-desc">{preset.moduleAccess.join(", ")}</div>
                    <span className="hz-settings-badge hz-settings-badge--neutral">{preset.approvalEnabled ? "Onaylı" : "Onaysız"}</span>
                  </div>
                ))}
                <form className="hz-settings-user-form" onSubmit={(e) => void handleUserCreate(e)} style={{ marginTop: "14px" }}>
                  <label className="hz-settings-label">
                    Ad Soyad
                    <input className="hz-settings-input" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                  </label>
                  <label className="hz-settings-label">
                    E-posta
                    <input className="hz-settings-input" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                  </label>
                  <label className="hz-settings-label">
                    Rol
                    <select className="hz-settings-select" value={newUserRoleCode} onChange={(e) => setNewUserRoleCode(e.target.value)}>
                      <option value="yonetici">Yönetici</option>
                      <option value="satis">Satış</option>
                      <option value="muhasebe">Muhasebe</option>
                      <option value="depo">Depo</option>
                      <option value="pazarlama">Pazarlama</option>
                    </select>
                  </label>
                  <button type="submit" className="hz-settings-toolbar-btn hz-settings-toolbar-btn--primary">
                    <IconUser size={14} />
                    Ekle
                  </button>
                </form>
                <h3 className="hz-settings-side-card-title">Kullanıcı listesi</h3>
                {users.length === 0 ? (
                  <p className="hz-settings-risk-note">Henüz kullanıcı yok.</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="hz-settings-user-row">
                      <span>{user.fullName}</span>
                      <span>{user.email}</span>
                      <span className="hz-settings-badge hz-settings-badge--neutral">{user.status}</span>
                      <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "—"}</span>
                    </div>
                  ))
                )}
              </article>
            ) : null}

            {activeCategory === "baglantilar" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Bağlantılar</h2>
                  <p className="hz-settings-section-desc">ERP, WhatsApp ve servis bağlantılarının durumunu kontrol edin.</p>
                </div>
                <div className="hz-settings-form-grid" style={{ marginBottom: "10px" }}>
                  <label className="hz-settings-label">
                    ERP bağlantısı
                    <input
                      type="checkbox"
                      checked={s.erp.enabled}
                      onChange={(e) => setSettings({ ...s, erp: { ...s.erp, enabled: e.target.checked } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    ERP türü
                    <select
                      className="hz-settings-select"
                      value={s.erp.provider}
                      onChange={(e) =>
                        setSettings({ ...s, erp: { ...s.erp, provider: e.target.value as typeof s.erp.provider } })
                      }
                    >
                      <option value="none">Kapalı</option>
                      <option value="netsis">Netsis</option>
                      <option value="sap">SAP</option>
                      <option value="custom">Özel</option>
                    </select>
                  </label>
                  <label className="hz-settings-label">
                    Senkron aralığı (dk)
                    <input
                      className="hz-settings-input"
                      value={s.erp.syncIntervalMinutes}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          erp: { ...s.erp, syncIntervalMinutes: parseNumber(e.target.value, s.erp.syncIntervalMinutes) }
                        })
                      }
                    />
                  </label>
                </div>
                <div className="hz-settings-conn-row">
                  <span>ERP özeti</span>
                  <span className={`hz-settings-badge ${s.erp.enabled ? "hz-settings-badge--ok" : "hz-settings-badge--bad"}`}>
                    {erpLabel(s.erp.provider)}
                  </span>
                </div>
                <div className="hz-settings-conn-row">
                  <span>WhatsApp kanalı</span>
                  <span className={`hz-settings-badge ${s.whatsapp.enabled ? "hz-settings-badge--ok" : "hz-settings-badge--warn"}`}>
                    {s.whatsapp.enabled ? "Açık" : "Kapalı"}
                  </span>
                </div>
                <div className="hz-settings-conn-row">
                  <span>AI hizmeti</span>
                  <span className={`hz-settings-badge ${s.ai.enabled ? "hz-settings-badge--ok" : "hz-settings-badge--warn"}`}>
                    {s.ai.enabled ? "Açık" : "Kapalı"}
                  </span>
                </div>
                <div className="hz-settings-conn-row">
                  <span>Fabrika bağlantısı</span>
                  <span className="hz-settings-badge hz-settings-badge--warn">Hazırlıkta</span>
                </div>
                <div className="hz-settings-conn-row">
                  <span>Yerel servis</span>
                  <span className="hz-settings-badge hz-settings-badge--ok">Hazır</span>
                </div>
                <button
                  type="button"
                  className="hz-settings-toolbar-btn hz-settings-toolbar-btn--outline"
                  style={{ marginTop: "10px" }}
                  onClick={() => router.push("/ayarlar/staging-kontrol")}
                >
                  <IconExternalLink size={14} />
                  Hazırlık kontrolü
                </button>
              </article>
            ) : null}

            {activeCategory === "kural-onay" ? (
              <article className="hz-settings-section hz-settings-section--rule-compact">
                <WhatsAppIntentRulesSection
                  value={s.whatsappIntentRules}
                  selectedIntentId={selectedRuleIntentId}
                  onSelectIntent={(id) => {
                    setSelectedRuleIntentId(id);
                    setRuleSidebarEditMode(false);
                  }}
                  onEditIntent={(id) => {
                    setSelectedRuleIntentId(id);
                    setRuleSidebarEditMode(true);
                  }}
                  aiHumanApprovalRequired={s.ai.humanApprovalRequired}
                />
              </article>
            ) : null}

            {activeCategory === "whatsapp" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">WhatsApp ayarları</h2>
                  <p className="hz-settings-section-desc">Mesajların nasıl alınacağını ve onaya düşeceğini belirleyin.</p>
                </div>
                <div className="hz-settings-form-grid">
                  <label className="hz-settings-label">
                    WhatsApp açık
                    <input
                      type="checkbox"
                      checked={s.whatsapp.enabled}
                      onChange={(e) => setSettings({ ...s, whatsapp: { ...s.whatsapp, enabled: e.target.checked } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Bağlantı tipi
                    <select
                      className="hz-settings-select"
                      value={s.whatsapp.provider}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          whatsapp: { ...s.whatsapp, provider: e.target.value as typeof s.whatsapp.provider }
                        })
                      }
                    >
                      <option value="meta">Meta</option>
                      <option value="twilio">Twilio</option>
                      <option value="custom">Özel</option>
                    </select>
                  </label>
                  <label className="hz-settings-label">
                    Gönderen adı
                    <input
                      className="hz-settings-input"
                      value={s.whatsapp.defaultSenderName}
                      onChange={(e) => setSettings({ ...s, whatsapp: { ...s.whatsapp, defaultSenderName: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Mesajda onay iste
                    <input
                      type="checkbox"
                      checked={s.whatsapp.approvalRequired}
                      onChange={(e) => setSettings({ ...s, whatsapp: { ...s.whatsapp, approvalRequired: e.target.checked } })}
                    />
                  </label>
                </div>
              </article>
            ) : null}

            {activeCategory === "ai-onay" ? (
              <article className="hz-settings-section hz-settings-section--ai-compact">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">AI ve onay</h2>
                  <p className="hz-settings-section-desc">Kısa anahtarlar; ayrıntılar Kural ve Onay sekmesindedir.</p>
                </div>
                <div className="hz-settings-ai-compact-grid">
                  <div className="hz-settings-ai-toggle-card">
                    <span className="hz-settings-ai-toggle-label">AI açık</span>
                    <button
                      type="button"
                      className={`hz-settings-switch${s.ai.enabled ? " hz-settings-switch--on" : ""}`}
                      role="switch"
                      aria-checked={s.ai.enabled}
                      onClick={() => setSettings({ ...s, ai: { ...s.ai, enabled: !s.ai.enabled } })}
                    />
                  </div>
                  <div className="hz-settings-ai-toggle-card">
                    <span className="hz-settings-ai-toggle-label">Yerel AI</span>
                    <button
                      type="button"
                      className={`hz-settings-switch${s.ai.localInferenceEnabled ? " hz-settings-switch--on" : ""}`}
                      role="switch"
                      aria-checked={s.ai.localInferenceEnabled}
                      onClick={() =>
                        setSettings({ ...s, ai: { ...s.ai, localInferenceEnabled: !s.ai.localInferenceEnabled } })
                      }
                    />
                  </div>
                  <div className="hz-settings-ai-toggle-card">
                    <span className="hz-settings-ai-toggle-label">İnsan onayı</span>
                    <button
                      type="button"
                      className={`hz-settings-switch${s.ai.humanApprovalRequired ? " hz-settings-switch--on" : ""}`}
                      role="switch"
                      aria-checked={s.ai.humanApprovalRequired}
                      onClick={() =>
                        setSettings({ ...s, ai: { ...s.ai, humanApprovalRequired: !s.ai.humanApprovalRequired } })
                      }
                    />
                  </div>
                  <div className="hz-settings-ai-toggle-card">
                    <span className="hz-settings-ai-toggle-label">Model kodu</span>
                    <input
                      className="hz-settings-input hz-settings-ai-model-input"
                      value={s.ai.defaultModel}
                      onChange={(e) => setSettings({ ...s, ai: { ...s.ai, defaultModel: e.target.value } })}
                      aria-label="Varsayılan model"
                    />
                  </div>
                </div>
                <article className="hz-settings-info-card hz-settings-info-card--muted hz-settings-ai-matrix-card">
                  <h3 className="hz-settings-info-card-title">AI ve kural matrisi</h3>
                  <ul className="hz-settings-info-card-list hz-settings-ai-matrix-list">
                    <li>AI talebi sınıflandırır.</li>
                    <li>AI tek başına sipariş/ödeme/iade/fatura yapmaz.</li>
                    <li>Kural ve Onay matrisine göre cevap taslağı üretir.</li>
                    <li>Onay gerekiyorsa Onaylar ekranına düşer.</li>
                  </ul>
                </article>
              </article>
            ) : null}

            {activeCategory === "belgeler" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Belge ve arşiv</h2>
                  <p className="hz-settings-section-desc">PDF şablonu, kayıt yeri ve otomatik arşiv ayarlarını yönetin.</p>
                </div>
                <div className="hz-settings-form-grid">
                  <label className="hz-settings-label hz-settings-field--full">
                    Varsayılan çıktı şablonu
                    <input
                      className="hz-settings-input"
                      value={s.printSave.defaultPrintTemplate}
                      onChange={(e) => setSettings({ ...s, printSave: { ...s.printSave, defaultPrintTemplate: e.target.value } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Otomatik PDF arşivi
                    <input
                      type="checkbox"
                      checked={s.printSave.autoPdfArchiveEnabled}
                      onChange={(e) => setSettings({ ...s, printSave: { ...s.printSave, autoPdfArchiveEnabled: e.target.checked } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Saklama yeri
                    <select
                      className="hz-settings-select"
                      value={s.printSave.storageProvider}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          printSave: { ...s.printSave, storageProvider: e.target.value as typeof s.printSave.storageProvider }
                        })
                      }
                    >
                      <option value="local">Sunucu klasörü</option>
                      <option value="s3">Bulut depo</option>
                      <option value="custom">Özel</option>
                    </select>
                  </label>
                </div>
              </article>
            ) : null}

            {activeCategory === "veri-yukleme" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Veri yükleme</h2>
                  <p className="hz-settings-section-desc">Cari, ürün, fiyat, depo ve stok dosyalarını buradan hazırlayın.</p>
                </div>
                <div className="hz-settings-link-grid">
                  <div className="hz-settings-link-card">
                    <h4>Cari yükle</h4>
                    <p>Müşteri listesi şablonu ile içe aktarın.</p>
                    <button type="button" className="hz-settings-side-link" onClick={() => pushToast("Demo: cari yükleme sihirbazı açılacak.")}>
                      <IconUpload size={14} />
                      Başlat
                    </button>
                  </div>
                  <div className="hz-settings-link-card">
                    <h4>Ürün yükle</h4>
                    <p>Stok kodu ve barkodlarla ürün aktarın.</p>
                    <button type="button" className="hz-settings-side-link" onClick={() => pushToast("Demo: ürün yükleme sihirbazı açılacak.")}>
                      <IconPackage size={14} />
                      Başlat
                    </button>
                  </div>
                  <div className="hz-settings-link-card">
                    <h4>Fiyat yükle</h4>
                    <p>Fiyat listelerini toplu güncelleyin.</p>
                    <button type="button" className="hz-settings-side-link" onClick={() => pushToast("Demo: fiyat yükleme sihirbazı açılacak.")}>
                      <IconDatabase size={14} />
                      Başlat
                    </button>
                  </div>
                  <div className="hz-settings-link-card">
                    <h4>Depo / stok</h4>
                    <p>Depo ve stok hareket şablonları.</p>
                    <button type="button" className="hz-settings-side-link" onClick={() => pushToast("Demo: stok yükleme sihirbazı açılacak.")}>
                      <IconWarehouse size={14} />
                      Başlat
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="hz-settings-toolbar-btn hz-settings-toolbar-btn--primary"
                  style={{ marginTop: "12px" }}
                  onClick={() => router.push("/ayarlar/veri-yukleme")}
                >
                  <IconExternalLink size={14} />
                  Veri yükleme merkezini aç
                </button>
              </article>
            ) : null}

            {activeCategory === "guvenlik" ? (
              <article className="hz-settings-section">
                <div className="hz-settings-section-head">
                  <h2 className="hz-settings-section-title">Güvenlik ve erişim</h2>
                  <p className="hz-settings-section-desc">Görünüm tercihleri, kurulum maddeleri ve denetim özeti.</p>
                </div>
                <div className="hz-settings-form-grid">
                  <label className="hz-settings-label">
                    Tema varsayılanı
                    <select
                      className="hz-settings-select"
                      value={s.theme.defaultMode}
                      onChange={(e) =>
                        setSettings({ ...s, theme: { ...s.theme, defaultMode: e.target.value as typeof s.theme.defaultMode } })
                      }
                    >
                      <option value="light">Açık</option>
                      <option value="dark">Koyu</option>
                      <option value="system">Sistem</option>
                    </select>
                  </label>
                  <label className="hz-settings-label">
                    Kullanıcı tema değiştirebilir
                    <input
                      type="checkbox"
                      checked={s.theme.allowUserOverride}
                      onChange={(e) => setSettings({ ...s, theme: { ...s.theme, allowUserOverride: e.target.checked } })}
                    />
                  </label>
                  <label className="hz-settings-label">
                    Kompakt görünüm
                    <input
                      type="checkbox"
                      checked={s.theme.compactDensity}
                      onChange={(e) => setSettings({ ...s, theme: { ...s.theme, compactDensity: e.target.checked } })}
                    />
                  </label>
                </div>
                <h3 className="hz-settings-side-card-title" style={{ marginTop: "14px" }}>
                  Canlıya geçiş kontrolü
                </h3>
                {s.pilotSetup.checklist.map((item) => (
                  <div key={item.id} className="hz-settings-check-row">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) =>
                        setSettings({
                          ...s,
                          pilotSetup: {
                            ...s.pilotSetup,
                            checklist: s.pilotSetup.checklist.map((c) => (c.id === item.id ? { ...c, completed: e.target.checked } : c)),
                            importReady:
                              s.pilotSetup.checklist.filter((c) => (c.id === item.id ? e.target.checked : c.completed)).length ===
                              s.pilotSetup.checklist.length
                          }
                        })
                      }
                    />
                    <span>{item.title}</span>
                  </div>
                ))}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                  <button type="button" className="hz-settings-toolbar-btn hz-settings-toolbar-btn--outline" onClick={() => pushToast("Demo: son girişler listesi.")}>
                    Son girişler
                  </button>
                  <button type="button" className="hz-settings-toolbar-btn hz-settings-toolbar-btn--outline" onClick={() => pushToast("Demo: denetim izi.")}>
                    Denetim izi
                  </button>
                </div>
              </article>
            ) : null}
          </div>
        </div>

        <aside className="hz-settings-side" aria-label="Ayar Asistanı">
          <div className="hz-settings-side-inner">
            <header className="hz-settings-side-head">
              <h2 className="hz-settings-side-title">Ayar Asistanı</h2>
              <p className="hz-settings-side-sub">Seçili ayar için eksik, risk ve sonraki adımları gösterir.</p>
            </header>
            <div className="hz-settings-side-stack">
              <article className="hz-settings-side-card">
                <h3 className="hz-settings-side-card-title">Seçili bölüm</h3>
                <p>
                  <strong>{CATEGORIES.find((c) => c.id === activeCategory)?.label}</strong>
                </p>
                <span className={`hz-settings-badge ${companyProfileStatus(s.company) === "Dolu" ? "hz-settings-badge--ok" : "hz-settings-badge--warn"}`}>
                  {companyProfileStatus(s.company) === "Dolu" ? "Profil tamam" : "Eksik alan var"}
                </span>
              </article>
              {activeCategory === "kural-onay" ? (
                <IntentRuleAssistantPanel
                  rule={selectedIntentRow}
                  editMode={ruleSidebarEditMode}
                  onEditMode={setRuleSidebarEditMode}
                  onChangeRule={(patch) =>
                    setSettings({
                      ...s,
                      whatsappIntentRules: {
                        intents: s.whatsappIntentRules.intents.map((r) =>
                          r.intentId === selectedRuleIntentId ? { ...r, ...patch } : r
                        )
                      }
                    })
                  }
                />
              ) : null}
              <article className="hz-settings-side-card">
                <h3 className="hz-settings-side-card-title">Dikkat gerekenler</h3>
                <p>{assistantCopy.hint}</p>
              </article>
              <article className="hz-settings-side-card">
                <h3 className="hz-settings-side-card-title">Sonraki adım</h3>
                <p>{assistantCopy.next}</p>
              </article>
              <article className="hz-settings-side-card">
                <h3 className="hz-settings-side-card-title">Hızlı bağlantılar</h3>
                {activeCategory === "kural-onay" ? (
                  <>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/whatsapp")}>
                      <IconMessageCircle size={14} />
                      WhatsApp
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/onaylar")}>
                      <IconClipboardCheck size={14} />
                      Onaylar
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => setActiveCategory("ai-onay")}>
                      <IconZap size={14} />
                      AI ve Onay
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/ayarlar/staging-kontrol")}>
                      <IconShieldCheck size={14} />
                      Hazırlık kontrolü
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/raporlar")}>
                      <IconBarChart3 size={14} />
                      Raporlar
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/ayarlar/veri-yukleme")}>
                      <IconUpload size={14} />
                      Veri yükleme
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/ayarlar/kullanim-hazirligi")}>
                      <IconClipboardCheck size={14} />
                      Kullanım hazırlığı
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/ayarlar/staging-kontrol")}>
                      <IconShieldCheck size={14} />
                      Hazırlık kontrolü
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/raporlar")}>
                      <IconBarChart3 size={14} />
                      Raporlar
                    </button>
                    <button type="button" className="hz-settings-side-link" onClick={() => router.push("/archive")}>
                      <IconArchive size={14} />
                      Arşiv
                    </button>
                  </>
                )}
              </article>
              {activeCategory !== "kural-onay" ? (
                <article className="hz-settings-side-card">
                  <h3 className="hz-settings-side-card-title">AI ve güvenlik notu</h3>
                  <p className="hz-settings-risk-note">AI ayarları öneri üretir; kritik işlemler insan onayından geçer.</p>
                  <p className="hz-settings-risk-note">Ayar değişiklikleri kaydetmeden uygulanmaz.</p>
                </article>
              ) : (
                <article className="hz-settings-side-card">
                  <h3 className="hz-settings-side-card-title">Kayıt</h3>
                  <p className="hz-settings-risk-note">Değişiklikler üstteki Kaydet ile saklanır.</p>
                </article>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
