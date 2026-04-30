"use client";

import { Fragment, useMemo } from "react";
import { demoProducts, operationTypeLabels, sourceOptions, useQuickOperationState } from "../hooks/use-quick-operation-state";
import type { QuickOperationImpact, QuickOperationLine, QuickOperationSourceType, QuickOperationType } from "../types";

const operationTypes = Object.keys(operationTypeLabels) as QuickOperationType[];
const visibleRowCount = 8;

const sourceToneClass: Record<QuickOperationSourceType, string> = {
  center_warehouse: "qo-pill-blue",
  factory: "qo-pill-purple",
  supplier: "qo-pill-amber",
  split: "qo-pill-slate",
  auto: "qo-pill-green"
};

function money(value: number): string {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function impactToneClass(tone: QuickOperationImpact["tone"]): string {
  if (tone === "success") return "qo-pill-green";
  if (tone === "warning") return "qo-pill-amber";
  if (tone === "danger") return "qo-pill-red";
  return "qo-pill-blue";
}

function lineTotal(line: QuickOperationLine): number {
  return line.quantity * line.unitPrice * (1 + line.taxRate / 100);
}

export function QuickOperationPage() {
  const {
    operationType,
    setOperationType,
    customerId,
    setCustomerId,
    selectedCustomer,
    lines,
    expandedLineId,
    setExpandedLineId,
    totals,
    impacts,
    notice,
    setNotice,
    operationNote,
    setOperationNote,
    addLine,
    removeLine,
    updateLine,
    selectProduct,
    selectSource,
    showFoundationNotice,
    openDocumentPreview,
    openWhatsappDraft,
    submitOperation,
    isSubmitting,
    aiInsight,
    documentPreview,
    whatsappDraft,
    documentPreviewVisible,
    setDocumentPreviewVisible,
    whatsappDraftVisible,
    setWhatsappDraftVisible
  } = useQuickOperationState();

  const selectedLine = lines.find((line) => line.id === expandedLineId) ?? lines[0];
  const tableRows = useMemo(() => {
    const emptySlots = Math.max(visibleRowCount - lines.length, 0);
    return [...lines, ...Array.from({ length: emptySlots }, (_, index) => ({ emptyIndex: lines.length + index + 1 }))];
  }, [lines]);

  const operationSummary = useMemo(() => {
    const warehouse = lines.filter((line) => line.sourceType === "center_warehouse").length;
    const factory = lines.filter((line) => line.sourceType === "factory").length;
    const supplier = lines.filter((line) => line.sourceType === "supplier").length;
    return { warehouse, factory, supplier };
  }, [lines]);

  return (
    <main className="qo-document-page">
      <header className="qo-hero">
        <div>
          <h1>Hizli Islem Merkezi</h1>
          <p>Klasik fis gorunumu + modern CRM is akisi</p>
        </div>
        <div className="qo-brand-mark">
          <span>HallederizCRM</span>
          <strong>PREMIUM</strong>
        </div>
      </header>

      <section className="qo-strip qo-mode-strip">
        <h2>Islem Turu</h2>
        <div className="qo-segment-row" aria-label="Islem turu secimi">
          {operationTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={type === operationType ? "is-active" : undefined}
              onClick={() => setOperationType(type)}
            >
              {operationTypeLabels[type].label}
            </button>
          ))}
        </div>
        <div className="qo-field-grid">
          <label>
            <span>Cari</span>
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              <option value="customer_1">MUSTERI FIRMA A.S.</option>
              <option value="customer_2">MIMAR PROJE LTD.</option>
            </select>
          </label>
          <label>
            <span>Yetkili</span>
            <input value={selectedCustomer.contactName} readOnly />
          </label>
          <label>
            <span>Telefon</span>
            <input value={selectedCustomer.phone} readOnly />
          </label>
          <label>
            <span>Fiyat Grubu</span>
            <input value={selectedCustomer.priceGroup} readOnly />
          </label>
          <label>
            <span>Risk</span>
            <input value={selectedCustomer.risk} readOnly />
          </label>
          <label>
            <span>Islem No</span>
            <input value="HI-2026-0042" readOnly />
          </label>
        </div>
      </section>

      {notice ? (
        <section className="qo-notice">
          <strong>{notice}</strong>
          <button type="button" onClick={() => setNotice(null)}>
            Kapat
          </button>
        </section>
      ) : null}

      <section className="qo-paper">
        <div className="qo-summary-row">
          <div className="qo-customer-box">
            <h2>Musteri Bilgileri</h2>
            <dl>
              <div>
                <dt>Firma Adi</dt>
                <dd>{selectedCustomer.name}</dd>
              </div>
              <div>
                <dt>Yetkili</dt>
                <dd>{selectedCustomer.contactName.toLocaleUpperCase("tr-TR")}</dd>
              </div>
              <div>
                <dt>Adres</dt>
                <dd>{selectedCustomer.address}</dd>
              </div>
            </dl>
          </div>
          <div className="qo-smart-box">
            <h2>Akilli Operasyon Ozeti</h2>
            <div className="qo-pill-row">
              <span className="qo-pill qo-pill-blue">Depo: {operationSummary.warehouse} satir</span>
              <span className="qo-pill qo-pill-purple">Fabrika: {operationSummary.factory} satir</span>
              <span className="qo-pill qo-pill-amber">Tedarik: {operationSummary.supplier} satir</span>
              <span className="qo-pill qo-pill-green">Belge hazir</span>
            </div>
            <p>{operationTypeLabels[operationType].description}</p>
          </div>
        </div>

        <section className="qo-table-section" aria-label="Urun ve hizmet satirlari">
          <div className="qo-table-scroll">
            <table className="qo-line-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>KOD</th>
                  <th>URUN / HIZMET ADI</th>
                  <th>MIKTAR</th>
                  <th>KAYNAK</th>
                  <th>DEPO</th>
                  <th>RAF</th>
                  <th>BIRIM FIYAT</th>
                  <th>KDV</th>
                  <th>TOPLAM</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => {
                  if ("emptyIndex" in row) {
                    return (
                      <tr key={`empty_${row.emptyIndex}`} className="qo-empty-row">
                        <td>{row.emptyIndex}</td>
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                      </tr>
                    );
                  }

                  const selected = row.id === selectedLine?.id;
                  return (
                    <tr key={row.id} className={selected ? "is-selected" : undefined} onClick={() => setExpandedLineId(row.id)}>
                      <td>{index + 1}</td>
                      <td>
                        <select value={row.productCode} onChange={(event) => selectProduct(row.id, event.target.value)}>
                          {demoProducts.map((product) => (
                            <option key={product.code} value={product.code}>
                              {product.code}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input value={row.productName} onChange={(event) => updateLine(row.id, { productName: event.target.value })} />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={row.quantity}
                          onChange={(event) => updateLine(row.id, { quantity: Math.max(0, Number(event.target.value || 0)) })}
                        />
                      </td>
                      <td>
                        <span className={`qo-pill ${sourceToneClass[row.sourceType]}`}>{row.sourceLabel}</span>
                      </td>
                      <td>{row.warehouseName}</td>
                      <td>{row.rackCode}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={row.unitPrice}
                          onChange={(event) => updateLine(row.id, { unitPrice: Math.max(0, Number(event.target.value || 0)) })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.taxRate}
                          onChange={(event) => updateLine(row.id, { taxRate: Math.max(0, Number(event.target.value || 0)) })}
                        />
                      </td>
                      <td>{money(lineTotal(row))} TL</td>
                      <td>
                        <button type="button" className="qo-icon-button" onClick={() => removeLine(row.id)} disabled={lines.length <= 1}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="qo-source-panel">
            <div>
              <h3>Satir Kaynak Secimi</h3>
              <p>Secim yapilinca KAYNAK / DEPO / RAF kolonlari otomatik guncellenir.</p>
            </div>
            {selectedLine ? (
              <div className="qo-source-options">
                {sourceOptions.map((option) => {
                  const selected = option.type === selectedLine.sourceType;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      className={selected ? "is-selected" : undefined}
                      onClick={() => selectSource(selectedLine.id, option.type)}
                    >
                      <strong>{option.title}</strong>
                      <span>{option.badge}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <div className="qo-footer-grid">
          <section className="qo-notes-box">
            <h2>Aciklamalar ve Kosullar</h2>
            <ol>
              <li>Fiyatlar secilen cari fiyat grubuna gore hesaplanir.</li>
              <li>Merkez depo secilen satirlar depo hazirlik emrine duser.</li>
              <li>Fabrika kaynagi secilen satirlar fabrika is akisina dahil olur.</li>
              <li>Belge onizleme ve WhatsApp taslagi islem sonrasi uretilebilir.</li>
            </ol>
            <label>
              <span>Islem Notu / Iade Sebebi</span>
              <textarea value={operationNote} onChange={(event) => setOperationNote(event.target.value)} />
            </label>
          </section>

          <section className="qo-totals-box">
            <h2>Toplamlar</h2>
            <div>
              <span>Ara Toplam</span>
              <strong>{money(totals.subtotal)} TL</strong>
            </div>
            <div>
              <span>Iskonto</span>
              <strong>{money(totals.discountTotal)} TL</strong>
            </div>
            <div>
              <span>Toplam KDV</span>
              <strong>{money(totals.taxTotal)} TL</strong>
            </div>
            <div className="is-grand">
              <span>Genel Toplam</span>
              <strong>{money(totals.grandTotal)} TL</strong>
            </div>
            <button type="button" onClick={submitOperation} disabled={isSubmitting}>
              {isSubmitting ? "OLUSTURULUYOR..." : "ISLEMI OLUSTUR"}
            </button>
          </section>
        </div>
      </section>

      <section className="qo-result-panel">
        <div className="qo-result-header">
          <div>
            <h2>Islem Sonucu</h2>
            <p>{notice ?? "Islem olusturuldugunda belge, WhatsApp taslagi ve AI operasyon notu burada gorunur."}</p>
          </div>
          <div className="qo-result-actions">
            <button type="button" onClick={openDocumentPreview}>
              Belge Onizleme
            </button>
            <button type="button" onClick={openWhatsappDraft}>
              WhatsApp Taslagi
            </button>
            <button type="button" onClick={() => showFoundationNotice("AI Operasyon Notu")}>
              AI Operasyon Notu
            </button>
            <button type="button" onClick={addLine}>
              Satir Ekle
            </button>
          </div>
        </div>

        <div className="qo-result-grid">
          <div>
            <h3>Operasyon Etkileri</h3>
            <ul>
              {impacts.map((impact) => (
                <li key={impact.id}>
                  <span className={`qo-pill ${impactToneClass(impact.tone)}`}>{impact.tone}</span>
                  <strong>{impact.title}</strong>
                  <p>{impact.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Yan Aksiyonlar</h3>
            {aiInsight ? (
              <div className="qo-action-preview">
                <strong>AI Operasyon Notu ({aiInsight.source})</strong>
                <p>{aiInsight.summary}</p>
              </div>
            ) : null}
            {documentPreviewVisible && documentPreview ? (
              <div className="qo-action-preview">
                <button type="button" onClick={() => setDocumentPreviewVisible(false)}>
                  Kapat
                </button>
                <strong>{documentPreview.title}</strong>
                <p>
                  Ref: {documentPreview.referenceNo} - Cari: {documentPreview.customerName} - Toplam: {money(documentPreview.totals.grandTotal)} TL
                </p>
              </div>
            ) : null}
            {whatsappDraftVisible && whatsappDraft ? (
              <div className="qo-action-preview">
                <button type="button" onClick={() => setWhatsappDraftVisible(false)}>
                  Kapat
                </button>
                <strong>WhatsApp Taslagi</strong>
                <p>{whatsappDraft.message}</p>
                <p>Gonderim: {whatsappDraft.sendEnabled ? "Etkin" : "Kapali"}</p>
              </div>
            ) : null}
            {!aiInsight && !documentPreviewVisible && !whatsappDraftVisible ? <p className="qo-muted">Submit sonrasi taslaklar burada acilir.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
