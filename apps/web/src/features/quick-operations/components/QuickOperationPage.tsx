"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import { QuickActionIcon } from "../../dashboard/components/dashboard-inline-icons";
import { demoCustomers, useQuickOperationState } from "../hooks/use-quick-operation-state";
import type { QuickOperationLine, QuickOperationType } from "../types";

const UNIT_OPTIONS = ["Adet", "Paket", "Takım", "Kutu", "Hizmet", "Metre"];

type WorkflowTabId = "order" | "payment" | "price" | "stock" | "return" | "document";

const WORKFLOW_TABS: Array<{
  id: WorkflowTabId;
  label: string;
  operation: QuickOperationType;
  icon: "order" | "pay" | "price" | "stock" | "return" | "doc";
}> = [
  { id: "order", label: "Sipariş Oluştur", operation: "sale_order", icon: "order" },
  { id: "payment", label: "Tahsilat İşle", operation: "payment", icon: "pay" },
  { id: "price", label: "Fiyat Ver", operation: "offer", icon: "price" },
  { id: "stock", label: "Stok Sorgula", operation: "sale_order", icon: "stock" },
  { id: "return", label: "İade Başlat", operation: "return", icon: "return" },
  { id: "document", label: "Belge Gönder", operation: "delivery", icon: "doc" }
];

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
      return "Teslim / Belge";
    case "return":
      return "İade";
    default:
      return type;
  }
}

function primaryActionLabel(tab: WorkflowTabId): string {
  switch (tab) {
    case "order":
      return "Siparişi Oluştur";
    case "payment":
      return "Tahsilatı Kaydet";
    case "price":
      return "Teklifi Oluştur";
    case "stock":
      return "Stok Sorgula";
    case "return":
      return "İadeyi Başlat";
    case "document":
      return "Belgeyi Gönder";
    default:
      return "Kaydet";
  }
}

function IconTrash({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function QuickOperationPage() {
  const { pushToast } = useToast();
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<WorkflowTabId>("order");
  const [primaryDone, setPrimaryDone] = useState(false);
  const [representative, setRepresentative] = useState("Ayşe Kaya");
  const [warehouse, setWarehouse] = useState("Merkez Depo");
  const [dueDate, setDueDate] = useState("15.05.2026");
  const [deliveryDate, setDeliveryDate] = useState("08.05.2026");
  const [description, setDescription] = useState("");

  const {
    operationType,
    setOperationType,
    customerId,
    setCustomerId,
    selectedCustomer,
    lines,
    totals,
    notice,
    setNotice,
    removeLine,
    updateLine,
    addEmptyLine,
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
    if (el) {
      el.scrollTop = 0;
    }
  }, [lines.length]);

  const docDate = useMemo(
    () =>
      new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
    []
  );
  const docTime = useMemo(
    () => new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    []
  );

  const totalPieces = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);

  const showDocMeta = activeTab !== "stock";

  const applyWorkflowTab = useCallback(
    (tab: WorkflowTabId) => {
      setActiveTab(tab);
      const next = WORKFLOW_TABS.find((t) => t.id === tab);
      if (next) setOperationType(next.operation);
      setPrimaryDone(false);
    },
    [setOperationType]
  );

  const handlePrimary = async () => {
    const ok = await submitOperation();
    if (ok) {
      pushToast("Kaydedildi");
      setPrimaryDone(true);
    }
  };

  const handleClear = () => {
    resetDraft();
    setDescription("");
    setRepresentative("Ayşe Kaya");
    setWarehouse("Merkez Depo");
    setDueDate("15.05.2026");
    setDeliveryDate("08.05.2026");
    setPrimaryDone(false);
    applyWorkflowTab("order");
    pushToast("Temizlendi");
  };

  return (
    <div className="hz-qop-page">
      {notice ? (
        <div className="hz-qop-notice" role="status">
          <span>{notice}</span>
          <button type="button" className="hz-qop-notice-dismiss" onClick={() => setNotice(null)}>
            Kapat
          </button>
        </div>
      ) : null}

      <div className="hz-qop-layout">
        <div className="hz-qop-main">
          <div className="hz-qop-main-surface">
            <h1 className="hz-sr-only">Hızlı İşlem</h1>
            <div className="hz-qop-tabs-bar">
              <nav className="hz-qop-tabs" aria-label="İşlem sekmeleri">
                {WORKFLOW_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`hz-qop-tab ${activeTab === tab.id ? "is-active" : ""}`}
                    onClick={() => applyWorkflowTab(tab.id)}
                  >
                    <span className="hz-qop-tab-ico">
                      <QuickActionIcon kind={tab.icon} size={16} />
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <section className="hz-qop-form" aria-label="Belge üst bilgileri">
            <div className="hz-qop-form-row hz-qop-form-row--cari">
              <label className="hz-qop-cari-search">
                <span className="hz-qop-label">Cari Arama</span>
                <select className="hz-qop-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  {demoCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hz-qop-risk-cards">
                <div className="hz-qop-risk-card hz-qop-risk-card--recv">
                  <span className="hz-qop-risk-label">Alacak</span>
                  <strong>₺{selectedCustomer.receivableDisplay ?? "—"}</strong>
                </div>
                <div className="hz-qop-risk-card hz-qop-risk-card--pay">
                  <span className="hz-qop-risk-label">Verecek</span>
                  <strong>₺{selectedCustomer.payableDisplay ?? "—"}</strong>
                </div>
                <div className="hz-qop-risk-card hz-qop-risk-card--warn">
                  <span className="hz-qop-risk-label">Uyarı</span>
                  <strong className="hz-qop-risk-warn-text">{selectedCustomer.warningDisplay ?? "—"}</strong>
                </div>
              </div>
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
            <button type="button" className="hz-btn hz-btn-secondary hz-qop-add-row-btn" onClick={() => addEmptyLine()}>
              <span className="hz-qop-add-row-ico" aria-hidden>
                <IconPlus size={15} />
              </span>
              Satır Ekle
            </button>
          </div>

          <div ref={tableScrollRef} className="hz-qop-table-scroll">
            <table className="hz-qop-table">
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
                  <tr key={line.id}>
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
                      <input className="hz-qop-cell-input" value={line.rackCode} onChange={(e) => updateLine(line.id, { rackCode: e.target.value })} />
                    </td>
                    <td className="hz-qop-cell amt">{money(lineAmount(line))}</td>
                    <td className="hz-qop-col-act">
                      <button type="button" className="hz-qop-icon-btn" aria-label="Satırı sil" onClick={() => removeLine(line.id)}>
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="hz-qop-total-strip">
            <span>
              <strong>{lines.length}</strong> satır
            </span>
            <span>
              <strong>{totalPieces}</strong> ürün
            </span>
            <span className="hz-qop-strip-sep" />
            <span>Ara Toplam: {money(totals.subtotal)} ₺</span>
            <span>Toplam İskonto: {money(totals.discountTotal)} ₺</span>
            <span className="hz-qop-strip-grand">Genel Toplam: {money(totals.grandTotal)} ₺</span>
          </div>

          <footer className="hz-qop-actions">
            <button type="button" className="hz-btn hz-btn-secondary" onClick={() => pushToast("Taslak kaydedildi")}>
              Taslak Kaydet
            </button>
            <button type="button" className="hz-btn hz-btn-secondary" onClick={() => pushToast("Onaya gönderildi")}>
              Onaya Gönder
            </button>
            <button
              type="button"
              className="hz-btn hz-btn-primary"
              disabled={primaryDone || isSubmitting}
              onClick={handlePrimary}
            >
              {isSubmitting ? "İşleniyor…" : primaryActionLabel(activeTab)}
            </button>
            <button type="button" className="hz-btn hz-btn-secondary" onClick={handleClear}>
              Temizle
            </button>
            <button type="button" className="hz-btn hz-btn-secondary" onClick={() => pushToast("Önizleme hazırlanıyor")}>
              Yazdır Önizleme
            </button>
          </footer>
          </div>
        </div>

        <aside className="hz-qop-side" aria-label="Özet paneli">
          <article className="hz-qop-card hz-qop-card--summary">
            <h2 className="hz-qop-card-title">İşlem Özeti</h2>
            <dl className="hz-qop-dl">
              <div>
                <dt>İşlem Türü</dt>
                <dd>{operationTypeLabel(operationType)}</dd>
              </div>
              {showDocMeta ? (
                <>
                  <div>
                    <dt>Belge No</dt>
                    <dd>SO-2026-0148</dd>
                  </div>
                  <div>
                    <dt>Tarih</dt>
                    <dd>{docDate}</dd>
                  </div>
                  <div>
                    <dt>Saat</dt>
                    <dd>{docTime}</dd>
                  </div>
                </>
              ) : null}
              <div>
                <dt>Temsilci</dt>
                <dd>
                  <input
                    className="hz-qop-summary-input"
                    value={representative}
                    onChange={(e) => setRepresentative(e.target.value)}
                    autoComplete="off"
                  />
                </dd>
              </div>
              <div>
                <dt>Depo</dt>
                <dd>
                  <select className="hz-qop-summary-input" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                    <option>Merkez Depo</option>
                    <option>Ana Depo</option>
                    <option>A Blok</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt>Vade</dt>
                <dd>
                  <input className="hz-qop-summary-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} autoComplete="off" />
                </dd>
              </div>
              <div>
                <dt>Teslim Tarihi</dt>
                <dd>
                  <input
                    className="hz-qop-summary-input"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    autoComplete="off"
                  />
                </dd>
              </div>
            </dl>
          </article>

          <article className="hz-qop-card hz-qop-card--amounts">
            <h2 className="hz-qop-card-title">Tutar Özeti</h2>
            <dl className="hz-qop-dl hz-qop-dl--amounts">
              <div>
                <dt>Ara Toplam</dt>
                <dd>{money(totals.subtotal)} ₺</dd>
              </div>
              <div>
                <dt>Toplam İskonto</dt>
                <dd className="hz-qop-disc">{money(totals.discountTotal)} ₺</dd>
              </div>
              <div>
                <dt>KDV (%20)</dt>
                <dd>{money(totals.taxTotal)} ₺</dd>
              </div>
              <div className="hz-qop-grand-row">
                <dt>Genel Toplam</dt>
                <dd>{money(totals.grandTotal)} ₺</dd>
              </div>
            </dl>
          </article>

          <article className="hz-qop-card hz-qop-card--ai">
            <h2 className="hz-qop-card-title">Öneri (AI)</h2>
            <ul className="hz-qop-ai-list">
              <li>Bu siparişte 2 üründe stok kritik seviyeye yakın.</li>
              <li>Tahsilat riski orta.</li>
              <li>İstersen taksit teklifi de oluşturabilirim.</li>
            </ul>
          </article>

          <article className="hz-qop-card hz-qop-card--note">
            <h2 className="hz-qop-card-title">Açıklama</h2>
            <textarea
              id="hz-qop-note"
              className="hz-qop-note-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="İşlem notu / açıklama ekleyin…"
              rows={4}
              maxLength={500}
              aria-label="İşlem notu veya açıklama"
            />
          </article>
        </aside>
      </div>
    </div>
  );
}
