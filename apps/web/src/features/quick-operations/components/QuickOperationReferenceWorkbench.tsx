"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { QuickOperationType } from "@hallederiz/types";
import { useToast } from "../../../providers/toast-provider";
import { dataSourceConfig } from "../../../lib/data-source";
import { getDashboardHomeSnapshot } from "../../dashboard/queries/get-dashboard-home-snapshot";
import { getDashboardLiveSnapshot } from "../../dashboard/queries/get-dashboard-live-snapshot";
import { EMPTY_DASHBOARD_HOME_SNAPSHOT, type DashboardHomeSnapshot } from "../../dashboard/utils/build-dashboard-home-snapshot";
import {
  MSG_CUSTOMERS_EMPTY,
  MSG_CUSTOMERS_REQUIRED,
  MSG_PREVIEW_CUSTOMER,
  MSG_SELECT_CUSTOMER,
  MSG_SELECT_LINE
} from "../data/quick-operation-messages";
import { mapSnapshotToSalesRecent } from "../data/quick-operation-recent-data";
import {
  defaultQuickOperationLinesForTab,
  demoProducts,
  operationTypeLabels,
  type QuickOperationWorkflowTabId,
  useQuickOperationState
} from "../hooks/use-quick-operation-state";
import { useQuickOperationDeeplinkPrefill } from "../hooks/use-quick-operation-deeplink-prefill";
import { isReturnWindowExpired } from "../utils/quick-operation-return-guard";
import type { QuickOperationLine } from "../types";
import { QuickOperationPaymentBlock } from "./QuickOperationPaymentBlock";

export type QuickOperationReferenceTabInput = "order" | "offer" | "price" | "payment" | "delivery" | "return";

type ReferenceTab = "order" | "price" | "payment" | "delivery" | "return";
type RightPanelMode = "operation" | "find_sale";

type FoundSale = {
  id: string;
  saleNo: string;
  customerName: string;
  date: string;
  amount: string;
  status: string;
  summary: string;
};

const UNIT_OPTIONS = ["Adet", "Paket", "Takım", "Kutu", "Hizmet", "Metre"];

const PREP_SLIPS: Array<{ id: string; label: string }> = [
  { id: "prep-1", label: "DH-2026-0142 · Delta A.Ş. · Hazırlandı" },
  { id: "prep-2", label: "DH-2026-0151 · Nova Gıda · Hazırlandı" }
];

const FOUND_SALES: FoundSale[] = [
  {
    id: "sale-0187",
    saleNo: "SIP-2025-0187",
    customerName: "ABC İnşaat A.Ş.",
    date: "06.05.2025",
    amount: "₺34.560,00",
    status: "Kısmi Teslim · Kısmi Tahsilat",
    summary: "5 ürün · 52 toplam miktar"
  },
  {
    id: "sale-0172",
    saleNo: "SIP-2025-0172",
    customerName: "ABC İnşaat A.Ş.",
    date: "02.05.2025",
    amount: "₺18.240,00",
    status: "Ödendi · Tam Teslim",
    summary: "3 ürün · teslim tamamlandı"
  },
  {
    id: "sale-0156",
    saleNo: "SIP-2025-0156",
    customerName: "ABC İnşaat A.Ş.",
    date: "28.04.2025",
    amount: "₺27.135,00",
    status: "Kısmi Teslim · Kısmi Tahsilat",
    summary: "4 ürün · sevk bekliyor"
  },
  {
    id: "sale-0138",
    saleNo: "SIP-2025-0138",
    customerName: "ABC İnşaat A.Ş.",
    date: "22.04.2025",
    amount: "₺12.875,00",
    status: "Fabrika Bekliyor",
    summary: "2 ürün · fabrika karşılayacak"
  },
  {
    id: "sale-0121",
    saleNo: "SIP-2025-0121",
    customerName: "ABC İnşaat A.Ş.",
    date: "15.04.2025",
    amount: "₺43.900,00",
    status: "Ödendi · Tam Teslim",
    summary: "8 ürün · kapanmış satış"
  }
];

const TAB_OPERATION: Record<ReferenceTab, QuickOperationType> = {
  order: "sale_order",
  price: "offer",
  payment: "payment",
  delivery: "delivery",
  return: "return"
};

function normalizeTab(input?: QuickOperationReferenceTabInput | null): ReferenceTab {
  if (input === "offer") return "price";
  if (input === "order" || input === "price" || input === "payment" || input === "delivery" || input === "return") {
    return input;
  }
  return "order";
}

function resolveInitialTab(
  tabParam: string | null,
  initialTab?: QuickOperationReferenceTabInput,
  offerParam?: string | null
): ReferenceTab {
  if (offerParam?.trim()) {
    return "order";
  }
  return normalizeTab((tabParam as QuickOperationReferenceTabInput | null) ?? initialTab ?? "order");
}

function money(value: number): string {
  return `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function lineTotal(line: QuickOperationLine): number {
  return Math.round(line.quantity * line.unitPrice * (1 + line.taxRate / 100) * 100) / 100;
}

function statusClass(status: string): string {
  if (status === "Onayda") return "hism-badge hism-badge--pending";
  if (status === "Onaylandı" || status === "Taslak" || status === "Tamamlandı" || status === "Tahsilat Yapıldı") {
    return "hism-badge hism-badge--ok";
  }
  if (status === "Kısmi Teslim") return "hism-badge hism-badge--info";
  if (status === "İade Alındı") return "hism-badge hism-badge--purple";
  return "hism-badge";
}

function sourceTone(source?: string): string {
  const value = (source ?? "").toLocaleLowerCase("tr-TR");
  if (value.includes("fabrika")) return "hism-source-dot hism-source-dot--factory";
  if (value.includes("tedarik")) return "hism-source-dot hism-source-dot--supplier";
  if (value.includes("split")) return "hism-source-dot hism-source-dot--split";
  return "hism-source-dot";
}

function stopUiEvent(event?: MouseEvent<HTMLElement>) {
  event?.preventDefault();
  event?.stopPropagation();
}

export interface QuickOperationReferenceWorkbenchProps {
  initialTab?: QuickOperationReferenceTabInput;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function QuickOperationReferenceWorkbench({
  initialTab,
  pageTitle,
  pageSubtitle
}: QuickOperationReferenceWorkbenchProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const customerParam = searchParams.get("customer");
  const productParam = searchParams.get("product");
  const orderParam = searchParams.get("order");
  const offerParam = searchParams.get("offer");
  const { pushToast } = useToast();

  const prefillSnapshot = useMemo(
    () => ({
      tab: tabParam,
      customer: customerParam,
      order: orderParam,
      offer: offerParam,
      product: productParam
    }),
    // Mount snapshot — URL param effect kullanıcı state'ini ezmesin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const resolvedInitialTab = resolveInitialTab(tabParam, initialTab, offerParam);

  const [activeTab, setActiveTab] = useState<ReferenceTab>(resolvedInitialTab);
  const [description, setDescription] = useState("Projeye yönelik malzeme tedariği.");
  const [dueDate, setDueDate] = useState("09.05.2025");
  const [prepSlipId, setPrepSlipId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [completedAction, setCompletedAction] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<DashboardHomeSnapshot>(EMPTY_DASHBOARD_HOME_SNAPSHOT);
  const [recentLoading, setRecentLoading] = useState(true);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("operation");
  const [findSaleQuery, setFindSaleQuery] = useState("");
  const [selectedSaleContext, setSelectedSaleContext] = useState<FoundSale | null>(null);
  const [returnWarningSale, setReturnWarningSale] = useState<FoundSale | null>(null);
  const [returnOverrideAccepted, setReturnOverrideAccepted] = useState(false);
  const appliedInitialTabRef = useRef<ReferenceTab | null>(null);
  const userEditedRef = useRef(false);
  const [tabBootstrapComplete, setTabBootstrapComplete] = useState(false);

  const markUserEdited = useCallback(() => {
    userEditedRef.current = true;
  }, []);

  const {
    catalogCustomers,
    setOperationType,
    customerId,
    setCustomerId,
    selectedCustomer,
    isPreviewCustomerBlocked,
    customersLoading,
    customersLoadError,
    hasCatalogCustomers,
    lines,
    totals,
    notice,
    setNotice,
    submitLinks,
    expandedLineId,
    setExpandedLineId,
    removeLine,
    replaceLines,
    updateLine,
    addEmptyLine,
    selectProduct,
    submitOperation,
    isSubmitting,
    setOperationNote,
    paymentForm,
    patchPaymentForm,
    linkedOrderId,
    setLinkedOrderId
  } = useQuickOperationState({
    initialCustomerId: customerParam,
    initialProductId: productParam,
    initialOrderId: orderParam,
    userEditedRef
  });

  const { offerContext, orderContext } = useQuickOperationDeeplinkPrefill({
    snapshot: prefillSnapshot,
    tabBootstrapComplete,
    customersLoading,
    catalogCustomers,
    userEditedRef,
    setCustomerId,
    setLinkedOrderId,
    replaceLines,
    setOperationType,
    setNotice,
    patchPaymentForm,
    setProductSearch,
    activeTab
  });

  const applyInitialTab = (tab: ReferenceTab) => {
    setActiveTab(tab);
    const workflowTab = tab as QuickOperationWorkflowTabId;
    setOperationType(TAB_OPERATION[tab]);
    replaceLines(defaultQuickOperationLinesForTab(workflowTab));
    setCompletedAction(null);
    setPrepSlipId("");
    setReturnWarningSale(null);
    setReturnOverrideAccepted(false);
  };

  useEffect(() => {
    if (appliedInitialTabRef.current === resolvedInitialTab) {
      setTabBootstrapComplete(true);
      return;
    }
    appliedInitialTabRef.current = resolvedInitialTab;
    applyInitialTab(resolvedInitialTab);
    setTabBootstrapComplete(true);
    if (rightPanelMode !== "find_sale") {
      setRightPanelMode("operation");
    }
    // Tab bootstrap yalnızca URL/prop tab değişince; prefill ayrı effect'te.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedInitialTab]);

  useEffect(() => {
    setOperationNote(description);
  }, [description, setOperationNote]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setRecentLoading(true);
      try {
        const loader = dataSourceConfig.useDemoData ? getDashboardHomeSnapshot() : getDashboardLiveSnapshot();
        const snap = await loader;
        if (!active) return;
        setSnapshot(snap);
      } catch {
        if (!active) return;
        setSnapshot(EMPTY_DASHBOARD_HOME_SNAPSHOT);
      } finally {
        if (active) setRecentLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const recentItems = useMemo(() => mapSnapshotToSalesRecent(snapshot, 5), [snapshot]);

  const meta = useMemo(() => {
    const operation = TAB_OPERATION[activeTab];
    const fallback = operationTypeLabels[operation];
    return {
      title: pageTitle ?? "Hızlı İşlem Masası",
      subtitle: pageSubtitle ?? fallback.description ?? "Satış, tahsilat, teslim ve iade işlemleri."
    };
  }, [activeTab, pageSubtitle, pageTitle]);

  const showProductTable = activeTab === "order" || activeTab === "price";
  const hasProductLine = useMemo(
    () => lines.some((line) => line.productCode.trim() || line.productName.trim()),
    [lines]
  );
  const paymentReady = paymentForm.enabled && paymentForm.amount > 0;
  const workbenchLocked = customersLoading || !hasCatalogCustomers;
  const totalQty = useMemo(
    () => lines.reduce((sum, line) => sum + (Number.isFinite(line.quantity) ? line.quantity : 0), 0),
    [lines]
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLocaleLowerCase("tr-TR");
    if (!q) return demoProducts;
    return demoProducts.filter(
      (product) =>
        product.code.toLocaleLowerCase("tr-TR").includes(q) ||
        product.name.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [productSearch]);

  const filteredFoundSales = useMemo(() => {
    const q = findSaleQuery.trim().toLocaleLowerCase("tr-TR");
    if (!q) return FOUND_SALES;
    return FOUND_SALES.filter((sale) =>
      [sale.saleNo, sale.customerName, sale.date, sale.amount, sale.status, sale.summary]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(q)
    );
  }, [findSaleQuery]);

  const validateCustomerReady = () => {
    if (isPreviewCustomerBlocked) {
      pushToast(MSG_PREVIEW_CUSTOMER);
      return false;
    }
    if (customersLoading) return false;
    if (!hasCatalogCustomers) {
      pushToast(MSG_CUSTOMERS_REQUIRED);
      return false;
    }
    if (!customerId || catalogCustomers.length === 0) {
      pushToast(MSG_SELECT_CUSTOMER);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (activeTab === "delivery" && !selectedSaleContext && !orderContext) {
      pushToast("Teslim işlemi için önce gerçekleşmiş satış veya sipariş seçilmelidir.");
      return;
    }

    if (activeTab === "return" && !selectedSaleContext && !orderContext) {
      pushToast("İade işlemi için önce gerçekleşmiş satış veya sipariş seçilmelidir.");
      return;
    }

    if (
      activeTab === "return" &&
      orderContext &&
      isReturnWindowExpired(orderContext.dateDisplay) &&
      !returnOverrideAccepted
    ) {
      setReturnWarningSale({
        id: orderContext.orderId,
        saleNo: orderContext.orderNo,
        customerName: orderContext.customerName,
        date: orderContext.dateDisplay,
        amount: orderContext.amountDisplay,
        status: "Bağlı sipariş",
        summary: "Deep link sipariş bağlamı"
      });
      return;
    }

    if (
      activeTab === "return" &&
      selectedSaleContext &&
      isReturnWindowExpired(selectedSaleContext.date) &&
      !returnOverrideAccepted
    ) {
      setReturnWarningSale(selectedSaleContext);
      return;
    }

    if (selectedSaleContext && activeTab === "order") {
      pushToast("Bu veri gerçekleşmiş satıştan yüklendi. Yeni satış olarak tekrar kaydedilemez.");
      return;
    }

    if (!validateCustomerReady()) return;

    if ((activeTab === "order" || activeTab === "price") && !hasProductLine) {
      pushToast(MSG_SELECT_LINE);
      return;
    }

    if (activeTab === "payment" && !paymentReady) {
      pushToast("Tahsilat için ödeme alanını açıp tahsilat tutarı girin.");
      return;
    }

    const operation = TAB_OPERATION[activeTab];
    setOperationType(operation);
    const outcome = await submitOperation(operation);
    if (outcome.ok && outcome.toast) {
      pushToast(outcome.toast);
      setCompletedAction(operation);
    }
  };

  const handleClearLines = (event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    markUserEdited();
    replaceLines(defaultQuickOperationLinesForTab(activeTab as QuickOperationWorkflowTabId));
    setSelectedSaleContext(null);
    setReturnWarningSale(null);
    setReturnOverrideAccepted(false);
    pushToast("Tablo temizlendi");
  };

  const openFindSalePanel = (event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    setRightPanelMode("find_sale");
  };

  const closeFindSalePanel = (event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    setRightPanelMode("operation");
  };

  const handleAddProductLine = (event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    markUserEdited();
    addEmptyLine();
  };

  const handleUpdateLine = (lineId: string, patch: Partial<QuickOperationLine>) => {
    markUserEdited();
    updateLine(lineId, patch);
  };

  const handleSelectProduct = (lineId: string, productCode: string) => {
    markUserEdited();
    selectProduct(lineId, productCode);
  };

  const handleCustomerChange = (nextCustomerId: string) => {
    markUserEdited();
    setCustomerId(nextCustomerId);
  };

  const handlePaymentPatch = (patch: Parameters<typeof patchPaymentForm>[0]) => {
    markUserEdited();
    patchPaymentForm(patch);
  };

  const applySelectedSale = (sale: FoundSale) => {
    markUserEdited();
    setSelectedSaleContext(sale);
    setRightPanelMode("operation");
    pushToast(`${sale.saleNo} satış bağlamı seçildi. Orta tablo Hİ-C fazında gerçek satış satırlarına bağlanacak.`);
  };

  const handleSelectFoundSale = (sale: FoundSale, event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    if (activeTab === "return" && isReturnWindowExpired(sale.date) && !returnOverrideAccepted) {
      setReturnWarningSale(sale);
      return;
    }
    applySelectedSale(sale);
  };

  const handleReturnWarningCancel = (event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    setReturnWarningSale(null);
    setReturnOverrideAccepted(false);
    setSelectedSaleContext(null);
    setRightPanelMode("operation");
  };

  const handleReturnWarningContinue = (event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    if (!returnWarningSale) return;
    markUserEdited();
    setReturnOverrideAccepted(true);
    if (returnWarningSale.summary !== "Deep link sipariş bağlamı") {
      applySelectedSale(returnWarningSale);
    }
    setReturnWarningSale(null);
  };

  const handleCollectionSave = (event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    if (activeTab !== "payment") {
      pushToast("Tahsilat kaydı için tahsilat alanını doldurup Kaydet kullanın.");
      return;
    }
    void handleSave();
  };

  const handleSourceLineFocus = (lineId: string, event?: MouseEvent<HTMLButtonElement>) => {
    stopUiEvent(event);
    setExpandedLineId(lineId);
  };

  const saveLabel =
    activeTab === "price"
      ? "Teklif Kaydet"
      : activeTab === "payment"
        ? "Tahsilat Kaydet"
        : activeTab === "delivery"
          ? "Teslim Kaydet"
          : activeTab === "return"
            ? "İade Kaydet"
            : "Satış Olarak Kaydet";

  return (
    <div className="hism-home hism-home--embedded hism-home--compact" data-page="quick-operation-reference-workbench">
      {notice ? (
        <div className="hism-notice" role="status">
          <span>{notice}</span>
          {submitLinks.detailHref ? (
            <Link href={submitLinks.detailHref} className="hism-notice-link">
              {submitLinks.detailLabel ?? "Detaya git"}
            </Link>
          ) : null}
          {submitLinks.paymentDetailHref ? (
            <Link href={submitLinks.paymentDetailHref} className="hism-notice-link">
              {submitLinks.paymentDetailLabel ?? "Tahsilat detayına git"}
            </Link>
          ) : null}
          <button type="button" className="hism-notice-dismiss" onClick={() => setNotice(null)}>
            Kapat
          </button>
        </div>
      ) : null}

      {customersLoadError ? (
        <p className="hism-notice" role="alert">
          {customersLoadError}
        </p>
      ) : null}

      <header className="hism-head hism-head--compact">
        <div>
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
      </header>

      <section className="hism-recent hism-recent--compact" aria-label="Son işlemler">
        <div className="hism-recent-head">
          <strong>Son İşlemler</strong>
          <Link href="/archive">Tümünü Gör ›</Link>
        </div>
        <div className="hism-recent-row">
          {recentLoading ? (
            <article className="hism-recent-card hism-recent-card--placeholder">
              <strong>—</strong>
              <p>Yükleniyor…</p>
            </article>
          ) : null}
          {!recentLoading && recentItems.length === 0 ? (
            <article className="hism-recent-card hism-recent-card--placeholder">
              <strong>—</strong>
              <p>Henüz işlem kaydı yok.</p>
            </article>
          ) : null}
          {recentItems.map((item) => (
            <Link key={item.id} href={item.href} className="hism-recent-card hism-recent-card-link">
              <strong>{item.id}</strong>
              <span>{item.amount}</span>
              <p>{item.customer}</p>
              <footer>
                <span className={statusClass(item.status)}>{item.status}</span>
                <time>{item.time}</time>
              </footer>
            </Link>
          ))}
        </div>
      </section>

      <div className="hism-workspace">
        <main className="hism-main">
          <section className="hism-form hism-customer--compact" aria-label="Cari bilgileri">
            <h2>Cari Bilgileri</h2>
            <div className="hism-form-grid">
              <label>
                <span>Cari Kodu / Adı</span>
                <select value={customerId} disabled={workbenchLocked} onChange={(event) => handleCustomerChange(event.target.value)}>
                  {customersLoading ? (
                    <option value="">Cariler yükleniyor…</option>
                  ) : !hasCatalogCustomers ? (
                    <option value="">Cari kaydı yok</option>
                  ) : (
                    catalogCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label>
                <span>Telefon / E-posta</span>
                <input type="text" value={selectedCustomer.phone} readOnly />
              </label>
              <label>
                <span>Yetkili</span>
                <input type="text" value={selectedCustomer.contactName} readOnly />
              </label>
              <label>
                <span>Fiyat Grubu</span>
                <input type="text" value={selectedCustomer.priceGroup} readOnly />
              </label>
              <label>
                <span>Bakiye / Risk</span>
                <input type="text" value={`${money(totals.grandTotal)} / ${selectedCustomer.risk || "Orta"}`} readOnly />
              </label>
              <label>
                <span>Adres</span>
                <input type="text" value={selectedCustomer.address} readOnly />
              </label>
            </div>
          </section>

          {activeTab === "delivery" ? (
            <section className="hism-delivery-band" aria-label="Depo hazırlık bağlantısı">
              <p>Hazır depo fişinden teslim başlatın. Fiş tamamlandığında belge arşivlenir.</p>
              <label>
                <span>Hazır fiş</span>
                <select value={prepSlipId} onChange={(event) => {
                  markUserEdited();
                  setPrepSlipId(event.target.value);
                }}>
                  <option value="">Seçin…</option>
                  {PREP_SLIPS.map((slip) => (
                    <option key={slip.id} value={slip.id}>
                      {slip.label}
                    </option>
                  ))}
                </select>
              </label>
            </section>
          ) : null}

          {offerContext ? (
            <p className="hism-linked-order" role="status">
              Tekliften sipariş taslağı yüklendi: <strong>{offerContext.offerNo}</strong>. Satırlar düzenlenebilir; kaydedildiğinde yeni sipariş oluşturulur.
            </p>
          ) : null}

          {orderContext ? (
            <p className="hism-linked-order" role="status">
              Bağlı sipariş: <strong>{orderContext.orderNo}</strong> · {orderContext.customerName} · {orderContext.amountDisplay}
            </p>
          ) : linkedOrderId ? (
            <p className="hism-linked-order" role="status">
              Bağlı sipariş: <strong>{linkedOrderId}</strong>
            </p>
          ) : null}

          {orderContext && activeTab === "order" && !offerContext ? (
            <p className="hism-linked-order" role="note">
              Bu bağlantı mevcut sipariş bağlamıdır; yeni satış kaydı oluşturmak için ürünleri manuel ekleyin.
            </p>
          ) : null}

          {showProductTable ? (
            <section className="hism-table-wrap" aria-label="Ürünler">
              <header>
                <h2>Ürünler</h2>
                <input
                  type="search"
                  placeholder="Ürün ara (kod, ad, barkod)…"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                />
                <button type="button" onClick={handleAddProductLine} disabled={workbenchLocked}>
                  + Ürün Ekle
                </button>
                <span>Fiyat Tipi</span>
                <strong>{selectedCustomer.priceGroup || "Perakende"}</strong>
                <button type="button" className="hism-find-sale-trigger hism-find-sale-trigger--toolbar" onClick={openFindSalePanel}>
                  Gerçekleşen Satışları Getir
                </button>
              </header>
              <div className="hism-table-scroll">
                <table className="hism-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ürün</th>
                      <th>Miktar</th>
                      <th>Birim</th>
                      <th>Kaynak</th>
                      <th>Depo / Raf</th>
                      <th>Birim Fiyat</th>
                      <th>İskonto</th>
                      <th>KDV</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <Fragment key={line.id}>
                        <tr className={selectedSaleContext ? "hism-line-readonly-preview" : undefined}>
                          <td>{index + 1}</td>
                          <td>
                            <select value={line.productCode} disabled={workbenchLocked} onChange={(event) => handleSelectProduct(line.id, event.target.value)}>
                              <option value="">Seçin…</option>
                              {filteredProducts.map((product) => (
                                <option key={product.code} value={product.code}>
                                  {product.code} · {product.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={line.quantity}
                              disabled={workbenchLocked}
                              onChange={(event) => handleUpdateLine(line.id, { quantity: Math.max(0, Number(event.target.value || 0)) })}
                            />
                          </td>
                          <td>
                            <select value={line.unit} disabled={workbenchLocked} onChange={(event) => handleUpdateLine(line.id, { unit: event.target.value })}>
                              {UNIT_OPTIONS.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="hism-source-inline"
                              onClick={(event) => handleSourceLineFocus(line.id, event)}
                            >
                              <span className={sourceTone(line.sourceLabel)} />
                              {line.sourceLabel || "Kaynak seç"}
                            </button>
                          </td>
                          <td>{line.rackCode || line.warehouseName || "—"}</td>
                          <td>{money(line.unitPrice)}</td>
                          <td>%0</td>
                          <td>%{line.taxRate}</td>
                          <td>{money(lineTotal(line))}</td>
                          <td>
                            <span className={statusClass(line.sourceLabel ? "Tamamlandı" : "Onayda")}>
                              {line.sourceLabel ? "Hazır" : "Kaynak Bekliyor"}
                            </span>
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer>
                <button type="button" onClick={handleClearLines} disabled={workbenchLocked}>
                  Tabloyu Temizle
                </button>
                <span>{lines.filter((line) => line.productCode).length} ürün</span>
                <strong>Toplam Miktar: {totalQty.toLocaleString("tr-TR")}</strong>
              </footer>
            </section>
          ) : null}
        </main>

        {rightPanelMode === "find_sale" ? (
          <aside className="hism-find-sale-panel" aria-label="Gerçekleşen Satış Bul">
            <div className="hism-find-sale-head">
              <button type="button" onClick={closeFindSalePanel}>
                ‹ Geri
              </button>
              <div>
                <h2>Gerçekleşen Satış Bul</h2>
                <p>Satış, teslim, iade veya tahsilat için geçmiş kayıt seçin.</p>
              </div>
              <button type="button" onClick={closeFindSalePanel} aria-label="Kapat">
                ×
              </button>
            </div>

            <div className="hism-find-sale-fields">
              <label>
                <span>Cari adı / kodu</span>
                <input
                  value={findSaleQuery}
                  onChange={(event) => setFindSaleQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                  placeholder="C-0025 - ABC İnşaat A.Ş."
                />
              </label>

              <label>
                <span>Sipariş no / belge no</span>
                <input
                  value={findSaleQuery}
                  onChange={(event) => setFindSaleQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                  placeholder="Sipariş no veya belge no girin…"
                />
              </label>

              <div className="hism-find-sale-date-row">
                <label>
                  <span>Tarih başlangıç</span>
                  <input value="01.04.2025" readOnly />
                </label>
                <label>
                  <span>Tarih bitiş</span>
                  <input value="07.05.2025" readOnly />
                </label>
              </div>

              <div className="hism-find-sale-chips">
                <button type="button" className="is-active">Kısmi Teslim</button>
                <button type="button">Ödendi</button>
                <button type="button">Fabrika Bekliyor</button>
                <button type="button">Tümü</button>
              </div>
            </div>

            <div className="hism-find-sale-results">
              <strong>Bulunan sonuçlar ({filteredFoundSales.length})</strong>
              {filteredFoundSales.map((sale) => (
                <article key={sale.id} className="hism-find-sale-card">
                  <div>
                    <strong>{sale.saleNo}</strong>
                    <span>{sale.customerName}</span>
                    <small>{sale.date}</small>
                  </div>
                  <b>{sale.amount}</b>
                  <p>{sale.status}</p>
                  <small>{sale.summary}</small>
                  <button type="button" onClick={(event) => handleSelectFoundSale(sale, event)}>
                    Seç
                  </button>
                </article>
              ))}
              {filteredFoundSales.length === 0 ? (
                <div className="hism-find-sale-empty">
                  <strong>Kayıt bulunamadı</strong>
                  <p>Arama kriterlerini değiştirin veya canlı arama bağlantısı tamamlandığında tekrar deneyin.</p>
                </div>
              ) : null}
            </div>
          </aside>
        ) : (
          <aside className="hism-operation-panel" aria-label="Operasyon paneli">
            <div className="hism-side-action-row">
              <button type="button" className="hism-find-sale-trigger" onClick={openFindSalePanel}>
                Gerçekleşen Satışları Getir
              </button>
            </div>

            {orderContext && !selectedSaleContext ? (
              <div className="hism-selected-sale-band" role="status">
                <strong>{orderContext.orderNo} sipariş bağlamı yüklendi</strong>
                <span>
                  {orderContext.customerName} · {orderContext.amountDisplay}
                </span>
              </div>
            ) : null}

            {selectedSaleContext ? (
              <div className="hism-selected-sale-band" role="status">
                <strong>{selectedSaleContext.saleNo} satış bağlamı seçildi</strong>
                <span>
                  {selectedSaleContext.customerName} · {selectedSaleContext.amount} · {selectedSaleContext.status}
                </span>
              </div>
            ) : null}

            {returnWarningSale ? (
              <div className="hism-return-warning" role="alertdialog" aria-labelledby="hism-return-warning-title">
                <strong id="hism-return-warning-title">İade kontrolü</strong>
                <p>Bu satışın üzerinden 15 günden fazla süre geçmiş. İade işlemi için kontrol önerilir.</p>
                <div className="hism-return-warning-actions">
                  <button type="button" onClick={handleReturnWarningCancel}>
                    İadeyi iptal et
                  </button>
                  <button type="button" onClick={handleReturnWarningContinue}>
                    Yine de devam et
                  </button>
                </div>
              </div>
            ) : null}

            <section className="hism-operation-summary" aria-label="Operasyon özeti">
              <h2>Operasyon Özeti</h2>
              <div className="hism-operation-summary-grid">
                <dl>
                  <div>
                    <dt>Ara Toplam</dt>
                    <dd>{money(totals.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Toplam İskonto</dt>
                    <dd>{money(totals.discountTotal)}</dd>
                  </div>
                  <div>
                    <dt>KDV Toplamı</dt>
                    <dd>{money(totals.taxTotal)}</dd>
                  </div>
                </dl>
                <ul>
                  <li><span />Depodan Karşılanacak <strong>{money(totals.subtotal * 0.12)}</strong></li>
                  <li><span />Fabrikadan Karşılanacak <strong>{money(totals.subtotal * 0.78)}</strong></li>
                  <li><span />Tedarik Gereken <strong>{money(totals.subtotal * 0.1)}</strong></li>
                  <li><span />İade Edilebilir <strong>{money(0)}</strong></li>
                </ul>
              </div>
              <p className="hism-grand">{money(totals.grandTotal)}</p>
            </section>

            <section className="hism-payment-notes" aria-label="Tahsilat ve notlar">
              <h2>Tahsilat ve Notlar</h2>
              <div className="hism-summary-payment">
                <QuickOperationPaymentBlock
                  state={paymentForm}
                  onChange={handlePaymentPatch}
                  grandTotal={totals.grandTotal}
                  showAllocateToggle={hasProductLine || Boolean(linkedOrderId) || Boolean(orderContext)}
                  disabled={workbenchLocked}
                />
              </div>

              <label>
                <span>Tahsilat Tarihi</span>
                <input type="text" value={dueDate} onChange={(event) => {
                  markUserEdited();
                  setDueDate(event.target.value);
                }} />
              </label>
              <label>
                <span>Açıklama</span>
                <textarea rows={2} value={description} onChange={(event) => {
                  markUserEdited();
                  setDescription(event.target.value);
                }} />
              </label>
            </section>

            <div className="hism-actions">
              <button type="button" className="hism-draft" disabled={workbenchLocked}>
                Taslaklara Kaydet
              </button>
              <button
                type="button"
                className="hism-save"
                disabled={isSubmitting || Boolean(completedAction) || workbenchLocked || isPreviewCustomerBlocked}
                onClick={(event) => {
                  stopUiEvent(event);
                  void handleSave();
                }}
              >
                {isSubmitting ? "İşleniyor…" : saveLabel}
              </button>
              <button
                type="button"
                className="hism-collection"
                disabled={workbenchLocked || isSubmitting}
                onClick={handleCollectionSave}
              >
                Tahsilat Kaydet
              </button>
            </div>
          </aside>
        )}
      </div>

      {!customersLoading && !hasCatalogCustomers && !customersLoadError ? (
        <p className="hism-mode" role="status">
          {MSG_CUSTOMERS_EMPTY}{" "}
          <Link href="/cariler" className="hism-notice-link">
            Cariler
          </Link>
        </p>
      ) : null}
    </div>
  );
}
