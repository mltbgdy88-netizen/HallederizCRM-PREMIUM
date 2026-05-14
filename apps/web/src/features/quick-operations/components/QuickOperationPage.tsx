"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DetailPanel, SplitContentLayout } from "@hallederiz/ui";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import type { QuickBubbleKind } from "../../dashboard/components/dashboard-inline-icons";
import {
  IconPlusCircle,
  IconPrinter,
  IconSave,
  IconSend,
  IconTrash2,
  QuickActionIcon
} from "../../dashboard/components/dashboard-inline-icons";
import { demoCustomers, seedQuickOperationLines, useQuickOperationState } from "../hooks/use-quick-operation-state";
import type { QuickOperationLine, QuickOperationType } from "../types";
import { QuickOperationImpactPanel } from "./QuickOperationImpactPanel";
import { QuickOperationSourceAccordion } from "./QuickOperationSourceAccordion";
import { QuickOperationTotalsPanel } from "./QuickOperationTotalsPanel";

const UNIT_OPTIONS = ["Adet", "Paket", "Takım", "Kutu", "Hizmet", "Metre"];

export type WorkflowTabId = "order" | "price" | "payment" | "delivery" | "document" | "return";

const WORKFLOW: Array<{
  id: WorkflowTabId;
  title: string;
  hint: string;
  operation: QuickOperationType;
  icon: QuickBubbleKind;
}> = [
  { id: "order", title: "Sipariş al", hint: "Sipariş fişi ve satırlar.", operation: "sale_order", icon: "order" },
  { id: "price", title: "Fiyat / Teklif", hint: "Teklif ve fiyatlandırma.", operation: "offer", icon: "price" },
  { id: "payment", title: "Tahsilat gir", hint: "Tahsilat kaydı.", operation: "payment", icon: "pay" },
  { id: "delivery", title: "Ürün teslim et", hint: "Depo hazırlıktan teslim.", operation: "delivery", icon: "stock" },
  { id: "document", title: "Belge gönder", hint: "Belge çıkışı ve iletim.", operation: "delivery", icon: "doc" },
  { id: "return", title: "İade / sorun", hint: "İade ve sorun kaydı.", operation: "return", icon: "return" }
];

const PREP_SLIPS: Array<{ id: string; label: string }> = [
  { id: "prep-1", label: "DH-2026-0142 · Delta A.Ş. · Hazırlandı" },
  { id: "prep-2", label: "DH-2026-0151 · Nova Gıda · Hazırlandı" }
];

function prepLines(id: string): QuickOperationLine[] {
  const seed = seedQuickOperationLines();
  if (id === "prep-1") return seed.slice(0, 4).map((l, i) => ({ ...l, id: `prep1_${i}_${l.id}` }));
  if (id === "prep-2") return seed.slice(2, 6).map((l, i) => ({ ...l, id: `prep2_${i}_${l.id}` }));
  return [];
}

function money(value: number): string {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function lineAmount(line: QuickOperationLine): number {
  return Math.round(line.quantity * line.unitPrice * 100) / 100;
}

function operationTypeLabel(type: QuickOperationType): string {
  switch (type) {
    case "sale_order":
      return "Sipariş";
    case "payment":
      return "Tahsilat";
    case "offer":
      return "Teklif";
    case "delivery":
      return "Teslim / belge";
    case "return":
      return "İade";
    default:
      return type;
  }
}

function primaryActionLabel(tab: WorkflowTabId): string {
  switch (tab) {
    case "order":
      return "Siparişi oluştur";
    case "payment":
      return "Tahsilatı kaydet";
    case "price":
      return "Teklifi oluştur";
    case "delivery":
      return "Teslimi başlat";
    case "document":
      return "Belgeyi gönder";
    case "return":
      return "Kaydı oluştur";
    default:
      return "Kaydet";
  }
}

function primaryIconKind(tab: WorkflowTabId): QuickBubbleKind {
  switch (tab) {
    case "order":
      return "order";
    case "payment":
      return "pay";
    case "price":
      return "price";
    case "delivery":
      return "stock";
    case "document":
      return "doc";
    case "return":
      return "return";
    default:
      return "order";
  }
}

function defaultLinesForTab(tab: WorkflowTabId): QuickOperationLine[] {
  const full = seedQuickOperationLines();
  switch (tab) {
    case "order":
      return full;
    case "price":
      return full.slice(0, 3);
    case "payment":
    case "document":
      return [];
    case "delivery":
      return [];
    case "return":
      return [];
    default:
      return full;
  }
}

function nextStepText(tab: WorkflowTabId, hasLines: boolean): string {
  if (tab === "delivery") {
    return hasLines
      ? "Teslimi kaydedince fiş Depo Hazırlık listesinden düşer; belge arşive gider."
      : "Önce hazır depo fişini seçin veya satır ekleyin.";
  }
  if (tab === "document") {
    return hasLines ? "Gönderim öncesi belge önizlemesini kontrol edin." : "Belge ve cari seçimini tamamlayın.";
  }
  if (tab === "payment") {
    return "Tahsilat tutarı ve cari eşleşmesini doğrulayın.";
  }
  if (tab === "return") {
    return "İade nedeni ve satırlar onayda değerlendirilir.";
  }
  return hasLines ? "Kayıt sonrası ilgili modülde takip edin." : "Satır ekleyin veya ürün seçin.";
}

export function QuickOperationPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<WorkflowTabId>("order");
  const [primaryDone, setPrimaryDone] = useState(false);
  const [representative, setRepresentative] = useState("Ayşe Kaya");
  const [warehouse, setWarehouse] = useState("Merkez Depo");
  const [dueDate, setDueDate] = useState("15.05.2026");
  const [deliveryDate, setDeliveryDate] = useState("08.05.2026");
  const [description, setDescription] = useState("");
  const [prepSlipId, setPrepSlipId] = useState("");
  const [prepSearch, setPrepSearch] = useState("");

  const {
    operationType,
    setOperationType,
    customerId,
    setCustomerId,
    selectedCustomer,
    lines,
    totals,
    impacts,
    aiInsight,
    notice,
    setNotice,
    expandedLineId,
    setExpandedLineId,
    removeLine,
    replaceLines,
    updateLine,
    addEmptyLine,
    selectSource,
    submitOperation,
    isSubmitting,
    resetDraft,
    setOperationNote
  } = useQuickOperationState();

  useEffect(() => {
    setOperationNote(description);
  }, [description, setOperationNote]);

  useLayoutEffect(() => {
    const el = tableScrollRef.current;
    if (el) el.scrollTop = 0;
  }, [lines.length, activeTab]);

  const docDate = useMemo(
    () =>
      new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
    []
  );

  const applyTab = useCallback(
    (tab: WorkflowTabId) => {
      setActiveTab(tab);
      const next = WORKFLOW.find((t) => t.id === tab);
      if (next) setOperationType(next.operation);
      setPrimaryDone(false);
      replaceLines(defaultLinesForTab(tab));
      setPrepSlipId("");
      setPrepSearch("");
    },
    [setOperationType, replaceLines]
  );

  const handlePrimary = async () => {
    const ok = await submitOperation();
    if (ok) {
      pushToast(
        activeTab === "order"
          ? "Sipariş taslağı oluşturuldu. Canlı execution için policy/onay zinciri gerekir."
          : "İşlem taslağı kaydedildi. Bu adım canlı mutation başarısı değildir."
      );
      setPrimaryDone(true);
    }
  };

  const handleNewOperation = () => {
    resetDraft();
    setDescription("");
    setRepresentative("Ayşe Kaya");
    setWarehouse("Merkez Depo");
    setDueDate("15.05.2026");
    setDeliveryDate("08.05.2026");
    setPrimaryDone(false);
    applyTab("order");
    pushToast("Yeni işlem");
  };

  const handleClear = () => {
    resetDraft();
    setDescription("");
    setPrimaryDone(false);
    applyTab(activeTab);
    pushToast("Taslak temizlendi");
  };

  const loadPrepLines = () => {
    if (!prepSlipId) {
      pushToast("Önce hazır fiş seçin");
      return;
    }
    const next = prepLines(prepSlipId);
    replaceLines(next);
    pushToast("Fiş satırları yüklendi");
  };

  const toggleSourceRow = useCallback(
    (lineId: string) => {
      setExpandedLineId((current) => (current === lineId ? null : lineId));
    },
    [setExpandedLineId]
  );

  const riskHigh = selectedCustomer.risk === "Yuksek";
  const riskLabel = riskHigh ? "Yüksek" : selectedCustomer.risk === "Orta" ? "Orta" : "Düşük";

  return (
    <div className="hz-qop-page hz-qop-page--v2">
      {notice ? (
        <div className="hz-qop-notice hz-qop-notice--v2" role="status">
          <span>{notice}</span>
          <button type="button" className="hz-qop-notice-dismiss" onClick={() => setNotice(null)}>
            Kapat
          </button>
        </div>
      ) : null}

      {dataSourceConfig.useDemoData ? (
        <div className="hz-qop-demo-band" role="status">
          Demo veri — canlı cari / stok / onay akışı bağlandığında bu şerit kalkar ve gerçek kaynaklar kullanılır.
        </div>
      ) : (
        <div className="hz-qop-live-band" role="status">
          Canlı mod: gönderim API (`/quick-operations/submit`) üzerinden; başarılı yanıt policy ve onay zincirine bağlıdır.
        </div>
      )}

      <header className="hz-qop-hero">
        <div className="hz-qop-hero-text">
          <p className="hz-qop-hero-kicker">Ne yapmak istiyorsun?</p>
          <p className="hz-qop-hero-sub">İşlem türünü seçin; taslak ve sipariş adımlarını alttaki aksiyonlarla tamamlayın.</p>
        </div>
      </header>

      <SplitContentLayout
        sideWidth="detail"
        main={
          <div className="hz-qop-main">
            <div className="hz-qop-main-surface hz-qop-main-surface--v2">
              <h1 className="hz-sr-only">Hızlı İşlem</h1>

              <nav className="hz-qop-picker" aria-label="İşlem seçimi">
                {WORKFLOW.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className={`hz-qop-pick ${activeTab === w.id ? "is-active" : ""}`}
                    onClick={() => applyTab(w.id)}
                  >
                    <span className="hz-qop-pick-ico" aria-hidden>
                      <QuickActionIcon kind={w.icon} size={18} className="hz-qop-pick-svg" />
                    </span>
                    <span className="hz-qop-pick-body">
                      <span className="hz-qop-pick-title">{w.title}</span>
                      <span className="hz-qop-pick-hint">{w.hint}</span>
                    </span>
                  </button>
                ))}
              </nav>

              {activeTab === "delivery" ? (
                <section className="hz-qop-delivery-band" aria-label="Depo hazırlık bağlantısı">
                  <p className="hz-qop-delivery-lead">
                    Hazırlandı durumundaki Depo Hazırlık fişlerinden teslim başlatın. Fiş{" "}
                    <a href="/depo" className="hz-qop-inline-link">
                      Depo Hazırlık
                    </a>{" "}
                    ekranında tamamlanır; teslim sonrası fiş listeden çıkar ve belge arşivlenir.
                  </p>
                  <div className="hz-qop-delivery-row">
                    <label className="hz-qop-field">
                      <span className="hz-qop-label">Hazır fiş</span>
                      <select className="hz-qop-input" value={prepSlipId} onChange={(e) => setPrepSlipId(e.target.value)}>
                        <option value="">Seçin…</option>
                        {PREP_SLIPS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="hz-qop-field hz-qop-field--grow">
                      <span className="hz-qop-label">Cari / belge no</span>
                      <input
                        className="hz-qop-input"
                        value={prepSearch}
                        onChange={(e) => setPrepSearch(e.target.value)}
                        placeholder="Ara…"
                        autoComplete="off"
                      />
                    </label>
                    <button type="button" className="hz-qop-btn hz-qop-btn--secondary" onClick={loadPrepLines}>
                      Satırları yükle
                    </button>
                  </div>
                </section>
              ) : null}

              <section className="hz-qop-form hz-qop-form--v2" aria-label="Cari ve tarih">
                <div className="hz-qop-form-row hz-qop-form-row--v2">
                  <label className="hz-qop-cari-search">
                    <span className="hz-qop-label">Cari</span>
                    <select className="hz-qop-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                      {demoCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="hz-qop-date-inline hz-qop-date-in-form">
                    <span className="hz-qop-label">Tarih</span>
                    <div className="hz-qop-date-val">
                      <strong>{docDate}</strong>
                      <span className="hz-qop-date-auto">Otomatik</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="hz-qop-table-toolbar">
                <button type="button" className="hz-qop-btn hz-qop-btn--secondary" onClick={() => addEmptyLine()}>
                  <span className="hz-qop-add-row-ico" aria-hidden>
                    <IconPlusCircle size={17} />
                  </span>
                  Satır ekle
                </button>
              </div>

              <div ref={tableScrollRef} className="hz-qop-table-scroll hz-qop-table-scroll--v2">
                <table className="hz-qop-table hz-qop-table--v2">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ürün Kodu</th>
                      <th>Ürün Adı</th>
                      <th>Birim</th>
                      <th>Miktar</th>
                      <th>Fiyat (₺)</th>
                      <th>Depo</th>
                      <th>Raf No</th>
                      <th>Tutar (₺)</th>
                      <th className="hz-qop-col-act">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <Fragment key={line.id}>
                        <tr>
                          <td>{index + 1}</td>
                          <td>
                            <input
                              className="hz-qop-cell-input"
                              value={line.productCode}
                              onChange={(e) => updateLine(line.id, { productCode: e.target.value })}
                              placeholder="Ürün ara…"
                            />
                          </td>
                          <td>
                            <input
                              className="hz-qop-cell-input"
                              value={line.productName}
                              onChange={(e) => updateLine(line.id, { productName: e.target.value })}
                            />
                          </td>
                          <td>
                            <select
                              className="hz-qop-cell-input"
                              value={line.unit}
                              onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                            >
                              <option value="">—</option>
                              {UNIT_OPTIONS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              className="hz-qop-cell-input hz-qop-cell-num"
                              type="number"
                              min={0}
                              value={line.quantity}
                              onChange={(e) => updateLine(line.id, { quantity: Math.max(0, Number(e.target.value || 0)) })}
                            />
                          </td>
                          <td>
                            <input
                              className="hz-qop-cell-input hz-qop-cell-num"
                              type="number"
                              min={0}
                              step={0.01}
                              value={line.unitPrice}
                              onChange={(e) => updateLine(line.id, { unitPrice: Math.max(0, Number(e.target.value || 0)) })}
                            />
                          </td>
                          <td>
                            <input
                              className="hz-qop-cell-input"
                              value={line.warehouseName}
                              onChange={(e) => updateLine(line.id, { warehouseName: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="hz-qop-cell-input"
                              value={line.rackCode}
                              onChange={(e) => updateLine(line.id, { rackCode: e.target.value })}
                            />
                          </td>
                          <td className="hz-qop-cell amt">{money(lineAmount(line))}</td>
                          <td className="hz-qop-col-act hz-qop-col-act--row">
                            <button
                              type="button"
                              className={`hz-qop-btn hz-qop-btn--secondary hz-qop-btn--row-act${expandedLineId === line.id ? " is-active" : ""}`}
                              title="Satır kaynağı"
                              aria-expanded={expandedLineId === line.id}
                              aria-controls={`qop-src-${line.id}`}
                              onClick={() => toggleSourceRow(line.id)}
                            >
                              Kaynak
                            </button>
                            <button
                              type="button"
                              className="hz-qop-icon-btn hz-qop-icon-btn--v2"
                              aria-label="Satırı sil"
                              title="Satırı sil"
                              onClick={() => removeLine(line.id)}
                            >
                              <IconTrash2 size={15} />
                            </button>
                          </td>
                        </tr>
                        {expandedLineId === line.id ? (
                          <tr className="hz-qop-source-row">
                            <td colSpan={10} id={`qop-src-${line.id}`}>
                              <QuickOperationSourceAccordion line={line} onSelectSource={selectSource} />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <details className="hz-qop-more">
                <summary className="hz-qop-more-sum">Açıklama ve ek alanlar</summary>
                <div className="hz-qop-more-body">
                  <label className="hz-qop-field">
                    <span className="hz-qop-label">İşlem notu</span>
                    <textarea
                      className="hz-qop-note-textarea hz-qop-note-textarea--inline"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Kısa not…"
                      rows={3}
                      maxLength={500}
                    />
                  </label>
                  <div className="hz-qop-more-grid">
                    <label className="hz-qop-field">
                      <span className="hz-qop-label">Temsilci</span>
                      <input className="hz-qop-input" value={representative} onChange={(e) => setRepresentative(e.target.value)} />
                    </label>
                    <label className="hz-qop-field">
                      <span className="hz-qop-label">Depo</span>
                      <select className="hz-qop-input" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                        <option>Merkez Depo</option>
                        <option>Ana Depo</option>
                        <option>A Blok</option>
                      </select>
                    </label>
                    <label className="hz-qop-field">
                      <span className="hz-qop-label">Vade</span>
                      <input className="hz-qop-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </label>
                    <label className="hz-qop-field">
                      <span className="hz-qop-label">Teslim tarihi</span>
                      <input className="hz-qop-input" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                    </label>
                  </div>
                </div>
              </details>

              <footer className="hz-qop-actions hz-qop-actions--v2">
                <button type="button" className="hz-qop-btn hz-qop-btn--ghost" onClick={handleNewOperation}>
                  Yeni işlem
                </button>
                <button type="button" className="hz-qop-btn hz-qop-btn--outline" onClick={() => router.push("/archive")}>
                  Geçmiş
                </button>
                <button
                  type="button"
                  className="hz-qop-btn hz-qop-btn--outline"
                  onClick={() => pushToast("Taslak kaydedildi. Canlı uygulama onay/execution durumuna bağlıdır.")}
                >
                  <IconSave size={16} aria-hidden />
                  Taslak kaydet
                </button>
                <button
                  type="button"
                  className="hz-qop-btn hz-qop-btn--ghost"
                  onClick={() => pushToast("Onay talebi hazırlandı. Tamamlandı bilgisi yalnız onay sonrası verilir.")}
                >
                  <IconSend size={16} aria-hidden />
                  Onaya gönder
                </button>
                <button
                  type="button"
                  className="hz-qop-btn hz-qop-btn--outline"
                  onClick={() => pushToast("Önizleme hazırlanıyor. Gönderim/execute başarısı bu adımda üretilmez.")}
                >
                  <IconPrinter size={16} aria-hidden />
                  Önizleme
                </button>
                <button type="button" className="hz-qop-btn hz-qop-btn--outline" onClick={handleClear}>
                  Temizle
                </button>
                <button
                  type="button"
                  className="hz-qop-btn hz-qop-btn--primary hz-qop-btn--primary-solo"
                  disabled={primaryDone || isSubmitting}
                  onClick={handlePrimary}
                >
                  {isSubmitting ? (
                    "İşleniyor…"
                  ) : (
                    <>
                      <QuickActionIcon kind={primaryIconKind(activeTab)} size={17} className="hz-qop-btn-ico-on-primary" />
                      {primaryActionLabel(activeTab)}
                    </>
                  )}
                </button>
              </footer>
            </div>
          </div>
        }
        side={
          <div className="hz-qop-side-stack hz-qop-side--v2" aria-label="Cari, toplamlar ve operasyon özeti">
            <article className="hz-qop-card hz-qop-card--v2">
              <h2 className="hz-qop-side-h">Cari özeti</h2>
              <p className="hz-qop-side-lead">{selectedCustomer.name}</p>
              <dl className="hz-qop-dl hz-qop-dl--tight">
                <div>
                  <dt>Tip</dt>
                  <dd>{selectedCustomer.customerType ?? "—"}</dd>
                </div>
                <div>
                  <dt>Fiyat grubu</dt>
                  <dd>{selectedCustomer.priceGroup}</dd>
                </div>
                <div>
                  <dt>Alacak</dt>
                  <dd>₺{selectedCustomer.receivableDisplay ?? "—"}</dd>
                </div>
                <div>
                  <dt>Verecek</dt>
                  <dd>₺{selectedCustomer.payableDisplay ?? "—"}</dd>
                </div>
                {selectedCustomer.warningDisplay && selectedCustomer.warningDisplay !== "—" ? (
                  <div>
                    <dt>Vade / ödeme</dt>
                    <dd>{selectedCustomer.warningDisplay}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="hz-qop-side-badge-row">
                {selectedCustomer.whatsappMatched ? (
                  <span className="hz-qop-pill hz-qop-pill--wa" title="WhatsApp kanalı ile eşleşmiş cari">
                    WhatsApp eşleşti
                  </span>
                ) : (
                  <span className="hz-qop-pill hz-qop-pill--muted">WhatsApp: eşleşme yok</span>
                )}
                <span className={`hz-qop-pill${riskHigh ? " hz-qop-pill--risk" : ""}`}>Risk: {riskLabel}</span>
              </div>
              <details className="hz-qop-side-details">
                <summary>Adres ve ek not</summary>
                <p className="hz-qop-side-muted">{selectedCustomer.address}</p>
              </details>
            </article>

            <article className="hz-qop-card hz-qop-card--v2">
              <h2 className="hz-qop-side-h">İşlem özeti</h2>
              <dl className="hz-qop-dl hz-qop-dl--tight">
                <div>
                  <dt>Seçili işlem</dt>
                  <dd>{WORKFLOW.find((w) => w.id === activeTab)?.title ?? "—"}</dd>
                </div>
                <div>
                  <dt>Tür</dt>
                  <dd>{operationTypeLabel(operationType)}</dd>
                </div>
                <div>
                  <dt>Belge no</dt>
                  <dd className="hz-qop-dd-mono">SO-2026-0148</dd>
                </div>
                <div>
                  <dt>Sonraki adım</dt>
                  <dd className="hz-qop-side-next-dd">{nextStepText(activeTab, lines.length > 0)}</dd>
                </div>
              </dl>
            </article>

            <DetailPanel title="Toplamlar" className="hz-qop-detail-panel">
              <QuickOperationTotalsPanel totals={totals} layout="bare" />
            </DetailPanel>

            <DetailPanel title="Operasyon etkisi" className="hz-qop-detail-panel">
              <QuickOperationImpactPanel impacts={impacts} aiInsight={aiInsight} layout="bare" />
            </DetailPanel>

            {riskHigh || (selectedCustomer.warningDisplay && selectedCustomer.warningDisplay !== "—") ? (
              <article className="hz-qop-card hz-qop-card--v2 hz-qop-card--warn-soft">
                <h2 className="hz-qop-side-h">Uyarı / onay</h2>
                {riskHigh ? <p className="hz-qop-side-warn-line">Yüksek riskli cari: kayıt veya teslim öncesi onay önerilir.</p> : null}
                {selectedCustomer.warningDisplay && selectedCustomer.warningDisplay !== "—" ? (
                  <p className="hz-qop-side-warn-line">{selectedCustomer.warningDisplay}</p>
                ) : null}
              </article>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
