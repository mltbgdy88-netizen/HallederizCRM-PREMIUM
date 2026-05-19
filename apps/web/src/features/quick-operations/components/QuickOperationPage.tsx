"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SplitContentLayout } from "@hallederiz/ui";
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
import {
  MSG_CUSTOMER_PARAM_NOT_FOUND,
  MSG_CUSTOMERS_EMPTY,
  MSG_CUSTOMERS_REQUIRED,
  MSG_NOT_LIVE,
  MSG_SUBMIT_APPROVALS_HINT,
  MSG_PREVIEW_CUSTOMER,
  MSG_PREVIEW_DOCUMENT,
  MSG_PREVIEW_PRODUCT,
  MSG_SELECT_CUSTOMER,
  MSG_SELECT_LINE
} from "../data/quick-operation-messages";
import { isQuickOpPreviewProductId } from "../data/quick-operation-guards";
import {
  dataSourceConfig as quickOpDataSource
} from "../../../lib/data-source";
import {
  defaultQuickOperationLinesForTab,
  seedQuickOperationLines,
  useQuickOperationState
} from "../hooks/use-quick-operation-state";
import type { QuickOperationLine, QuickOperationSourceType, QuickOperationType } from "../types";
import { QuickOperationSourceAccordion } from "./QuickOperationSourceAccordion";
import { QuickOperationWorkbenchSide } from "./QuickOperationWorkbenchSide";

const UNIT_OPTIONS = ["Adet", "Paket", "Takım", "Kutu", "Hizmet", "Metre"];

export type WorkflowTabId = "order" | "price" | "payment" | "delivery" | "document" | "return";

const WORKFLOW: Array<{
  id: WorkflowTabId;
  segment: string;
  title: string;
  hint: string;
  operation: QuickOperationType;
  icon: QuickBubbleKind;
}> = [
  { id: "price", segment: "Teklif", title: "Fiyat / Teklif", hint: "Teklif, fiyatlandırma ve belge taslağı.", operation: "offer", icon: "price" },
  { id: "order", segment: "Sipariş", title: "Sipariş al", hint: "Stok, depo, kaynak ve onay etkisi.", operation: "sale_order", icon: "order" },
  { id: "delivery", segment: "Teslim", title: "Ürün teslim et", hint: "Hazır depo fişi ve teslim tarihi.", operation: "delivery", icon: "stock" },
  { id: "payment", segment: "Tahsilat", title: "Tahsilat gir", hint: "Cari, tutar, ödeme ve açık bakiye.", operation: "payment", icon: "pay" },
  { id: "return", segment: "İade", title: "İade / sorun", hint: "İade nedeni, ilgili kayıt ve onay.", operation: "return", icon: "return" },
  { id: "document", segment: "Belge", title: "Belge gönder", hint: "Belge çıkışı ve kanal iletimi.", operation: "delivery", icon: "doc" }
];

const TABLE_COL_COUNT = 12;

function sourceBadgeClass(sourceType: QuickOperationSourceType): string {
  switch (sourceType) {
    case "center_warehouse":
      return "hz-qop-src-badge hz-qop-src-badge--center";
    case "factory":
      return "hz-qop-src-badge hz-qop-src-badge--factory";
    case "supplier":
      return "hz-qop-src-badge hz-qop-src-badge--supplier";
    case "split":
      return "hz-qop-src-badge hz-qop-src-badge--split";
    default:
      return "hz-qop-src-badge hz-qop-src-badge--auto";
  }
}

function sourceBadgeLabel(line: QuickOperationLine): string {
  if (line.sourceLabel && line.sourceLabel !== "—") return line.sourceLabel;
  switch (line.sourceType) {
    case "center_warehouse":
      return "Merkez";
    case "factory":
      return "Fabrika";
    case "supplier":
      return "Tedarik";
    case "split":
      return "Çoklu";
    default:
      return "Otomatik";
  }
}

function tabNeedsLines(tab: WorkflowTabId): boolean {
  return tab === "order" || tab === "price" || tab === "return";
}

function tabFocusHint(tab: WorkflowTabId): string {
  switch (tab) {
    case "price":
      return "Fiyatlandırma, belge ve WhatsApp taslağı odaklı işlem.";
    case "order":
      return "Stok, depo kaynağı ve sipariş onay etkisi odaklı işlem.";
    case "delivery":
      return "Hazır depo fişi ve teslim tarihi odaklı işlem.";
    case "payment":
      return "Cari bakiye, tahsilat tutarı ve ödeme eşleşmesi odaklı işlem.";
    case "return":
      return "İade nedeni ve onay değerlendirmesi odaklı işlem.";
    case "document":
      return "Belge önizleme ve kanal iletimi odaklı işlem.";
    default:
      return "";
  }
}

function countMissingFields(
  tab: WorkflowTabId,
  lines: QuickOperationLine[],
  customerReady: boolean
): number {
  let count = 0;
  if (!customerReady) count += 1;
  if (!tabNeedsLines(tab)) return count;
  const productLines = lines.filter((line) => line.productCode.trim() || line.productName.trim());
  if (productLines.length === 0) {
    count += 1;
    return count;
  }
  productLines.forEach((line) => {
    if (!line.quantity || line.quantity <= 0) count += 1;
  });
  return count;
}

const PREP_SLIPS: Array<{ id: string; label: string }> = [
  { id: "prep-1", label: "DH-2026-0142 · Delta A.Ş. · Hazırlandı" },
  { id: "prep-2", label: "DH-2026-0151 · Nova Gıda · Hazırlandı" }
];

function prepLines(id: string): QuickOperationLine[] {
  if (!quickOpDataSource.useDemoData) {
    return [];
  }
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
      return "Siparişi hazırla";
    case "payment":
      return "Tahsilatı hazırla";
    case "price":
      return "Teklifi hazırla";
    case "delivery":
      return "Teslimi hazırla";
    case "document":
      return "Belge taslağını hazırla";
    case "return":
      return "İade talebini hazırla";
    default:
      return "Taslağı hazırla";
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
  const searchParams = useSearchParams();
  const customerParam = searchParams.get("customer");
  const productParam = searchParams.get("product");
  const { pushToast } = useToast();
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<WorkflowTabId>("order");
  const [representative, setRepresentative] = useState("Ayşe Kaya");
  const [warehouse, setWarehouse] = useState("Merkez Depo");
  const [dueDate, setDueDate] = useState("15.05.2026");
  const [deliveryDate, setDeliveryDate] = useState("08.05.2026");
  const [description, setDescription] = useState("");
  const [prepSlipId, setPrepSlipId] = useState("");
  const [prepSearch, setPrepSearch] = useState("");

  const {
    catalogCustomers,
    operationType,
    setOperationType,
    customerId,
    setCustomerId,
    selectedCustomer,
    isPreviewCustomer,
    isPreviewCustomerBlocked,
    applyProductFromUrl,
    initialCustomerParam,
    initialCustomerResolved,
    customersLoading,
    customersLoadError,
    hasCatalogCustomers,
    lines,
    totals,
    impacts,
    aiInsight,
    notice,
    setNotice,
    submitLinks,
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
  } = useQuickOperationState({
    initialCustomerId: customerParam,
    initialProductId: productParam
  });

  useEffect(() => {
    setOperationNote(description);
  }, [description, setOperationNote]);

  useEffect(() => {
    if (!productParam) {
      return;
    }
    if (isQuickOpPreviewProductId(productParam)) {
      pushToast(MSG_PREVIEW_PRODUCT);
      return;
    }
    applyProductFromUrl(productParam);
  }, [applyProductFromUrl, productParam, pushToast]);

  useEffect(() => {
    if (customersLoading || !initialCustomerParam || initialCustomerResolved) {
      return;
    }
    setNotice(MSG_CUSTOMER_PARAM_NOT_FOUND);
  }, [customersLoading, initialCustomerParam, initialCustomerResolved, setNotice]);

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
      replaceLines(defaultQuickOperationLinesForTab(tab));
      setPrepSlipId("");
      setPrepSearch("");
    },
    [setOperationType, replaceLines]
  );

  const handlePrimary = async () => {
    if (isPreviewCustomerBlocked) {
      pushToast(MSG_PREVIEW_CUSTOMER);
      return;
    }
    if (customersLoading) {
      return;
    }
    if (!hasCatalogCustomers) {
      pushToast(MSG_CUSTOMERS_REQUIRED);
      return;
    }
    if (!customerId || catalogCustomers.length === 0) {
      pushToast(MSG_SELECT_CUSTOMER);
      return;
    }
    if (tabNeedsLines(activeTab)) {
      const hasLine = lines.some((line) => line.productCode.trim() || line.productName.trim());
      if (!hasLine) {
        pushToast(MSG_SELECT_LINE);
        return;
      }
    }
    const outcome = await submitOperation();
    if (outcome.ok && outcome.toast) {
      pushToast(outcome.toast);
    }
  };

  const handleNewOperation = () => {
    resetDraft();
    setDescription("");
    setRepresentative("Ayşe Kaya");
    setWarehouse("Merkez Depo");
    setDueDate("15.05.2026");
    setDeliveryDate("08.05.2026");
    applyTab("order");
    pushToast("Yeni işlem başlatıldı");
  };

  const handleClear = () => {
    resetDraft();
    setDescription("");
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

  const riskHigh = selectedCustomer.risk === "Yüksek";
  const riskLabel = riskHigh ? "Yüksek" : selectedCustomer.risk === "Orta" ? "Orta" : "Düşük";
  const activeWorkflow = WORKFLOW.find((w) => w.id === activeTab);
  const customerReady = Boolean(!customersLoading && customerId && hasCatalogCustomers);
  const workbenchLocked = customersLoading || !hasCatalogCustomers;
  const missingFieldCount = useMemo(
    () => countMissingFields(activeTab, lines, customerReady),
    [activeTab, lines, customerReady]
  );
  const approvalLikely =
    riskHigh || Boolean(selectedCustomer.warningDisplay && selectedCustomer.warningDisplay !== "—");
  const openBalanceLabel =
    selectedCustomer.financeLinked === false
      ? "—"
      : selectedCustomer.receivableDisplay && selectedCustomer.receivableDisplay !== "—"
        ? `₺${selectedCustomer.receivableDisplay}`
        : "—";
  return (
    <div className="hz-qop-page hz-qop-page--v2 hz-qop-page--wb">
      {notice ? (
        <div className="hz-qop-notice hz-qop-notice--v2" role="status">
          <span>{notice}</span>
          {submitLinks.showApprovalsLink ? (
            <Link href={submitLinks.approvalsHref ?? "/onaylar"} className="hz-qop-inline-link">
              {MSG_SUBMIT_APPROVALS_HINT}
            </Link>
          ) : null}
          {submitLinks.detailHref ? (
            <Link href={submitLinks.detailHref} className="hz-qop-inline-link">
              {submitLinks.detailLabel ?? "Detaya git"}
            </Link>
          ) : null}
          <button type="button" className="hz-qop-notice-dismiss" onClick={() => setNotice(null)}>
            Kapat
          </button>
        </div>
      ) : null}

      {customersLoadError ? (
        <p className="hz-qop-notice hz-qop-notice--v2" role="alert">
          {customersLoadError}
        </p>
      ) : null}

      {!customersLoading && !hasCatalogCustomers && !customersLoadError ? (
        <>
          <p className="hz-qop-notice hz-qop-notice--v2" role="status">
            {MSG_CUSTOMERS_REQUIRED}
          </p>
          <p className="hz-qop-notice hz-qop-notice--v2" role="status">
            {MSG_CUSTOMERS_EMPTY}{" "}
            <Link href="/cariler" className="hz-qop-inline-link">
              Cariler
            </Link>
            {" · "}
            <Link href="/cariler/yeni" className="hz-qop-inline-link">
              Yeni cari
            </Link>
          </p>
        </>
      ) : null}

      <header className="hz-qop-wb-head hz-qop-wb-head--compact">
        <div className="hz-qop-wb-head-main">
          <h1 className="hz-sr-only">Hızlı İşlem</h1>
          <nav className="hz-qop-wb-segments" aria-label="İşlem türü">
            {WORKFLOW.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`hz-qop-wb-seg${activeTab === w.id ? " is-active" : ""}`}
                onClick={() => applyTab(w.id)}
              >
                {w.segment}
              </button>
            ))}
          </nav>
          <p className="hz-qop-wb-focus" title={tabFocusHint(activeTab)}>
            {tabFocusHint(activeTab)}
          </p>
        </div>
        <div className="hz-qop-wb-head-actions">
          <button type="button" className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm" onClick={() => pushToast(MSG_NOT_LIVE)}>
            <IconSave size={14} aria-hidden />
            Taslak
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
            onClick={() => pushToast(MSG_PREVIEW_DOCUMENT)}
            title="Belge önizle"
          >
            <IconPrinter size={14} aria-hidden />
            Önizle
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
            onClick={() => pushToast("Onay talebi taslağı hazırlandı. Sonuç yalnızca onay sonrasında gösterilir.")}
          >
            <IconSend size={14} aria-hidden />
            Onaya gönder
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--primary hz-qop-btn--sm"
            disabled={isSubmitting || isPreviewCustomerBlocked || workbenchLocked}
            onClick={handlePrimary}
          >
            {isSubmitting ? (
              "İşleniyor…"
            ) : (
              <>
                <QuickActionIcon kind={primaryIconKind(activeTab)} size={14} className="hz-qop-btn-ico-on-primary" />
                {primaryActionLabel(activeTab)}
              </>
            )}
          </button>
        </div>
      </header>

      <SplitContentLayout
        sideWidth="detail"
        main={
          <div className="hz-qop-main">
            <div className="hz-qop-main-surface hz-qop-main-surface--v2 hz-qop-wb-surface">
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

              <section className="hz-qop-wb-context" aria-label="Cari bağlamı">
                <label className="hz-qop-wb-context-cari">
                  <span className="hz-qop-label">Cari / Firma</span>
                  <select
                    className="hz-qop-input"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={workbenchLocked}
                  >
                    {customersLoading ? (
                      <option value="">Cariler yükleniyor…</option>
                    ) : !hasCatalogCustomers ? (
                      <option value="">Cari kaydı yok</option>
                    ) : (
                      catalogCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <span className={`hz-qop-wb-meta-pill${riskHigh ? " is-risk" : ""}`}>Risk: {riskLabel}</span>
                <span className="hz-qop-wb-meta-pill">Fiyat grubu: {selectedCustomer.priceGroup}</span>
                {selectedCustomer.whatsappMatched ? (
                  <span className="hz-qop-wb-meta-pill is-ok">WhatsApp eşleşti</span>
                ) : (
                  <span className="hz-qop-wb-meta-pill">WhatsApp: eşleşme yok</span>
                )}
                <span className="hz-qop-wb-meta-pill">Açık bakiye: {openBalanceLabel}</span>
                <span className="hz-qop-wb-meta-pill hz-qop-wb-meta-pill--date">{docDate} · Otomatik</span>
              </section>

              <div className="hz-qop-wb-table-head">
                <h2 className="hz-qop-wb-table-title">Ürün / hizmet tablosu</h2>
                <button type="button" className="hz-qop-add-row-btn" onClick={() => addEmptyLine()}>
                  <span className="hz-qop-add-row-ico" aria-hidden>
                    <IconPlusCircle size={14} />
                  </span>
                  Satır ekle
                </button>
              </div>

              <div ref={tableScrollRef} className="hz-qop-table-scroll hz-qop-table-scroll--v2 hz-qop-table-scroll--wb">
                <table className="hz-qop-table hz-qop-table--v2 hz-qop-table--wb">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Kod</th>
                      <th>Ürün / Hizmet</th>
                      <th>Birim</th>
                      <th>Miktar</th>
                      <th>Kaynak</th>
                      <th>Depo</th>
                      <th>Raf</th>
                      <th>Birim Fiyat</th>
                      <th>KDV</th>
                      <th>Tutar</th>
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
                          <td className="hz-qop-col-src">
                            <button
                              type="button"
                              className={`hz-qop-src-hit${expandedLineId === line.id ? " is-active" : ""}`}
                              title="Satır kaynağı"
                              aria-expanded={expandedLineId === line.id}
                              aria-controls={`qop-src-${line.id}`}
                              onClick={() => toggleSourceRow(line.id)}
                            >
                              <span className={sourceBadgeClass(line.sourceType)}>{sourceBadgeLabel(line)}</span>
                            </button>
                          </td>
                          <td>
                            <input
                              className="hz-qop-cell-input hz-qop-cell-ellipsis"
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
                          <td className="hz-qop-cell-num hz-qop-cell-kdv">%{line.taxRate}</td>
                          <td className="hz-qop-cell amt">₺{money(lineAmount(line))}</td>
                          <td className="hz-qop-col-act hz-qop-col-act--row">
                            <button
                              type="button"
                              className="hz-qop-icon-btn hz-qop-icon-btn--v2"
                              aria-label="Satırı sil"
                              title="Satırı sil"
                              onClick={() => removeLine(line.id)}
                            >
                              <IconTrash2 size={13} />
                            </button>
                          </td>
                        </tr>
                        {expandedLineId === line.id ? (
                          <tr className="hz-qop-source-row">
                            <td colSpan={TABLE_COL_COUNT} id={`qop-src-${line.id}`}>
                              <QuickOperationSourceAccordion line={line} onSelectSource={selectSource} />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <section className="hz-qop-wb-conditions hz-qop-wb-conditions--compact">
                <h2 className="hz-qop-wb-conditions-title">Açıklama ve koşullar</h2>
                <div className="hz-qop-wb-conditions-row">
                  <label className="hz-qop-field hz-qop-field--compact hz-qop-field--grow">
                    <span className="hz-qop-label">İşlem notu</span>
                    <input
                      className="hz-qop-input"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Kısa not"
                      maxLength={500}
                    />
                  </label>
                  <div className="hz-qop-wb-conditions-fields">
                    <label className="hz-qop-field hz-qop-field--compact">
                      <span className="hz-qop-label">Temsilci</span>
                      <input className="hz-qop-input" value={representative} onChange={(e) => setRepresentative(e.target.value)} />
                    </label>
                    <label className="hz-qop-field hz-qop-field--compact">
                      <span className="hz-qop-label">Depo</span>
                      <select className="hz-qop-input" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                        <option>Merkez Depo</option>
                        <option>Ana Depo</option>
                        <option>A Blok</option>
                      </select>
                    </label>
                    <label className="hz-qop-field hz-qop-field--compact hz-qop-field--date">
                      <span className="hz-qop-label">Vade</span>
                      <input className="hz-qop-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </label>
                    <label className="hz-qop-field hz-qop-field--compact hz-qop-field--date">
                      <span className="hz-qop-label">Teslim</span>
                      <input className="hz-qop-input" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                    </label>
                  </div>
                </div>
              </section>
            </div>

            <footer className="hz-qop-wb-dock hz-qop-wb-dock--compact" aria-label="Fiş özeti ve aksiyonlar">
              <div className="hz-qop-wb-dock-left" role="status">
                <span className="hz-qop-wb-dock-chip">Satır: {lines.length}</span>
                <span className={`hz-qop-wb-dock-chip${missingFieldCount > 0 ? " is-warn" : ""}`}>
                  Eksik: {missingFieldCount}
                </span>
                <span className={`hz-qop-wb-dock-chip${approvalLikely ? " is-warn" : ""}`}>
                  Onay: {approvalLikely ? "Gerekebilir" : "Gerekmez"}
                </span>
              </div>
              <div className="hz-qop-wb-dock-mid" aria-label="Toplamlar">
                <span>
                  Ara toplam <strong>₺{money(totals.subtotal)}</strong>
                </span>
                <span>
                  KDV <strong>₺{money(totals.taxTotal)}</strong>
                </span>
                <span className="hz-qop-wb-dock-net">
                  Net <strong>₺{money(totals.grandTotal)}</strong>
                </span>
              </div>
              <div className="hz-qop-wb-dock-right">
                <button type="button" className="hz-qop-btn hz-qop-btn--ghost hz-qop-btn--sm" onClick={() => pushToast(MSG_NOT_LIVE)}>
                  Taslak
                </button>
                <button
                  type="button"
                  className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
                  onClick={() => pushToast(MSG_PREVIEW_DOCUMENT)}
                >
                  Önizle
                </button>
                <button
                  type="button"
                  className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
                  onClick={() => pushToast("Onay talebi taslağı hazırlandı. Sonuç yalnızca onay sonrasında gösterilir.")}
                >
                  Onaya Gönder
                </button>
                <button
                  type="button"
                  className="hz-qop-btn hz-qop-btn--primary hz-qop-btn--sm"
                  disabled={isSubmitting || isPreviewCustomerBlocked || workbenchLocked}
                  onClick={handlePrimary}
                >
                  {isSubmitting ? "İşleniyor…" : primaryActionLabel(activeTab)}
                </button>
              </div>
              <p className="hz-sr-only">Gerçek kayıt için onay ve işlem kuyruğu bağlantısı gerekir.</p>
            </footer>
          </div>
        }
        side={
          <QuickOperationWorkbenchSide
            activeTab={activeTab}
            workflowTitle={activeWorkflow?.title ?? "—"}
            selectedCustomer={selectedCustomer}
            riskLabel={riskLabel}
            riskHigh={riskHigh}
            totals={totals}
            impacts={impacts}
            aiInsight={aiInsight}
            nextStepText={nextStepText(activeTab, lines.length > 0)}
            approvalLikely={approvalLikely}
          />
        }
      />
    </div>
  );
}
