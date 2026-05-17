"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SplitContentLayout } from "@hallederiz/ui";
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
import {
  MSG_DRAFT_SAVED,
  MSG_NOT_LIVE,
  MSG_PREVIEW_CUSTOMER,
  MSG_SELECT_CUSTOMER,
  MSG_SELECT_LINE
} from "../data/quick-operation-messages";
import { isQuickOpPreviewProductId } from "../data/quick-operation-guards";
import { seedQuickOperationLines, useQuickOperationState } from "../hooks/use-quick-operation-state";
import type { QuickOperationLine, QuickOperationSourceType, QuickOperationType } from "../types";
import { QuickOperationSourceAccordion } from "./QuickOperationSourceAccordion";
import { QuickOperationWorkbenchSide } from "./QuickOperationWorkbenchSide";

const UNIT_OPTIONS = ["Adet", "Paket", "TakÄ±m", "Kutu", "Hizmet", "Metre"];

export type WorkflowTabId = "order" | "price" | "payment" | "delivery" | "document" | "return";

const WORKFLOW: Array<{
  id: WorkflowTabId;
  segment: string;
  title: string;
  hint: string;
  operation: QuickOperationType;
  icon: QuickBubbleKind;
}> = [
  { id: "price", segment: "Teklif", title: "Fiyat / Teklif", hint: "Teklif, fiyatlandÄ±rma ve belge taslaÄŸÄ±.", operation: "offer", icon: "price" },
  { id: "order", segment: "SipariÅŸ", title: "SipariÅŸ al", hint: "Stok, depo, kaynak ve onay etkisi.", operation: "sale_order", icon: "order" },
  { id: "delivery", segment: "Teslim", title: "ÃœrÃ¼n teslim et", hint: "HazÄ±r depo fiÅŸi ve teslim tarihi.", operation: "delivery", icon: "stock" },
  { id: "payment", segment: "Tahsilat", title: "Tahsilat gir", hint: "Cari, tutar, Ã¶deme ve aÃ§Ä±k bakiye.", operation: "payment", icon: "pay" },
  { id: "return", segment: "Ä°ade", title: "Ä°ade / sorun", hint: "Ä°ade nedeni, ilgili kayÄ±t ve onay.", operation: "return", icon: "return" },
  { id: "document", segment: "Belge", title: "Belge gÃ¶nder", hint: "Belge Ã§Ä±kÄ±ÅŸÄ± ve kanal iletimi.", operation: "delivery", icon: "doc" }
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
  if (line.sourceLabel && line.sourceLabel !== "â€”") return line.sourceLabel;
  switch (line.sourceType) {
    case "center_warehouse":
      return "Merkez";
    case "factory":
      return "Fabrika";
    case "supplier":
      return "Tedarik";
    case "split":
      return "Split";
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
      return "FiyatlandÄ±rma, belge ve WhatsApp taslaÄŸÄ± odaklÄ± iÅŸlem.";
    case "order":
      return "Stok, depo kaynaÄŸÄ± ve sipariÅŸ onay etkisi odaklÄ± iÅŸlem.";
    case "delivery":
      return "HazÄ±r depo fiÅŸi ve teslim tarihi odaklÄ± iÅŸlem.";
    case "payment":
      return "Cari bakiye, tahsilat tutarÄ± ve Ã¶deme eÅŸleÅŸmesi odaklÄ± iÅŸlem.";
    case "return":
      return "Ä°ade nedeni ve onay deÄŸerlendirmesi odaklÄ± iÅŸlem.";
    case "document":
      return "Belge Ã¶nizleme ve kanal iletimi odaklÄ± iÅŸlem.";
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
  { id: "prep-1", label: "DH-2026-0142 Â· Delta A.Å. Â· HazÄ±rlandÄ±" },
  { id: "prep-2", label: "DH-2026-0151 Â· Nova GÄ±da Â· HazÄ±rlandÄ±" }
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
      return "SipariÅŸ";
    case "payment":
      return "Tahsilat";
    case "offer":
      return "Teklif";
    case "delivery":
      return "Teslim / belge";
    case "return":
      return "Ä°ade";
    default:
      return type;
  }
}

function primaryActionLabel(tab: WorkflowTabId): string {
  switch (tab) {
    case "order":
      return "SipariÅŸi oluÅŸtur";
    case "payment":
      return "TahsilatÄ± kaydet";
    case "price":
      return "Teklifi oluÅŸtur";
    case "delivery":
      return "Teslimi baÅŸlat";
    case "document":
      return "Belgeyi gÃ¶nder";
    case "return":
      return "Ä°ade Talebini OluÅŸtur";
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
      ? "Teslimi kaydedince fiÅŸ Depo HazÄ±rlÄ±k listesinden dÃ¼ÅŸer; belge arÅŸive gider."
      : "Ã–nce hazÄ±r depo fiÅŸini seÃ§in veya satÄ±r ekleyin.";
  }
  if (tab === "document") {
    return hasLines ? "GÃ¶nderim Ã¶ncesi belge Ã¶nizlemesini kontrol edin." : "Belge ve cari seÃ§imini tamamlayÄ±n.";
  }
  if (tab === "payment") {
    return "Tahsilat tutarÄ± ve cari eÅŸleÅŸmesini doÄŸrulayÄ±n.";
  }
  if (tab === "return") {
    return "Ä°ade nedeni ve satÄ±rlar onayda deÄŸerlendirilir.";
  }
  return hasLines ? "KayÄ±t sonrasÄ± ilgili modÃ¼lde takip edin." : "SatÄ±r ekleyin veya Ã¼rÃ¼n seÃ§in.";
}

export function QuickOperationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerParam = searchParams.get("customer");
  const productParam = searchParams.get("product");
  const { pushToast } = useToast();
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<WorkflowTabId>("order");
  const [representative, setRepresentative] = useState("AyÅŸe Kaya");
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
      pushToast("Bu urun onizleme verisidir; satira eklenmez.");
      return;
    }
    applyProductFromUrl(productParam);
  }, [applyProductFromUrl, productParam, pushToast]);

  useEffect(() => {
    if (initialCustomerParam && !initialCustomerResolved) {
      setNotice(
        `Cari (${initialCustomerParam}) listede bulunamadi. Mevcut cari secildi veya API baglantisi eksik.`
      );
    }
  }, [initialCustomerParam, initialCustomerResolved, setNotice]);

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
      replaceLines(defaultLinesForTab(tab));
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
    const ok = await submitOperation();
    if (ok) {
      pushToast(dataSourceConfig.useDemoData ? MSG_DRAFT_SAVED : "Islem kaydi alindi. Onay zinciri tamamlandiginda uygulanir.");
    }
  };

  const handleNewOperation = () => {
    resetDraft();
    setDescription("");
    setRepresentative("AyÅŸe Kaya");
    setWarehouse("Merkez Depo");
    setDueDate("15.05.2026");
    setDeliveryDate("08.05.2026");
    applyTab("order");
    pushToast("Yeni islem baslatildi");
  };

  const handleClear = () => {
    resetDraft();
    setDescription("");
    applyTab(activeTab);
    pushToast("Taslak temizlendi");
  };

  const loadPrepLines = () => {
    if (!prepSlipId) {
      pushToast("Ã–nce hazÄ±r fiÅŸ seÃ§in");
      return;
    }
    const next = prepLines(prepSlipId);
    replaceLines(next);
    pushToast("FiÅŸ satÄ±rlarÄ± yÃ¼klendi");
  };

  const toggleSourceRow = useCallback(
    (lineId: string) => {
      setExpandedLineId((current) => (current === lineId ? null : lineId));
    },
    [setExpandedLineId]
  );

  const riskHigh = selectedCustomer.risk === "Yuksek";
  const riskLabel = riskHigh ? "YÃ¼ksek" : selectedCustomer.risk === "Orta" ? "Orta" : "DÃ¼ÅŸÃ¼k";
  const activeWorkflow = WORKFLOW.find((w) => w.id === activeTab);
  const customerReady = Boolean(customerId && catalogCustomers.length > 0);
  const missingFieldCount = useMemo(
    () => countMissingFields(activeTab, lines, customerReady),
    [activeTab, lines, customerReady]
  );
  const approvalLikely =
    riskHigh || Boolean(selectedCustomer.warningDisplay && selectedCustomer.warningDisplay !== "â€”");
  const openBalanceLabel =
    selectedCustomer.financeLinked === false
      ? "â€”"
      : selectedCustomer.receivableDisplay && selectedCustomer.receivableDisplay !== "â€”"
        ? `â‚º${selectedCustomer.receivableDisplay}`
        : "â€”";
  const previewBandText = dataSourceConfig.useDemoData
    ? "Ã–nizleme verisiyle Ã§alÄ±ÅŸÄ±yorsunuz. Bu ekranda gerÃ§ek kayÄ±t oluÅŸturulmaz; onay ve iÅŸlem kuyruÄŸu baÄŸlandÄ±ÄŸÄ±nda canlÄ± kayÄ±t aÃ§Ä±lÄ±r."
    : "CanlÄ± kayÄ±t baÄŸlantÄ±sÄ± aktif. SonuÃ§ onay ve kural kontrolÃ¼nden geÃ§er.";

  return (
    <div className="hz-qop-page hz-qop-page--v2 hz-qop-page--wb">
      {notice ? (
        <div className="hz-qop-notice hz-qop-notice--v2" role="status">
          <span>{notice}</span>
          <button type="button" className="hz-qop-notice-dismiss" onClick={() => setNotice(null)}>
            Kapat
          </button>
        </div>
      ) : null}

      <div className="hz-qop-wb-band" role="status">
        {previewBandText}
        {isPreviewCustomer ? " SeÃ§ili cari Ã¶nizleme verisidir; kayÄ±t oluÅŸturulmaz." : null}
      </div>

      <header className="hz-qop-wb-head">
        <div className="hz-qop-wb-head-main">
          <div className="hz-qop-wb-title-row">
            <h1 className="hz-qop-wb-title">HÄ±zlÄ± Ä°ÅŸlem</h1>
            {dataSourceConfig.useDemoData ? <span className="hz-qop-wb-badge">Ä°ÅŸlem Ã¶nizlemesi</span> : null}
          </div>
          <p className="hz-qop-wb-sub">Teklif, sipariÅŸ, teslim, tahsilat ve iade iÅŸlemlerini tek fiÅŸten baÅŸlatÄ±n.</p>
          <nav className="hz-qop-wb-segments" aria-label="Ä°ÅŸlem tÃ¼rÃ¼">
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
          <p className="hz-qop-wb-focus">{tabFocusHint(activeTab)}</p>
        </div>
        <div className="hz-qop-wb-head-actions">
          <button type="button" className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm" onClick={() => pushToast(MSG_NOT_LIVE)}>
            <IconSave size={15} aria-hidden />
            Taslak Kaydet
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
            onClick={() => pushToast("Onizleme hazirlaniyor. Bu adimda canli gonderim yapilmaz.")}
          >
            <IconPrinter size={15} aria-hidden />
            Belge Ã–nizle
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
            onClick={() => pushToast("Onay talebi taslagi hazirlandi. Sonuc yalnizca onay sonrasinda gosterilir.")}
          >
            <IconSend size={15} aria-hidden />
            Onaya GÃ¶nder
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--primary hz-qop-btn--sm"
            disabled={isSubmitting || isPreviewCustomerBlocked || catalogCustomers.length === 0}
            onClick={handlePrimary}
          >
            {isSubmitting ? (
              "Ä°ÅŸleniyorâ€¦"
            ) : (
              <>
                <QuickActionIcon kind={primaryIconKind(activeTab)} size={16} className="hz-qop-btn-ico-on-primary" />
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
              <h1 className="hz-sr-only">HÄ±zlÄ± Ä°ÅŸlem</h1>


              {activeTab === "delivery" ? (
                <section className="hz-qop-delivery-band" aria-label="Depo hazÄ±rlÄ±k baÄŸlantÄ±sÄ±">
                  <p className="hz-qop-delivery-lead">
                    HazÄ±rlandÄ± durumundaki Depo HazÄ±rlÄ±k fiÅŸlerinden teslim baÅŸlatÄ±n. FiÅŸ{" "}
                    <a href="/depo" className="hz-qop-inline-link">
                      Depo HazÄ±rlÄ±k
                    </a>{" "}
                    ekranÄ±nda tamamlanÄ±r; teslim sonrasÄ± fiÅŸ listeden Ã§Ä±kar ve belge arÅŸivlenir.
                  </p>
                  <div className="hz-qop-delivery-row">
                    <label className="hz-qop-field">
                      <span className="hz-qop-label">HazÄ±r fiÅŸ</span>
                      <select className="hz-qop-input" value={prepSlipId} onChange={(e) => setPrepSlipId(e.target.value)}>
                        <option value="">SeÃ§inâ€¦</option>
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
                        placeholder="Araâ€¦"
                        autoComplete="off"
                      />
                    </label>
                    <button type="button" className="hz-qop-btn hz-qop-btn--secondary" onClick={loadPrepLines}>
                      SatÄ±rlarÄ± yÃ¼kle
                    </button>
                  </div>
                </section>
              ) : null}

              <section className="hz-qop-wb-context" aria-label="Cari baÄŸlamÄ±">
                <label className="hz-qop-wb-context-cari">
                  <span className="hz-qop-label">Cari / Firma</span>
                  <select
                    className="hz-qop-input"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={catalogCustomers.length === 0}
                  >
                    {catalogCustomers.length === 0 ? (
                      <option value="">Cari listesi baÄŸlÄ± deÄŸil</option>
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
                  <span className="hz-qop-wb-meta-pill is-ok">WhatsApp eÅŸleÅŸti</span>
                ) : (
                  <span className="hz-qop-wb-meta-pill">WhatsApp: eÅŸleÅŸme yok</span>
                )}
                <span className="hz-qop-wb-meta-pill">AÃ§Ä±k bakiye: {openBalanceLabel}</span>
                <span className="hz-qop-wb-meta-pill hz-qop-wb-meta-pill--date">{docDate} Â· Otomatik</span>
              </section>

              <div className="hz-qop-wb-table-head">
                <h2 className="hz-qop-wb-table-title">ÃœrÃ¼n / Hizmet FiÅŸ Tablosu</h2>
                <button type="button" className="hz-qop-btn hz-qop-btn--secondary hz-qop-btn--sm" onClick={() => addEmptyLine()}>
                  <span className="hz-qop-add-row-ico" aria-hidden>
                    <IconPlusCircle size={16} />
                  </span>
                  SatÄ±r ekle
                </button>
              </div>

              <div ref={tableScrollRef} className="hz-qop-table-scroll hz-qop-table-scroll--v2 hz-qop-table-scroll--wb">
                <table className="hz-qop-table hz-qop-table--v2 hz-qop-table--wb">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Kod</th>
                      <th>ÃœrÃ¼n / Hizmet</th>
                      <th>Birim</th>
                      <th>Miktar</th>
                      <th>Kaynak</th>
                      <th>Depo</th>
                      <th>Raf</th>
                      <th>Birim Fiyat</th>
                      <th>KDV</th>
                      <th>Tutar</th>
                      <th className="hz-qop-col-act">Ä°ÅŸlem</th>
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
                              placeholder="ÃœrÃ¼n araâ€¦"
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
                              <option value="">â€”</option>
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
                              title="SatÄ±r kaynaÄŸÄ±"
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
                          <td className="hz-qop-cell amt">â‚º{money(lineAmount(line))}</td>
                          <td className="hz-qop-col-act hz-qop-col-act--row">
                            <button
                              type="button"
                              className="hz-qop-icon-btn hz-qop-icon-btn--v2"
                              aria-label="SatÄ±rÄ± sil"
                              title="SatÄ±rÄ± sil"
                              onClick={() => removeLine(line.id)}
                            >
                              <IconTrash2 size={15} />
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

              <section className="hz-qop-wb-conditions">
                <h2 className="hz-qop-wb-conditions-title">AÃ§Ä±klama ve koÅŸullar</h2>
                <div className="hz-qop-wb-conditions-grid">
                  <label className="hz-qop-field hz-qop-field--grow">
                    <span className="hz-qop-label">Ä°ÅŸlem notu</span>
                    <textarea
                      className="hz-qop-note-textarea hz-qop-note-textarea--inline"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="KÄ±sa notâ€¦"
                      rows={2}
                      maxLength={500}
                    />
                  </label>
                  <div className="hz-qop-more-grid hz-qop-more-grid--wb">
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
                <p className="hz-qop-wb-conditions-meta">
                  SatÄ±ÅŸ temsilcisi: <strong>{representative}</strong> Â· <strong>{warehouse}</strong> Â· Vade{" "}
                  <strong>{dueDate}</strong>
                </p>
              </section>
            </div>
          </div>
        }
        side={
          <QuickOperationWorkbenchSide
            activeTab={activeTab}
            workflowTitle={activeWorkflow?.title ?? "â€”"}
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

      <footer className="hz-qop-wb-dock" aria-label="FiÅŸ Ã¶zeti ve aksiyonlar">
        <div className="hz-qop-wb-dock-left">
          <span>SatÄ±r: {lines.length}</span>
          <span className={missingFieldCount > 0 ? "is-warn" : ""}>Eksik alan: {missingFieldCount}</span>
          <span className={approvalLikely ? "is-warn" : ""}>Onay: {approvalLikely ? "Gerekebilir" : "Gerekmez"}</span>
          <p className="hz-qop-wb-dock-hint">GerÃ§ek kayÄ±t iÃ§in onay ve iÅŸlem kuyruÄŸu baÄŸlantÄ±sÄ± gerekir.</p>
        </div>
        <div className="hz-qop-wb-dock-mid">
          <span>
            Ara toplam <strong>â‚º{money(totals.subtotal)}</strong>
          </span>
          <span>
            KDV <strong>â‚º{money(totals.taxTotal)}</strong>
          </span>
          <span className="hz-qop-wb-dock-net">
            Net <strong>â‚º{money(totals.grandTotal)}</strong>
          </span>
        </div>
        <div className="hz-qop-wb-dock-right">
          <button type="button" className="hz-qop-btn hz-qop-btn--ghost hz-qop-btn--sm" onClick={() => pushToast(MSG_NOT_LIVE)}>
            Taslak
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
            onClick={() => pushToast("Onizleme hazirlaniyor. Bu adimda canli gonderim yapilmaz.")}
          >
            Ã–nizle
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--outline hz-qop-btn--sm"
            onClick={() => pushToast("Onay talebi taslagi hazirlandi. Sonuc yalnizca onay sonrasinda gosterilir.")}
          >
            Onaya GÃ¶nder
          </button>
          <button
            type="button"
            className="hz-qop-btn hz-qop-btn--primary hz-qop-btn--sm"
            disabled={isSubmitting || isPreviewCustomerBlocked || catalogCustomers.length === 0}
            onClick={handlePrimary}
          >
            {isSubmitting ? "Ä°ÅŸleniyorâ€¦" : primaryActionLabel(activeTab)}
          </button>
        </div>
      </footer>
    </div>
  );
}
