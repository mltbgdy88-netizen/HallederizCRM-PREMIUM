"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ImportHistoryRecord, ImportType } from "@hallederiz/types";
import { formatUserFacingStatus, formatUserFacingType } from "../../../lib/user-facing-labels";
import { useToast } from "../../../providers/toast-provider";
import { listImportHistoryApi, listImportTemplatesApi } from "../../../services/api";

type ImportTab = "customers" | "products" | "pricing" | "warehouses" | "stock-locations" | "history";

const IMPORT_TABS: Array<{ id: ImportTab; label: string }> = [
  { id: "customers", label: "Cariler" },
  { id: "products", label: "Ürünler" },
  { id: "pricing", label: "Fiyatlar" },
  { id: "warehouses", label: "Depolar" },
  { id: "stock-locations", label: "Stok / Lokasyon" },
  { id: "history", label: "Geçmiş" }
];

export function SettingsDataImportReferenceLayout() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<ImportTab>("customers");
  const [templates, setTemplates] = useState<Array<{ type: ImportType; fileName: string; description: string }>>([]);
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void Promise.all([listImportTemplatesApi(), listImportHistoryApi()])
      .then(([templateItems, historyItems]) => {
        if (!alive) return;
        setTemplates(templateItems.map((item) => ({ type: item.type, fileName: item.fileName, description: item.description })));
        setHistory(historyItems);
      })
      .catch(() => {
        if (!alive) return;
        pushToast("İçe aktarma merkezi yüklenemedi; demo görünüm gösteriliyor.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [pushToast]);

  const activeTemplate = useMemo(
    () => templates.find((item) => item.type === (activeTab === "history" ? "customers" : activeTab)),
    [templates, activeTab]
  );

  const pagedHistory = useMemo(() => history.slice(0, 12), [history]);

  return (
    <div className="setf-home" data-page="settings-data-import-reference" aria-live="polite">
      <p className="setf-crumb">
        <Link href="/ayarlar" className="setf-crumb-link">
          Ayarlar
        </Link>
        <span className="setf-crumb-sep" aria-hidden>
          /
        </span>
        <span>Veri yükleme</span>
      </p>

      <header className="setf-head">
        <div className="setf-head-text">
          <h1>Veri Yükleme Merkezi</h1>
          <p>Şablon indir, dosya yükle, önizle ve içe aktar — kurulum veri operasyon masası.</p>
        </div>
        <div className="setf-head-actions">
          <button
            type="button"
            className="setf-btn setf-btn--outline"
            onClick={() => pushToast("Demo: şablon indirme sonraki fazda bağlanacak.")}
          >
            Şablon indir
          </button>
          <button
            type="button"
            className="setf-btn setf-btn--primary"
            disabled={!selectedFileName}
            onClick={() => pushToast("Demo: içe aktarma sonraki fazda bağlanacak.")}
          >
            İçe aktar
          </button>
        </div>
      </header>

      <p className="setf-demo-band" role="status">
        Kurulum veri içe aktarma: gerçek içe aktarma işlemi sonraki fazda bağlanacaktır; önizleme ve uygulama toast ile sınırlıdır.
      </p>

      <nav className="setf-import-tabs" aria-label="İçe aktarma türleri">
        {IMPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "setf-tab setf-tab--active" : "setf-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="setf-workspace">
        <section className="setf-main">
          <div className="setf-main-scroll">
            {loading ? <p role="status">İçe aktarma merkezi yükleniyor…</p> : null}

            {activeTab !== "history" ? (
              <>
                <div className="setf-section-head">
                  <h2>{IMPORT_TABS.find((t) => t.id === activeTab)?.label} içe aktarma</h2>
                  <p>{activeTemplate?.description ?? "Şablon açıklaması yükleniyor."}</p>
                </div>
                <div className="setf-upload-zone">
                  <label className="setf-field setf-field--full">
                    Dosya seç
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setSelectedFileName(file?.name ?? null);
                      }}
                    />
                  </label>
                  {selectedFileName ? <p>Seçili: {selectedFileName}</p> : <p>Henüz dosya seçilmedi.</p>}
                </div>
                <div className="setf-head-actions" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="setf-btn setf-btn--outline"
                    disabled={!selectedFileName}
                    onClick={() => pushToast("Demo: önizleme sonraki fazda bağlanacak.")}
                  >
                    Önizle
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="setf-section-head">
                  <h2>İçe aktarma geçmişi</h2>
                </div>
                <div
                  className="setf-list-header"
                  style={{ gridTemplateColumns: "0.8fr 0.7fr 0.6fr 0.6fr 1fr" }}
                >
                  <div>Tür</div>
                  <div>Durum</div>
                  <div>Başarılı</div>
                  <div>Hatalı</div>
                  <div>Tarih</div>
                </div>
                <div className="setf-list-body">
                  {pagedHistory.length === 0 ? (
                    <p className="setf-state">İçe aktarma geçmişi kaydı yok.</p>
                  ) : (
                    pagedHistory.map((record) => (
                      <div
                        key={record.id}
                        className="setf-list-row"
                        style={{ gridTemplateColumns: "0.8fr 0.7fr 0.6fr 0.6fr 1fr" }}
                      >
                        <div>{formatUserFacingType(record.type)}</div>
                        <div>{formatUserFacingStatus(record.status)}</div>
                        <div>{record.successCount}</div>
                        <div>{record.errorCount}</div>
                        <div>{new Date(record.uploadedAt).toLocaleString("tr-TR")}</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="setf-side" aria-label="İçe aktarma bağlamı">
          <div className="setf-side-card">
            <h3>Şablonlar</h3>
            <ul className="setf-side-list">
              {templates.slice(0, 6).map((item) => (
                <li key={item.type}>
                  {formatUserFacingType(item.type)}: {item.fileName}
                </li>
              ))}
            </ul>
          </div>
          <div className="setf-side-card">
            <h3>Sonraki adım</h3>
            <p>İçe aktarma tamamlandıktan sonra hazırlık kontrolü ve kullanım hazırlığı ekranlarını doğrulayın.</p>
            <Link href="/ayarlar/kullanim-hazirligi" className="setf-side-link">
              Kullanım hazırlığına git
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
