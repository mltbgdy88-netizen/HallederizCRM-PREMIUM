"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  CategorySlotConfig,
  PlatformSettings,
  PriceSlotConfig,
  RolePresetItem,
  User,
  WarehouseSetupItem
} from "@hallederiz/types";
import { MetricCard, PageHeader, PrimaryActionToolbar, TabSwitcher } from "@hallederiz/ui";
import { savePlatformSettings, quickCreateUser } from "../mutations";
import { getPilotSetupData } from "../queries";

const TABS = [
  { id: "company", label: "Sirket" },
  { id: "pricing", label: "Fiyat/Kategori" },
  { id: "currency", label: "Doviz" },
  { id: "warehouses", label: "Depolar" },
  { id: "team", label: "Rol ve Personel" },
  { id: "setup", label: "Pilot Kurulum" }
] as const;

type SettingsTabId = (typeof TABS)[number]["id"];

function cloneSettings(settings: PlatformSettings): PlatformSettings {
  return JSON.parse(JSON.stringify(settings)) as PlatformSettings;
}

function parseNumber(input: string, fallback = 0): number {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("company");
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [rolePresets, setRolePresets] = useState<RolePresetItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRoleCode, setNewUserRoleCode] = useState("satis");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFeedback(null);
    void getPilotSetupData()
      .then((data) => {
        if (!alive) return;
        setSettings(cloneSettings(data.settings));
        setRolePresets(data.rolePresets);
        setUsers(data.users);
      })
      .catch((error) => {
        if (!alive) return;
        setFeedback(error instanceof Error ? error.message : "Ayarlar yuklenemedi.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const checklistDone = useMemo(() => {
    if (!settings) return 0;
    return settings.pilotSetup.checklist.filter((item) => item.completed).length;
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setFeedback(null);
    try {
      const next = await savePlatformSettings(settings);
      setSettings(cloneSettings(next));
      setFeedback("Ayarlar kaydedildi.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Kaydetme sirasinda hata olustu.");
    } finally {
      setSaving(false);
    }
  };

  const handleUserCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!newUserName || !newUserEmail) {
      setFeedback("Ad soyad ve e-posta zorunludur.");
      return;
    }
    try {
      const created = await quickCreateUser({
        fullName: newUserName,
        email: newUserEmail,
        status: "active",
        roleCode: newUserRoleCode,
        title: "Pilot Kullanici"
      });
      setUsers((previous) => [created, ...previous]);
      setNewUserName("");
      setNewUserEmail("");
      setFeedback("Kullanici eklendi.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Kullanici eklenemedi.");
    }
  };

  if (loading || !settings) {
    return (
      <div className="hz-page-stack">
        <PageHeader title="Ayarlar" description="Pilot tenant kurulumu yukleniyor..." />
      </div>
    );
  }

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Ayarlar"
        description="Kendi firmaniz icin pilot kurulum, tenant profili ve entegrasyon hazirliklarini yonetin."
        actions={
          <div className="hz-inline-actions">
            <Link href="/ayarlar/staging-kontrol" className="hz-btn hz-btn-secondary">
              Staging Kontrol
            </Link>
            <Link href="/ayarlar/pilot-veri-yukleme" className="hz-btn hz-btn-secondary">
              Pilot Veri Yukleme
            </Link>
          </div>
        }
      />

      <section className="hz-metric-grid">
        <MetricCard title="Sirket" value={settings.company.companyName} detail={settings.company.legalName} tone="info" />
        <MetricCard title="Varsayilan Depo" value={settings.company.defaultWarehouseId} detail="Operasyon merkezi" tone="success" />
        <MetricCard title="Fiyat Slotu" value={`Fiyat ${settings.company.defaultPriceSlotNo}`} detail="Varsayilan satis" tone="warning" />
        <MetricCard
          title="Kurulum Durumu"
          value={`${checklistDone}/${settings.pilotSetup.checklist.length}`}
          detail={settings.pilotSetup.importReady ? "Import-ready" : "Hazirlaniyor"}
          tone={settings.pilotSetup.importReady ? "success" : "danger"}
        />
      </section>

      <PrimaryActionToolbar>
        <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button" disabled={saving} onClick={handleSave}>
          {saving ? "Kaydediliyor..." : "Ayarlari Kaydet"}
        </button>
        <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button" onClick={() => setSettings(cloneSettings(settings))}>
          Degisiklikleri Sifirla
        </button>
      </PrimaryActionToolbar>

      {feedback ? (
        <div className="hz-content-card">
          <p className="muted">{feedback}</p>
        </div>
      ) : null}

      <section className="hz-content-card">
        <TabSwitcher
          items={TABS.map((tab) => ({ key: tab.id, label: tab.label }))}
          activeKey={activeTab}
          onChange={(key: string) => setActiveTab(key as SettingsTabId)}
        />

        <div className="hz-tab-content">
          {activeTab === "company" ? (
            <div className="hz-split-layout">
              <div className="hz-split-main">
                <div className="hz-modal-panel-grid">
                  <label className="hz-field-label">
                    Sirket Adi
                    <input className="hz-control" value={settings.company.companyName} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, companyName: event.target.value } })} />
                  </label>
                  <label className="hz-field-label">
                    Ticari Unvan
                    <input className="hz-control" value={settings.company.legalName} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, legalName: event.target.value } })} />
                  </label>
                  <label className="hz-field-label">
                    Vergi Dairesi
                    <input className="hz-control" value={settings.company.taxOffice} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, taxOffice: event.target.value } })} />
                  </label>
                  <label className="hz-field-label">
                    Vergi Numarasi
                    <input className="hz-control" value={settings.company.taxNumber} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, taxNumber: event.target.value } })} />
                  </label>
                  <label className="hz-field-label">
                    Mersis No
                    <input className="hz-control" value={settings.company.mersisNo} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, mersisNo: event.target.value } })} />
                  </label>
                  <label className="hz-field-label">
                    Telefon
                    <input className="hz-control" value={settings.company.phone} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, phone: event.target.value } })} />
                  </label>
                  <label className="hz-field-label">
                    E-Posta
                    <input className="hz-control" value={settings.company.email} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, email: event.target.value } })} />
                  </label>
                  <label className="hz-field-label">
                    IBAN
                    <input className="hz-control" value={settings.company.iban} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, iban: event.target.value } })} />
                  </label>
                </div>

                <label className="hz-field-label hz-margin-top-sm">
                  Adres
                  <textarea className="hz-control" value={settings.company.address} onChange={(event) => setSettings({ ...settings, company: { ...settings.company, address: event.target.value } })} rows={3} style={{ height: "auto", padding: "10px" }} />
                </label>
              </div>

              <aside className="hz-split-side">
                <article className="hz-side-panel">
                  <h3>Finans ve Operasyon Varsayilanlari</h3>
                  <div className="detail-list">
                    <span>Varsayilan para birimi</span>
                    <strong>{settings.company.defaultCurrency}</strong>
                    <span>Muhasebe yil baslangici</span>
                    <strong>{settings.company.accountingYearStart}</strong>
                    <span>Varsayilan vade gunu</span>
                    <strong>{settings.company.defaultDueDay}</strong>
                    <span>Varsayilan KDV</span>
                    <strong>%{settings.company.defaultVatRate}</strong>
                    <span>Varsayilan teslim sekli</span>
                    <strong>{settings.company.defaultDeliveryMethod}</strong>
                  </div>
                </article>
              </aside>
            </div>
          ) : null}

          {activeTab === "pricing" ? (
            <div className="hz-split-layout">
              <div className="hz-split-main">
                <article className="hz-content-card">
                  <h3>Fiyat Slotlari (6 adet)</h3>
                  <div className="table-wrap hz-table-wrap">
                    <table className="table hz-table">
                      <thead>
                        <tr>
                          <th>Slot</th>
                          <th>Adi</th>
                          <th>Para Birimi</th>
                          <th>Aktif</th>
                          <th>Varsayilan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.priceSlots.slots.map((slot) => (
                          <tr key={slot.slotNumber}>
                            <td>{slot.slotNumber}</td>
                            <td>
                              <input className="hz-control" value={slot.slotName} onChange={(event) => setSettings({ ...settings, priceSlots: { slots: settings.priceSlots.slots.map((item) => (item.slotNumber === slot.slotNumber ? { ...item, slotName: event.target.value } : item)) } })} />
                            </td>
                            <td>
                              <select className="hz-control" value={slot.currency} onChange={(event) => setSettings({ ...settings, priceSlots: { slots: settings.priceSlots.slots.map((item) => (item.slotNumber === slot.slotNumber ? { ...item, currency: event.target.value as PriceSlotConfig["currency"] } : item)) } })}>
                                <option value="TRY">TRY</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                              </select>
                            </td>
                            <td>
                              <input type="checkbox" checked={slot.active} onChange={(event) => setSettings({ ...settings, priceSlots: { slots: settings.priceSlots.slots.map((item) => (item.slotNumber === slot.slotNumber ? { ...item, active: event.target.checked } : item)) } })} />
                            </td>
                            <td>
                              <input type="radio" checked={settings.company.defaultPriceSlotNo === slot.slotNumber} onChange={() => setSettings({ ...settings, company: { ...settings.company, defaultPriceSlotNo: slot.slotNumber } })} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="hz-content-card">
                  <h3>Kategori Slotlari (4 adet)</h3>
                  <div className="table-wrap hz-table-wrap">
                    <table className="table hz-table">
                      <thead>
                        <tr>
                          <th>Slot</th>
                          <th>Adi</th>
                          <th>Aktif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.categorySlots.slots.map((slot) => (
                          <tr key={slot.slotNumber}>
                            <td>{slot.slotNumber}</td>
                            <td>
                              <input className="hz-control" value={slot.slotName} onChange={(event) => setSettings({ ...settings, categorySlots: { slots: settings.categorySlots.slots.map((item) => (item.slotNumber === slot.slotNumber ? { ...item, slotName: event.target.value } : item)) } })} />
                            </td>
                            <td>
                              <input type="checkbox" checked={slot.active} onChange={(event) => setSettings({ ...settings, categorySlots: { slots: settings.categorySlots.slots.map((item) => (item.slotNumber === slot.slotNumber ? { ...item, active: event.target.checked } : item)) } })} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>

              <aside className="hz-split-side">
                <article className="hz-side-panel">
                  <h3>Pilot Slot Ornekleri</h3>
                  <ul className="hz-side-list">
                    <li>Bayi</li>
                    <li>Perakende</li>
                    <li>Mimar</li>
                    <li>Usta</li>
                    <li>Proje</li>
                    <li>Ihracat</li>
                  </ul>
                </article>
              </aside>
            </div>
          ) : null}

          {activeTab === "currency" ? (
            <div className="hz-split-layout">
              <div className="hz-split-main">
                <div className="hz-modal-panel-grid">
                  <label className="hz-field-label">
                    Kur kaynagi
                    <select className="hz-control" value={settings.exchangeRate.provider} onChange={(event) => setSettings({ ...settings, exchangeRate: { ...settings.exchangeRate, provider: event.target.value as "manual" | "api" } })}>
                      <option value="manual">Manuel</option>
                      <option value="api">API</option>
                    </select>
                  </label>
                  <label className="hz-field-label">
                    Fiyatlama kuru
                    <select className="hz-control" value={settings.exchangeRate.pricingRateMode ?? "mb_satis"} onChange={(event) => setSettings({ ...settings, exchangeRate: { ...settings.exchangeRate, pricingRateMode: event.target.value as "mb_satis" | "mb_satis_ek_kur" } })}>
                      <option value="mb_satis">MB Satis</option>
                      <option value="mb_satis_ek_kur">MB Satis + Ek Kur</option>
                    </select>
                  </label>
                  <label className="hz-field-label">
                    Yuvarlama tipi
                    <select className="hz-control" value={settings.exchangeRate.roundingType ?? "matematiksel"} onChange={(event) => setSettings({ ...settings, exchangeRate: { ...settings.exchangeRate, roundingType: event.target.value as "matematiksel" | "yukari" | "asagi" } })}>
                      <option value="matematiksel">Matematiksel</option>
                      <option value="yukari">Yukari</option>
                      <option value="asagi">Asagi</option>
                    </select>
                  </label>
                  <label className="hz-field-label">
                    Ek kur farki (%)
                    <input className="hz-control" value={settings.exchangeRate.additionalSpreadPercent ?? 0} onChange={(event) => setSettings({ ...settings, exchangeRate: { ...settings.exchangeRate, additionalSpreadPercent: parseNumber(event.target.value, 0) } })} />
                  </label>
                  <label className="hz-field-label">
                    Ek kur sabit deger
                    <input className="hz-control" value={settings.exchangeRate.spreadFixedAmount ?? 0} onChange={(event) => setSettings({ ...settings, exchangeRate: { ...settings.exchangeRate, spreadFixedAmount: parseNumber(event.target.value, 0) } })} />
                  </label>
                  <label className="hz-field-label">
                    Otomatik guncelleme (dk)
                    <input className="hz-control" value={settings.exchangeRate.updateIntervalMinutes} onChange={(event) => setSettings({ ...settings, exchangeRate: { ...settings.exchangeRate, updateIntervalMinutes: parseNumber(event.target.value, 60) } })} />
                  </label>
                </div>
              </div>
              <aside className="hz-split-side">
                <article className="hz-side-panel">
                  <h3>Kur Ozet</h3>
                  <div className="detail-list">
                    <span>USD Alis/Satis</span>
                    <strong>API ile guncellenir</strong>
                    <span>EUR Alis/Satis</span>
                    <strong>API ile guncellenir</strong>
                    <span>Son guncelleme</span>
                    <strong>{settings.exchangeRate.lastUpdatedAt ?? "-"}</strong>
                    <span>Kaynak</span>
                    <strong>{settings.exchangeRate.sourceLabel ?? "Merkez Bankasi"}</strong>
                  </div>
                </article>
              </aside>
            </div>
          ) : null}

          {activeTab === "warehouses" ? (
            <article className="hz-content-card">
              <h3>Depo Kurulumu (3 depo)</h3>
              <div className="table-wrap hz-table-wrap">
                <table className="table hz-table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Depo Adi</th>
                      <th>Tip</th>
                      <th>Aktif</th>
                      <th>Sira</th>
                      <th>Varsayilan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.warehouses.map((warehouse: WarehouseSetupItem) => (
                      <tr key={warehouse.id}>
                        <td>{warehouse.code}</td>
                        <td>
                          <input className="hz-control" value={warehouse.name} onChange={(event) => setSettings({ ...settings, warehouses: settings.warehouses.map((item) => (item.id === warehouse.id ? { ...item, name: event.target.value } : item)) })} />
                        </td>
                        <td>
                          <select className="hz-control" value={warehouse.warehouseType} onChange={(event) => setSettings({ ...settings, warehouses: settings.warehouses.map((item) => (item.id === warehouse.id ? { ...item, warehouseType: event.target.value as WarehouseSetupItem["warehouseType"] } : item)) })}>
                            <option value="center">Merkez</option>
                            <option value="branch">Sube</option>
                            <option value="transfer">Transfer</option>
                          </select>
                        </td>
                        <td>
                          <input type="checkbox" checked={warehouse.active} onChange={(event) => setSettings({ ...settings, warehouses: settings.warehouses.map((item) => (item.id === warehouse.id ? { ...item, active: event.target.checked } : item)) })} />
                        </td>
                        <td>
                          <input className="hz-control" value={warehouse.sortOrder} onChange={(event) => setSettings({ ...settings, warehouses: settings.warehouses.map((item) => (item.id === warehouse.id ? { ...item, sortOrder: parseNumber(event.target.value, item.sortOrder) } : item)) })} />
                        </td>
                        <td>
                          <input type="radio" checked={warehouse.isDefault} onChange={() => setSettings({ ...settings, warehouses: settings.warehouses.map((item) => ({ ...item, isDefault: item.id === warehouse.id })), company: { ...settings.company, defaultWarehouseId: warehouse.id } })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ) : null}

          {activeTab === "team" ? (
            <div className="hz-split-layout">
              <div className="hz-split-main">
                <article className="hz-content-card">
                  <h3>Rol Presetleri</h3>
                  <div className="table-wrap hz-table-wrap">
                    <table className="table hz-table">
                      <thead>
                        <tr>
                          <th>Rol</th>
                          <th>Aciklama</th>
                          <th>Modul Erisimi</th>
                          <th>Approval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rolePresets.map((preset) => (
                          <tr key={preset.id}>
                            <td>{preset.name}</td>
                            <td>{preset.description}</td>
                            <td>{preset.moduleAccess.join(", ")}</td>
                            <td>{preset.approvalEnabled ? "Evet" : "Hayir"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="hz-content-card">
                  <h3>Hizli Kullanici Ekle</h3>
                  <form className="hz-filter-grid" onSubmit={handleUserCreate}>
                    <label className="hz-field-label">
                      Ad Soyad
                      <input className="hz-control" value={newUserName} onChange={(event) => setNewUserName(event.target.value)} />
                    </label>
                    <label className="hz-field-label">
                      E-Posta
                      <input className="hz-control" type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} />
                    </label>
                    <label className="hz-field-label">
                      Rol
                      <select className="hz-control" value={newUserRoleCode} onChange={(event) => setNewUserRoleCode(event.target.value)}>
                        <option value="yonetici">Yonetici</option>
                        <option value="satis">Satis</option>
                        <option value="muhasebe">Muhasebe</option>
                        <option value="depo">Depo</option>
                        <option value="pazarlama">Pazarlama</option>
                      </select>
                    </label>
                    <div className="hz-filter-actions">
                      <button className="hz-btn hz-btn-primary" type="submit">Kullanici Ekle</button>
                    </div>
                  </form>

                  <div className="table-wrap hz-table-wrap">
                    <table className="table hz-table">
                      <thead>
                        <tr>
                          <th>Ad</th>
                          <th>E-Posta</th>
                          <th>Durum</th>
                          <th>Son Giris</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td className="table-empty" colSpan={4}>Henuz kullanici yok.</td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id}>
                              <td>{user.fullName}</td>
                              <td>{user.email}</td>
                              <td>{user.status}</td>
                              <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>
            </div>
          ) : null}

          {activeTab === "setup" ? (
            <div className="hz-split-layout">
              <div className="hz-split-main">
                <article className="hz-content-card">
                  <h3>Pilot Kurulum Checklist</h3>
                  <div className="table-wrap hz-table-wrap">
                    <table className="table hz-table">
                      <thead>
                        <tr>
                          <th>Adim</th>
                          <th>Tamamlandi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.pilotSetup.checklist.map((item) => (
                          <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(event) =>
                                  setSettings({
                                    ...settings,
                                    pilotSetup: {
                                      ...settings.pilotSetup,
                                      checklist: settings.pilotSetup.checklist.map((candidate) =>
                                        candidate.id === item.id ? { ...candidate, completed: event.target.checked } : candidate
                                      ),
                                      importReady:
                                        settings.pilotSetup.checklist.filter((candidate) =>
                                          candidate.id === item.id ? event.target.checked : candidate.completed
                                        ).length === settings.pilotSetup.checklist.length
                                    }
                                  })
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>
              <aside className="hz-split-side">
                <article className="hz-side-panel">
                  <h3>Import-Ready Pilot Mod</h3>
                  <div className="detail-list">
                    <span>Template</span>
                    <strong>{settings.pilotSetup.templateName}</strong>
                    <span>Durum</span>
                    <strong>{settings.pilotSetup.importReady ? "Hazir" : "Hazir degil"}</strong>
                    <span>Kalan adim</span>
                    <strong>{settings.pilotSetup.checklist.length - checklistDone}</strong>
                  </div>
                </article>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

