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

export function DataImportReferenceLayout() {
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
    <div className="setupf-home" data-page="kurulum-data-import-reference" aria-live="polite">
      <p className="setupf-crumb">
        <Link href="/kurulum/veri-yukleme" className="setupf-crumb-link">
          Kurulum
        </Link>
        <span className="setupf-crumb-sep" aria-hidden>
          /
        </span>
        <span>Veri yükleme</span>
      </p>

      <header className="setupf-head">
        <div className="setupf-head-text">
          <h1>Veri Yükleme Merkezi</h1>
          <p>Şablon indir, dosya yükle, önizle ve içe aktar — kurulum veri operasyon masası.</p>
        </div>
        <div className="setupf-head-actions">
          <button
            type="button"
            className="setupf-btn setupf-btn--outline"
            onClick={() => pushToast("Demo: şablon indirme sonraki fazda bağlanacak.")}
          >
            Şablon indir
          </button>
          <button
            type="button"
            className="setupf-btn setupf-btn--primary"
            disabled={!selectedFileName}
            onClick={() => pushToast("Demo: içe aktarma sonraki fazda bağlanacak.")}
          >
            İçe aktar
          </button>
        </div>
      </header>

      <p className="setupf-demo-band" role="status">
        Kurulum veri içe aktarma: gerçek import mutation sonraki fazda bağlanacaktır; önizleme ve uygulama toast ile
        sınırlıdır.
      </p>

      <nav className="setupf-import-tabs" aria-label="İçe aktarma türleri">
        {IMPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "setupf-tab setupf-tab--active" : "setupf-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="setupf-workspace">
        <section className="setupf-main">
          <div className="setupf-main-scroll">
            {loading ? <p role="status">İçe aktarma merkezi yükleniyor…</p> : null}

            {activeTab !== "history" ? (
              <>
                <div className="setupf-section-head">
                  <h2>{IMPORT_TABS.find((t) => t.id === activeTab)?.label} içe aktarma</h2>
                  <p>{activeTemplate?.description ?? "Şablon açıklaması yükleniyor."}</p>
                </div>
                <div className="setupf-upload-zone">
                  <label className="setupf-field setupf-field--full">
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
                <div className="setupf-head-actions" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="setupf-btn setupf-btn--outline"
                    disabled={!selectedFileName}
                    onClick={() => pushToast("Demo: önizleme sonraki fazda bağlanacak.")}
                  >
                    Önizle
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="setupf-section-head">
                  <h2>İçe aktarma geçmişi</h2>
                </div>
                <div className="setupf-list-header" style={{ gridTemplateColumns: "0.8fr 0.7fr 0.6fr 0.6fr 1fr" }}>
                  <div>Tür</div>
                  <div>Durum</div>
                  <div>Başarılı</div>
                  <div>Hatalı</div>
                  <div>Tarih</div>
                </div>
                <div className="setupf-list-body">
                  {pagedHistory.length === 0 ? (
                    <p className="setupf-state">İçe aktarma geçmişi kaydı yok.</p>
                  ) : (
                    pagedHistory.map((record) => (
                      <div
                        key={record.id}
                        className="setupf-list-row"
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

        <aside className="setupf-side" aria-label="İçe aktarma bağlamı">
          <div className="setupf-side-card">
            <h3>Şablonlar</h3>
            <ul className="setupf-side-list">
              {templates.slice(0, 6).map((item) => (
                <li key={item.type}>
                  {formatUserFacingType(item.type)}: {item.fileName}
                </li>
              ))}
            </ul>
          </div>
          <div className="setupf-side-card">
            <h3>Sonraki adım</h3>
            <p>İçe aktarma tamamlandıktan sonra hazırlık kontrolü ve kullanım hazırlığı ekranlarını doğrulayın.</p>
            <Link href="/ayarlar/kullanim-hazirligi" className="setupf-side-link">
              Kullanım hazırlığına git
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
