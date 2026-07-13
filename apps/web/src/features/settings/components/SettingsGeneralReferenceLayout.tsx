"use client";

import Link from "next/link";
import type { PlatformSettings } from "@hallederiz/types";
import {
  SETTINGS_FORM_CATEGORIES,
  useSettingsFormState,
  type SettingsFormCategoryId
} from "../hooks/use-settings-form-state";
import { SettingsLoadErrorView } from "./SettingsLoadErrorView";
import { WhatsAppConnectionMethodsSection } from "./WhatsAppConnectionMethodsSection";

function SettingsFormFields({
  category,
  settings,
  onChange
}: {
  category: SettingsFormCategoryId;
  settings: PlatformSettings;
  onChange: (next: PlatformSettings) => void;
}) {
  const s = settings;

  if (category === "firma") {
    return (
      <div className="setf-form-grid">
        <label className="setf-field">
          Firma adı
          <input
            className="setf-input"
            value={s.company.companyName}
            onChange={(e) => onChange({ ...s, company: { ...s.company, companyName: e.target.value } })}
          />
        </label>
        <label className="setf-field">
          Ticari unvan
          <input
            className="setf-input"
            value={s.company.legalName}
            onChange={(e) => onChange({ ...s, company: { ...s.company, legalName: e.target.value } })}
          />
        </label>
        <label className="setf-field">
          Vergi dairesi
          <input
            className="setf-input"
            value={s.company.taxOffice}
            onChange={(e) => onChange({ ...s, company: { ...s.company, taxOffice: e.target.value } })}
          />
        </label>
        <label className="setf-field">
          Vergi numarası
          <input
            className="setf-input"
            value={s.company.taxNumber}
            onChange={(e) => onChange({ ...s, company: { ...s.company, taxNumber: e.target.value } })}
          />
        </label>
        <label className="setf-field">
          Telefon
          <input
            className="setf-input"
            value={s.company.phone}
            onChange={(e) => onChange({ ...s, company: { ...s.company, phone: e.target.value } })}
          />
        </label>
        <label className="setf-field">
          E-posta
          <input
            className="setf-input"
            type="email"
            value={s.company.email}
            onChange={(e) => onChange({ ...s, company: { ...s.company, email: e.target.value } })}
          />
        </label>
        <label className="setf-field setf-field--full">
          Adres
          <textarea
            className="setf-textarea"
            value={s.company.address}
            onChange={(e) => onChange({ ...s, company: { ...s.company, address: e.target.value } })}
            rows={3}
          />
        </label>
      </div>
    );
  }

  if (category === "fiyatlar") {
    return (
      <div className="setf-form-grid">
        {s.priceSlots.slots.map((slot) => (
          <label key={slot.slotNumber} className="setf-field">
            Slot {slot.slotNumber} etiketi
            <input
              className="setf-input"
              value={slot.slotName}
              onChange={(e) =>
                onChange({
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
        ))}
      </div>
    );
  }

  if (category === "para-birimi") {
    return (
      <div className="setf-form-grid">
        <label className="setf-field">
          Baz para birimi
          <input
            className="setf-input"
            value={s.exchangeRate.baseCurrency}
            onChange={(e) =>
              onChange({ ...s, exchangeRate: { ...s.exchangeRate, baseCurrency: e.target.value } })
            }
          />
        </label>
        <label className="setf-field">
          Kur kaynağı
          <select
            className="setf-select"
            value={s.exchangeRate.provider}
            onChange={(e) =>
              onChange({
                ...s,
                exchangeRate: { ...s.exchangeRate, provider: e.target.value as "manual" | "api" }
              })
            }
          >
            <option value="manual">Manuel</option>
            <option value="api">API</option>
          </select>
        </label>
        <label className="setf-field">
          Yuvarlama
          <select
            className="setf-select"
            value={s.exchangeRate.roundingType ?? "matematiksel"}
            onChange={(e) =>
              onChange({
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
        <label className="setf-field">
          Otomatik güncelleme
          <select
            className="setf-select"
            value={s.exchangeRate.autoUpdateEnabled ? "yes" : "no"}
            onChange={(e) =>
              onChange({
                ...s,
                exchangeRate: { ...s.exchangeRate, autoUpdateEnabled: e.target.value === "yes" }
              })
            }
          >
            <option value="yes">Açık</option>
            <option value="no">Kapalı</option>
          </select>
        </label>
      </div>
    );
  }

  if (category === "depolar") {
    return (
      <div className="setf-card-grid">
        {s.warehouses.map((warehouse) => (
          <article key={warehouse.id} className="setf-card">
            <h4>
              {warehouse.name}{" "}
              <span className={warehouse.active ? "setf-badge setf-badge--success" : "setf-badge setf-badge--neutral"}>
                {warehouse.active ? "Aktif" : "Pasif"}
              </span>
            </h4>
            <p>
              Kod: {warehouse.code} · Tip: {warehouse.warehouseType}
              {warehouse.isDefault ? " · Varsayılan" : ""}
            </p>
          </article>
        ))}
      </div>
    );
  }

  if (category === "baglantilar") {
    return (
      <div className="setf-form-grid">
        <label className="setf-field">
          ERP etkin
          <select
            className="setf-select"
            value={s.erp.enabled ? "yes" : "no"}
            onChange={(e) => onChange({ ...s, erp: { ...s.erp, enabled: e.target.value === "yes" } })}
          >
            <option value="yes">Açık</option>
            <option value="no">Kapalı</option>
          </select>
        </label>
        <label className="setf-field">
          ERP sağlayıcı
          <select
            className="setf-select"
            value={s.erp.provider}
            onChange={(e) =>
              onChange({
                ...s,
                erp: { ...s.erp, provider: e.target.value as PlatformSettings["erp"]["provider"] }
              })
            }
          >
            <option value="none">Kapalı</option>
            <option value="netsis">Netsis</option>
            <option value="sap">SAP</option>
            <option value="custom">Özel</option>
          </select>
        </label>
        <label className="setf-field">
          Senkron aralığı (dk)
          <input
            className="setf-input"
            type="number"
            value={s.erp.syncIntervalMinutes}
            onChange={(e) =>
              onChange({ ...s, erp: { ...s.erp, syncIntervalMinutes: Number(e.target.value) || 0 } })
            }
          />
        </label>
        <label className="setf-field">
          AI yerel çıkarım
          <select
            className="setf-select"
            value={s.ai.localInferenceEnabled ? "yes" : "no"}
            onChange={(e) => onChange({ ...s, ai: { ...s.ai, localInferenceEnabled: e.target.value === "yes" } })}
          >
            <option value="yes">Açık</option>
            <option value="no">Kapalı</option>
          </select>
        </label>
      </div>
    );
  }

  if (category === "whatsapp") {
    return <WhatsAppConnectionMethodsSection settings={s} onChange={onChange} layout="reference" />;
  }

  if (category === "belgeler") {
    return (
      <div className="setf-form-grid">
        <label className="setf-field">
          PDF şablonu
          <input
            className="setf-input"
            value={s.printSave.defaultPrintTemplate}
            onChange={(e) => onChange({ ...s, printSave: { ...s.printSave, defaultPrintTemplate: e.target.value } })}
          />
        </label>
        <label className="setf-field">
          Otomatik arşiv
          <select
            className="setf-select"
            value={s.printSave.autoPdfArchiveEnabled ? "yes" : "no"}
            onChange={(e) =>
              onChange({ ...s, printSave: { ...s.printSave, autoPdfArchiveEnabled: e.target.value === "yes" } })
            }
          >
            <option value="yes">Açık</option>
            <option value="no">Kapalı</option>
          </select>
        </label>
        <label className="setf-field">
          Depolama
          <select
            className="setf-select"
            value={s.printSave.storageProvider}
            onChange={(e) =>
              onChange({
                ...s,
                printSave: { ...s.printSave, storageProvider: e.target.value as PlatformSettings["printSave"]["storageProvider"] }
              })
            }
          >
            <option value="local">Yerel</option>
            <option value="s3">S3</option>
            <option value="custom">Özel</option>
          </select>
        </label>
      </div>
    );
  }

  return (
    <div className="setf-form-grid">
      <label className="setf-field">
        AI etkin
        <select
          className="setf-select"
          value={s.ai.enabled ? "yes" : "no"}
          onChange={(e) => onChange({ ...s, ai: { ...s.ai, enabled: e.target.value === "yes" } })}
        >
          <option value="yes">Açık</option>
          <option value="no">Kapalı</option>
        </select>
      </label>
      <label className="setf-field">
        İnsan onayı zorunlu
        <select
          className="setf-select"
          value={s.ai.humanApprovalRequired ? "yes" : "no"}
          onChange={(e) => onChange({ ...s, ai: { ...s.ai, humanApprovalRequired: e.target.value === "yes" } })}
        >
          <option value="yes">Zorunlu</option>
          <option value="no">Opsiyonel</option>
        </select>
      </label>
      <label className="setf-field">
        Varsayılan model
        <input
          className="setf-input"
          value={s.ai.defaultModel}
          onChange={(e) => onChange({ ...s, ai: { ...s.ai, defaultModel: e.target.value } })}
        />
      </label>
      <label className="setf-field">
        WhatsApp onay zorunlu
        <select
          className="setf-select"
          value={s.whatsapp.approvalRequired ? "yes" : "no"}
          onChange={(e) =>
            onChange({ ...s, whatsapp: { ...s.whatsapp, approvalRequired: e.target.value === "yes" } })
          }
        >
          <option value="yes">Evet</option>
          <option value="no">Hayır</option>
        </select>
      </label>
    </div>
  );
}

export function SettingsGeneralReferenceLayout() {
  const form = useSettingsFormState();

  if (form.loading && !form.settings) {
    return (
      <div className="setf-home" data-page="settings-general-reference">
        <div className="setf-state" role="status">
          Genel ayarlar yükleniyor…
        </div>
      </div>
    );
  }

  if (!form.settings && form.loadError) {
    return (
      <div className="setf-home" data-page="settings-general-reference">
        <SettingsLoadErrorView
          failure={form.loadError}
          onRetry={form.loadData}
          layout="reference"
          retrying={form.loading}
          genericTitle="Genel ayarlar yüklenemedi"
        />
      </div>
    );
  }

  if (!form.settings) return null;

  const categoryLabel = SETTINGS_FORM_CATEGORIES.find((c) => c.id === form.activeCategory)?.label ?? "Genel";

  return (
    <div className="setf-home setf-home--workspace" data-page="settings-general-reference" aria-live="polite">
      <p className="setf-crumb">
        <Link href="/ayarlar" className="setf-crumb-link">
          Ayarlar
        </Link>
        <span className="setf-crumb-sep" aria-hidden>
          /
        </span>
        <span>Genel</span>
      </p>

      <header className="setf-head">
        <div className="setf-head-text">
          <h1>
            Genel Ayarlar{" "}
            <span className="setf-badge setf-badge--info">
              {form.checklistDone}/{form.settings.pilotSetup.checklist.length}
            </span>
          </h1>
          <p>Firma, fiyat, entegrasyon ve platform yapılandırması.</p>
        </div>
        <div className="setf-head-actions">
          <button type="button" className="setf-btn setf-btn--primary" disabled={form.saving} onClick={form.handleSave}>
            {form.saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <button type="button" className="setf-btn setf-btn--outline" onClick={form.handleRevert}>
            Geri Al
          </button>
        </div>
      </header>

      <p className="setf-demo-band" role="status">
        Kiracı ayarları gösterilir; kaydetme demo toast ile sınırlıdır — gerçek mutation sonraki fazda bağlanır.
      </p>

      <nav className="setf-tabs" aria-label="Ayar bölümleri">
        {SETTINGS_FORM_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={form.activeCategory === category.id ? "setf-tab setf-tab--active" : "setf-tab"}
            aria-selected={form.activeCategory === category.id}
            onClick={() => form.setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <div className="setf-workspace">
        <section className="setf-main" aria-label="Ayar formu">
          <div className="setf-main-scroll">
            <div className="setf-section-head">
              <h2>{categoryLabel}</h2>
              <p>{form.assistantCopy.hint}</p>
            </div>
            <SettingsFormFields
              category={form.activeCategory}
              settings={form.settings}
              onChange={form.setSettings}
            />
          </div>
        </section>

        <aside className="setf-side" aria-label="Bağlam paneli">
          <div className="setf-side-card">
            <h3>Sonraki adım</h3>
            <p>{form.assistantCopy.next}</p>
          </div>
          <div className="setf-side-card">
            <h3>Hızlı bağlantılar</h3>
            <ul className="setf-side-list">
              <li>
                <Link href="/ayarlar/veri-yukleme">Veri yükleme merkezi</Link>
              </li>
              <li>
                <Link href="/ayarlar/staging-kontrol">Hazırlık kontrolü</Link>
              </li>
              <li>
                <Link href="/ayarlar/operasyon-gozlem">Operasyon ve gözlem</Link>
              </li>
              <li>
                <Link href="/kullanicilar">Kullanıcı operasyon masası</Link>
              </li>
            </ul>
          </div>
          <div className="setf-side-card">
            <h3>Kurulum kontrol listesi</h3>
            <ul className="setf-side-list">
              {form.settings.pilotSetup.checklist.slice(0, 6).map((item) => (
                <li key={item.id}>
                  {item.completed ? "✓" : "○"} {item.title}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
