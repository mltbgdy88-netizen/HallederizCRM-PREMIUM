"use client";

import { useEffect, useMemo, useState } from "react";
import type { ImportApplyResult, ImportHistoryRecord, ImportPreviewResult, ImportType } from "@hallederiz/types";
import { FilterActions, FilterBar, FilterGrid, MetricCard, PageHeader, Pagination, SplitContentLayout, TabSwitcher } from "@hallederiz/ui";
import { formatUserFacingStatus, formatUserFacingType } from "../../../lib/user-facing-labels";
import { SettingsAreaShell } from "../../settings/components/SettingsAreaShell";
import {
  applyImportApi,
  getImportErrorReportApi,
  getImportTemplateApi,
  listImportHistoryApi,
  listImportTemplatesApi,
  previewImportApi,
  retryImportHistoryApi
} from "../../../services/api";

type ImportTab = "customers" | "products" | "pricing" | "warehouses" | "stock-locations" | "history";

const IMPORT_TABS: Array<{ id: ImportTab; label: string }> = [
  { id: "customers", label: "Cariler" },
  { id: "products", label: "Ürünler" },
  { id: "pricing", label: "Fiyatlar" },
  { id: "warehouses", label: "Depolar" },
  { id: "stock-locations", label: "Stok / Lokasyon" },
  { id: "history", label: "Geçmiş" }
];

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      const commaIndex = value.indexOf(",");
      resolve(commaIndex >= 0 ? value.slice(commaIndex + 1) : value);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
}

export function DataImportPage() {
  const [activeTab, setActiveTab] = useState<ImportTab>("customers");
  const setupDemoNote =
    "Kurulum veri içe aktarma: gerçek içe aktarma işlemi sonraki fazda bağlanacaktır; önizleme ve uygulama toast/guard ile sınırlıdır.";
  const [templates, setTemplates] = useState<Array<{ type: ImportType; fileName: string; description: string }>>([]);
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [result, setResult] = useState<ImportApplyResult | null>(null);
  const [selectedSheetName, setSelectedSheetName] = useState<string>("");
  const [selectedHistoryErrorReport, setSelectedHistoryErrorReport] = useState<string[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 8;

  const importType = activeTab === "history" ? "customers" : (activeTab as ImportType);

  const pagedHistory = useMemo(() => {
    const start = (historyPage - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, historyPage]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFeedback(null);
    void Promise.all([listImportTemplatesApi(), listImportHistoryApi()])
      .then(([templateItems, historyItems]) => {
        if (!alive) return;
        setTemplates(templateItems.map((item) => ({ type: item.type, fileName: item.fileName, description: item.description })));
        setHistory(historyItems);
      })
      .catch((error) => {
        if (!alive) return;
        setFeedback(error instanceof Error ? error.message : "İçe aktarma merkezi yüklenemedi.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const activeTemplate = templates.find((item) => item.type === importType);

  const handleDownloadTemplate = async () => {
    try {
      setFeedback(null);
      const response = await getImportTemplateApi(importType);
      const blob = new Blob([response.csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = response.item.fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Şablon indirilemedi.");
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setFeedback("Lütfen önce bir dosya seçin.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    setResult(null);
    try {
      const contentBase64 = await toBase64(selectedFile);
      const previewResult = await previewImportApi(importType, {
        fileName: selectedFile.name,
        contentBase64,
        sheetName: selectedSheetName || undefined
      });
      setPreview(previewResult);
      if (!selectedSheetName && previewResult.sheetName) {
        setSelectedSheetName(previewResult.sheetName);
      }
      setFeedback(
        previewResult.errorCount > 0
          ? `Önizleme tamamlandı: ${previewResult.errorCount} hata var.`
          : `Önizleme hazır: ${previewResult.validRows}/${previewResult.totalRows} satır geçerli.`
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Önizleme oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedFile) {
      setFeedback("Lütfen önce bir dosya seçin.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const contentBase64 = await toBase64(selectedFile);
      const applyResult = await applyImportApi(importType, {
        fileName: selectedFile.name,
        contentBase64,
        sheetName: selectedSheetName || undefined
      });
      setResult(applyResult);
      const historyItems = await listImportHistoryApi();
      setHistory(historyItems);
      setFeedback(
        applyResult.status === "applied"
          ? `İçe aktarma tamamlandı: ${applyResult.successCount} satır işlendi.`
          : `İçe aktarma başarısız: ${applyResult.errorCount} hata`
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "İçe aktarma uygulanamadı.");
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = async () => {
    const historyItems = await listImportHistoryApi();
    setHistory(historyItems);
  };

  const handleRetryHistory = async (id: string) => {
    try {
      setLoading(true);
      await retryImportHistoryApi(id);
      await refreshHistory();
      setFeedback("İçe aktarma kaydı yeniden deneme için hazırlandı.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "İçe aktarma yeniden deneme işlemi başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowErrorReport = async (id: string) => {
    try {
      setLoading(true);
      setSelectedHistoryId(id);
      const errors = await getImportErrorReportApi(id);
      setSelectedHistoryErrorReport(errors);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Hata raporu alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsAreaShell>
      <>
      <PageHeader
        title="Veri Yükleme Merkezi"
        description="Cari, ürün, fiyat, depo ve stok verilerini ayrıştırma, doğrulama, önizleme ve uygulama akışıyla sisteme alın."
      />

      <p className="erpf-demo-band setupf-demo-band" role="status">
        {setupDemoNote}
      </p>

      <section className="hz-metric-grid">
        <MetricCard title="Şablon Sayısı" value={String(templates.length)} detail="CSV şablonları" tone="info" />
        <MetricCard title="İçe Aktarma Geçmişi" value={String(history.length)} detail="Tüm yüklemeler" tone="success" />
        <MetricCard
          title="Son Önizleme"
          value={preview ? `${preview.validRows}/${preview.totalRows}` : "-"}
          detail={preview ? `${preview.errorCount} hata` : "Hazır değil"}
          tone={preview && preview.errorCount > 0 ? "warning" : "info"}
        />
        <MetricCard
          title="Son Sonuç"
          value={result ? `${result.successCount}` : "-"}
          detail={result ? `${result.errorCount} hata` : "İçe aktarma bekleniyor"}
          tone={result && result.errorCount > 0 ? "warning" : "success"}
        />
      </section>

      <section className="hz-content-card">
        <TabSwitcher
          items={IMPORT_TABS.map((item) => ({ key: item.id, label: item.label }))}
          activeKey={activeTab}
          onChange={(key: string) => setActiveTab(key as ImportTab)}
        />
      </section>

      {activeTab === "history" ? (
        <section className="hz-content-card">
          <h3>İçe Aktarma Geçmişi</h3>
          <div className="table-wrap hz-table-wrap">
            <table className="table hz-table">
              <thead>
                <tr>
                  <th>İçe Aktarma No</th>
                  <th>Tür</th>
                  <th>Dosya</th>
                  <th>Dosya türü</th>
                  <th>Sayfa</th>
                  <th>Yükleyen</th>
                  <th>Tarih</th>
                  <th>Başarılı</th>
                  <th>Atlanan</th>
                  <th>Hata</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {pagedHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{formatUserFacingType(item.type)}</td>
                    <td>{item.fileName}</td>
                    <td>{item.fileType?.toUpperCase() ?? "-"}</td>
                    <td>{item.sheetName ?? "-"}</td>
                    <td>{item.uploadedBy}</td>
                    <td>{new Date(item.uploadedAt).toLocaleString("tr-TR")}</td>
                    <td>{item.successCount}</td>
                    <td>{item.skippedCount ?? 0}</td>
                    <td>{item.errorCount}</td>
                    <td>
                      <span className={`hz-badge ${item.status === "applied" ? "hz-badge-success" : item.status === "failed" ? "hz-badge-danger" : "hz-badge-info"}`}>
                        {formatUserFacingStatus(item.status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="hz-btn hz-btn-secondary" type="button" onClick={() => void handleShowErrorReport(item.id)}>
                          Hata Raporu
                        </button>
                        <button className="hz-btn hz-btn-secondary" type="button" onClick={() => void handleRetryHistory(item.id)}>
                          Tekrar Dene
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedHistoryId ? (
            <div className="hz-content-card" style={{ marginTop: 10 }}>
              <h3>Hata Raporu: {selectedHistoryId}</h3>
              <ul className="hz-side-list">
                {selectedHistoryErrorReport.length > 0 ? (
                  selectedHistoryErrorReport.slice(0, 15).map((errorLine, index) => <li key={`${selectedHistoryId}_${index}`}>{errorLine}</li>)
                ) : (
                  <li>Hata raporu bulunmuyor.</li>
                )}
              </ul>
            </div>
          ) : null}
          <Pagination totalItems={history.length} pageSize={pageSize} currentPage={historyPage} onPageChange={setHistoryPage} />
        </section>
      ) : (
        <SplitContentLayout
          main={
            <>
              <FilterBar>
                <FilterGrid>
                  <label className="hz-field-label">
                    Yükleme Tipi
                    <input className="hz-control" value={formatUserFacingType(importType)} readOnly />
                  </label>
                  <label className="hz-field-label">
                    Dosya Seç
                    <input
                      className="hz-control"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(event) => {
                        setSelectedFile(event.target.files?.[0] ?? null);
                        setPreview(null);
                        setResult(null);
                        setSelectedSheetName("");
                      }}
                    />
                  </label>
                  <label className="hz-field-label">
                    Seçili Dosya
                    <input className="hz-control" value={selectedFile?.name ?? "-"} readOnly />
                  </label>
                  <label className="hz-field-label">
                    Sayfa
                    <select
                      className="hz-control"
                      value={selectedSheetName}
                      onChange={(event) => setSelectedSheetName(event.target.value)}
                    >
                      <option value="">İlk sayfa (varsayılan)</option>
                      {(preview?.sheetNames ?? []).map((sheetName) => (
                        <option key={sheetName} value={sheetName}>
                          {sheetName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="hz-field-label">
                    Şablon
                    <input className="hz-control" value={activeTemplate?.fileName ?? "-"} readOnly />
                  </label>
                  <div className="hz-field-label">
                    Açıklama
                    <input className="hz-control" value={activeTemplate?.description ?? "-"} readOnly />
                  </div>
                </FilterGrid>
                <FilterActions>
                  <button className="hz-btn hz-btn-secondary" type="button" onClick={handleDownloadTemplate} disabled={loading}>
                    Şablon İndir
                  </button>
                  <button className="hz-btn hz-btn-secondary" type="button" onClick={handlePreview} disabled={loading}>
                    Önizleme
                  </button>
                  <button className="hz-btn hz-btn-primary" type="button" onClick={handleApply} disabled={loading}>
                    İçe Aktar
                  </button>
                </FilterActions>
              </FilterBar>

              {feedback ? (
                <section className="hz-content-card">
                  <p className="muted">{feedback}</p>
                </section>
              ) : null}

              {preview ? (
                <section className="hz-content-card">
                  <h3>İçe Aktarma Önizlemesi</h3>
                  <div className="hz-filter-grid" style={{ marginBottom: 10 }}>
                    <div className="hz-stat-pill">Dosya: <strong>{preview.fileName}</strong></div>
                    <div className="hz-stat-pill">Dosya türü: <strong>{preview.fileType.toUpperCase()}</strong></div>
                    <div className="hz-stat-pill">Sayfa: <strong>{preview.sheetName ?? "-"}</strong></div>
                    <div className="hz-stat-pill">Önerilen Sayfa: <strong>{preview.suggestedSheetName ?? "-"}</strong></div>
                    <div className="hz-stat-pill">Toplam: <strong>{preview.totalRows}</strong></div>
                    <div className="hz-stat-pill">Geçerli/Uyarı/Hata: <strong>{preview.validRows}/{preview.warningCount}/{preview.errorCount}</strong></div>
                  </div>
                  <div className="table-wrap hz-table-wrap">
                    <table className="table hz-table">
                      <thead>
                        <tr>
                          <th>Satır</th>
                          <th>Durum</th>
                          <th>Veri</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.records.slice(0, 20).map((row) => (
                          <tr key={`preview_${row.rowNumber}`}>
                            <td>{row.rowNumber}</td>
                            <td>
                              <span className={`hz-badge ${row.status === "error" ? "hz-badge-danger" : row.status === "warning" ? "hz-badge-warning" : "hz-badge-success"}`}>
                                {formatUserFacingStatus(row.status ?? "valid")}
                              </span>
                            </td>
                            <td>{Object.entries(row.data).map(([key, value]) => `${key}: ${value}`).join(" | ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
            </>
          }
          side={
              <div className="hz-side-panel">
                <h3>Doğrulama</h3>
                <div className="detail-list">
                  <span>Dosya Tipi</span>
                  <strong>{preview?.fileType?.toUpperCase() ?? "-"}</strong>
                  <span>Sayfa</span>
                  <strong>{preview?.sheetName ?? "-"}</strong>
                  <span>Önerilen Sayfa</span>
                  <strong>{preview?.suggestedSheetName ?? "-"}</strong>
                  <span>Toplam Satır</span>
                  <strong>{preview?.totalRows ?? 0}</strong>
                <span>Geçerli Satır</span>
                <strong>{preview?.validRows ?? 0}</strong>
                <span>Hata</span>
                <strong>{preview?.errorCount ?? 0}</strong>
                <span>Uyarı</span>
                <strong>{preview?.warningCount ?? 0}</strong>
                <span>Eksik Zorunlu Kolon</span>
                <strong>{preview?.requiredMissingColumns?.length ?? 0}</strong>
                <span>Eşleştirilemeyen Kolon</span>
                <strong>{preview?.unmappedColumns?.length ?? 0}</strong>
              </div>

              <h3>Sayfa Skor Özeti</h3>
              <ul className="hz-side-list">
                {(preview?.sheetScoreSummary ?? []).slice(0, 4).map((sheet) => (
                  <li key={sheet.sheetName}>
                    <strong>{sheet.sheetName}</strong>
                    <div>Skor: {sheet.score}</div>
                    <div>Eşleme: {sheet.matchedColumns.length}</div>
                  </li>
                ))}
                {!preview?.sheetScoreSummary?.length ? <li>Sayfa skoru yok.</li> : null}
              </ul>

              <h3>Hata/Öneri</h3>
              <ul className="hz-side-list">
                {(preview?.issues ?? []).slice(0, 8).map((issue) => (
                  <li key={`${issue.rowNumber}_${issue.field}_${issue.message}`}>
                    <strong>{`Satır ${issue.rowNumber}`}</strong>
                    <div>{issue.message}</div>
                    {issue.suggestion ? <div className="muted">{issue.suggestion}</div> : null}
                  </li>
                ))}
                {!preview?.issues?.length ? <li>Henüz sorun yok.</li> : null}
              </ul>
            </div>
          }
        />
      )}
    </>
    </SettingsAreaShell>
  );
}
