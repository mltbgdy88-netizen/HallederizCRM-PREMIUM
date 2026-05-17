"use client";

import { useCallback, useMemo, useState } from "react";
import type { QuickOperationSubmitRequest } from "@hallederiz/types";
import type {
  QuickOperationAiInsight,
  QuickOperationCustomer,
  QuickOperationDocumentPreview,
  QuickOperationImpact,
  QuickOperationLine,
  QuickOperationProduct,
  QuickOperationSideActions,
  QuickOperationSourceType,
  QuickOperationType,
  QuickOperationWhatsappDraft,
  SourceOption
} from "../types";
import { dataSourceConfig } from "../../../lib/data-source";
import { submitQuickOperationRecord } from "../../../services/api/quick-operations.service";
import {
  buildQuickOperationCustomers,
  findCatalogProduct,
  findQuickOperationCustomer,
  productToQuickOperationLine
} from "../data/quick-operation-catalog";
import {
  isQuickOpPreviewCustomerId,
  isQuickOpPreviewProductId
} from "../data/quick-operation-guards";
import { MSG_DRAFT_SAVED, MSG_PREVIEW_CUSTOMER, MSG_PREVIEW_PRODUCT } from "../data/quick-operation-messages";
import { calculateQuickOperationTotals } from "../utils/calculate-quick-operation-totals";
import { mapSourceSelectionToWorkflow } from "../utils/map-source-selection-to-workflow";

export const operationTypeLabels: Record<QuickOperationType, { label: string; title: string; description: string }> = {
  offer: {
    label: "Teklif",
    title: "Teklif hızlı girişi",
    description: "Stok rezervasyonu yapmadan teklif, belge ve WhatsApp taslağı önizlenir."
  },
  sale_order: {
    label: "Satış / Sipariş",
    title: "Satış ve sipariş hızlı girişi",
    description: "Satır kaynak seçimine göre depo, fabrika ve tedarik iş akışı etkisi önizlenir."
  },
  delivery: {
    label: "Teslim",
    title: "Teslim hızlı girişi",
    description: "Mevcut sipariş veya serbest teslim için depo hazırlık ve ödeme kontrolleri önizlenir."
  },
  payment: {
    label: "Tahsilat",
    title: "Tahsilat hızlı girişi",
    description: "Cari bakiye ve açık sipariş/fatura dağılımı önizlenir."
  },
  return: {
    label: "İade",
    title: "İade hızlı girişi",
    description: "İade talebi, stok/finans etkisi ve gerekirse onay ihtiyacı önizlenir."
  }
};

export const demoCustomers: QuickOperationCustomer[] = buildQuickOperationCustomers();

const fallbackCustomer: QuickOperationCustomer = {
  id: "customer_fallback",
  name: "Cari seçilmedi",
  contactName: "—",
  phone: "—",
  priceGroup: "—",
  risk: "Düşük",
  balance: 0,
  address: "—",
  receivableDisplay: "—",
  payableDisplay: "—",
  warningDisplay: "—",
  financeLinked: false
};

export const demoProducts: QuickOperationProduct[] = [
  { code: "DKG-1001", name: "Marvel Duvar Kagidi / Ivory", price: 590, taxRate: 20 },
  { code: "DKG-2040", name: "Luxe Modern Desen / Gri", price: 420, taxRate: 20 },
  { code: "HZM-01", name: "Uygulama / servis hizmeti", price: 1250, taxRate: 20 }
];

const fallbackProduct: QuickOperationProduct = {
  code: "ITEM-001",
  name: "Örnek ürün/hizmet",
  price: 0,
  taxRate: 20
};

export const sourceOptions: SourceOption[] = [
  {
    type: "center_warehouse",
    title: "Merkez Depo",
    badge: "24 adet uygun",
    description: "Depo: Merkez Depo · Raf: A-01-03 · Lokasyon: Zemin / Koridor 2",
    sourceLabel: "Merkez",
    warehouseName: "Merkez Depo",
    rackCode: "A-01-03",
    locationCode: "Zemin / Koridor 2"
  },
  {
    type: "factory",
    title: "Fabrika stoğu",
    badge: "80 adet uygun",
    description: "Fabrika: Ankara Fabrika · Tahmini geliş: 3 gün",
    sourceLabel: "Fabrika",
    warehouseName: "Ankara Fabrika",
    rackCode: "-",
    locationCode: "Fabrika sevk"
  },
  {
    type: "supplier",
    title: "Tedarikçi stoğu",
    badge: "120 adet uygun",
    description: "Tedarikçi: Tedarikçi A · Tahmini tedarik: 5 gün",
    sourceLabel: "Tedarikçi",
    warehouseName: "Tedarikçi A",
    rackCode: "-",
    locationCode: "Dış kaynak"
  },
  {
    type: "split",
    title: "Çoklu kaynak",
    badge: "Çoklu plan",
    description: "Satır miktarı depo, fabrika ve tedarikçi arasında dağıtılır.",
    sourceLabel: "Çoklu",
    warehouseName: "Çoklu kaynak",
    rackCode: "-",
    locationCode: "Dağıtım planı"
  },
  {
    type: "auto",
    title: "Otomatik Kaynak",
    badge: "Sistem onerisi",
    description: "Sistem stok, teslim süresi ve cari önceliğine göre kaynak önerir.",
    sourceLabel: "Otomatik",
    warehouseName: "Sistem önerisi",
    rackCode: "-",
    locationCode: "Öneri"
  }
];

const fallbackSource: SourceOption = {
  type: "auto",
  title: "Otomatik Kaynak",
  badge: "Sistem onerisi",
  description: "Kaynak seçimi bekleniyor.",
  sourceLabel: "Otomatik",
  warehouseName: "Sistem önerisi",
  rackCode: "-",
  locationCode: "Öneri"
};

/** Tabloya eklenen boş satır — ürün seçilene kadar sıfır/boş değerler */
function createEmptyLine(): QuickOperationLine {
  return {
    id: `line_empty_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    productCode: "",
    productName: "",
    unit: "",
    quantity: 0,
    unitPrice: 0,
    sourceType: "auto",
    sourceLabel: "—",
    warehouseName: "",
    rackCode: "",
    locationCode: "—",
    taxRate: 20
  };
}

/** Referans mock satırları — Tutar = miktar × birim fiyat ile uyumlu */
export function seedQuickOperationLines(): QuickOperationLine[] {
  const w = (i: number, row: Omit<QuickOperationLine, "id" | "sourceType" | "sourceLabel" | "locationCode" | "taxRate">): QuickOperationLine => ({
    id: `line_seed_${i}`,
    sourceType: "center_warehouse",
    sourceLabel: "Merkez",
    locationCode: "-",
    taxRate: 20,
    ...row
  });
  return [
    w(1, {
      productCode: "URN-001",
      productName: "Suntalam Beyaz 18mm",
      unit: "Adet",
      quantity: 12,
      unitPrice: 807.5,
      warehouseName: "Merkez",
      rackCode: "A-12"
    }),
    w(2, {
      productCode: "URN-014",
      productName: "Menteşe Takımı",
      unit: "Paket",
      quantity: 6,
      unitPrice: 264,
      warehouseName: "A Blok",
      rackCode: "B-04"
    }),
    w(3, {
      productCode: "URN-145",
      productName: "Kapak Kulpu Siyah",
      unit: "Adet",
      quantity: 40,
      unitPrice: 37.8,
      warehouseName: "Merkez",
      rackCode: "C-07"
    }),
    w(4, {
      productCode: "URN-221",
      productName: "MDF Akrilik",
      unit: "Adet",
      quantity: 18,
      unitPrice: 144,
      warehouseName: "Ana Depo",
      rackCode: "R-22"
    }),
    w(5, {
      productCode: "URN-312",
      productName: "Ray Sistemi",
      unit: "Takım",
      quantity: 8,
      unitPrice: 512,
      warehouseName: "A Blok",
      rackCode: "D-10"
    }),
    w(6, {
      productCode: "URN-056",
      productName: "Yonga Vida 3.5x16",
      unit: "Kutu",
      quantity: 30,
      unitPrice: 45,
      warehouseName: "Merkez",
      rackCode: "E-05"
    })
  ];
}

export function useQuickOperationState(options?: {
  initialCustomerId?: string | null;
  initialProductId?: string | null;
}) {
  const catalogCustomers = useMemo(() => buildQuickOperationCustomers(), []);
  const resolvedInitialCustomer = useMemo(() => {
    const requested = options?.initialCustomerId?.trim();
    if (!requested) {
      return catalogCustomers[0]?.id ?? fallbackCustomer.id;
    }
    if (findQuickOperationCustomer(requested)) {
      return requested;
    }
    return catalogCustomers[0]?.id ?? fallbackCustomer.id;
  }, [catalogCustomers, options?.initialCustomerId]);

  const [operationType, setOperationTypeState] = useState<QuickOperationType>("sale_order");
  const [customerId, setCustomerId] = useState(resolvedInitialCustomer);
  const [lines, setLines] = useState<QuickOperationLine[]>(() => seedQuickOperationLines());
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [operationNote, setOperationNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedImpacts, setSubmittedImpacts] = useState<QuickOperationImpact[] | null>(null);
  const [sideActions, setSideActions] = useState<QuickOperationSideActions | null>(null);
  const [documentPreviewVisible, setDocumentPreviewVisible] = useState(false);
  const [whatsappDraftVisible, setWhatsappDraftVisible] = useState(false);

  const selectedCustomer = useMemo(() => {
    return (
      findQuickOperationCustomer(customerId) ??
      catalogCustomers.find((customer) => customer.id === customerId) ??
      catalogCustomers[0] ??
      fallbackCustomer
    );
  }, [customerId, catalogCustomers]);
  const totals = useMemo(() => calculateQuickOperationTotals(lines), [lines]);
  const calculatedImpacts = useMemo(() => mapSourceSelectionToWorkflow(operationType, lines), [operationType, lines]);
  const impacts = submittedImpacts ?? calculatedImpacts;
  const aiInsight: QuickOperationAiInsight | undefined = sideActions?.aiInsight;
  const documentPreview: QuickOperationDocumentPreview | undefined = sideActions?.documentPreview;
  const whatsappDraft: QuickOperationWhatsappDraft | undefined = sideActions?.whatsappDraft;

  const updateLine = (lineId: string, patch: Partial<QuickOperationLine>) => {
    setSubmittedImpacts(null);
    setSideActions(null);
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  };

  const selectProduct = (lineId: string, productCode: string) => {
    const product = demoProducts.find((item) => item.code === productCode);
    if (!product) return;
    updateLine(lineId, {
      productCode: product.code,
      productName: product.name,
      unitPrice: product.price,
      taxRate: product.taxRate,
      unit: product.name.includes("hizmet") ? "Hizmet" : "Adet"
    });
  };

  const selectSource = (lineId: string, sourceType: QuickOperationSourceType) => {
    const source = sourceOptions.find((item) => item.type === sourceType);
    if (!source) return;
    updateLine(lineId, {
      sourceType: source.type,
      sourceLabel: source.sourceLabel,
      warehouseName: source.warehouseName,
      rackCode: source.rackCode,
      locationCode: source.locationCode
    });
  };

  const addEmptyLine = () => {
    const nextLine = createEmptyLine();
    setSubmittedImpacts(null);
    setSideActions(null);
    setLines((current) => [...current, nextLine]);
    setExpandedLineId(nextLine.id);
  };

  const removeLine = (lineId: string) => {
    setSubmittedImpacts(null);
    setSideActions(null);
    setLines((current) => current.filter((line) => line.id !== lineId));
    if (expandedLineId === lineId) {
      setExpandedLineId(null);
    }
  };

  const replaceLines = (next: QuickOperationLine[]) => {
    setSubmittedImpacts(null);
    setSideActions(null);
    setLines(next);
    setExpandedLineId(null);
  };

  const showFoundationNotice = (action: string) => {
    setNotice(`${action}: Bu ortamda yalnızca taslak ve önizleme hazırlanır. Canlı kayıt için onay ve işlem kuyruğu gerekir.`);
  };

  const applyProductFromUrl = useCallback(
    (productId: string): boolean => {
      if (isQuickOpPreviewProductId(productId)) {
        setNotice(MSG_PREVIEW_PRODUCT);
        return false;
      }
      const product = findCatalogProduct(productId);
      if (!product) {
        setNotice("Ürün katalogda bulunamadı veya canlı veri bağlantısı kurulmadı.");
        return false;
      }
      const line = productToQuickOperationLine(product);
      setSubmittedImpacts(null);
      setSideActions(null);
      setLines((current) => {
        const emptyOnly =
          current.length === 0 || current.every((row) => !row.productCode.trim() && !row.productName.trim());
        return emptyOnly ? [line] : [...current, line];
      });
      setExpandedLineId(line.id);
      return true;
    },
    []
  );

  const isPreviewCustomer = isQuickOpPreviewCustomerId(selectedCustomer.id);
  const isPreviewCustomerBlocked = isPreviewCustomer;

  const setOperationType = (next: QuickOperationType) => {
    setSubmittedImpacts(null);
    setSideActions(null);
    setOperationTypeState(next);
  };

  const buildSubmitPayload = (): QuickOperationSubmitRequest => {
    return {
      operationType,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      reason: operationType === "return" ? operationNote : undefined,
      note: operationNote,
      lines: lines.map((line) => ({
        id: line.id,
        productCode: line.productCode,
        productName: line.productName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
        sourceType: line.sourceType,
        warehouseName: line.warehouseName,
        rackCode: line.rackCode,
        locationCode: line.locationCode,
        lineTotal: Number((line.quantity * line.unitPrice * (1 + line.taxRate / 100)).toFixed(2))
      }))
    };
  };

  const submitOperation = async (): Promise<boolean> => {
    if (isPreviewCustomerBlocked) {
      setNotice(MSG_PREVIEW_CUSTOMER);
      return false;
    }
    if (!selectedCustomer.id || selectedCustomer.id === fallbackCustomer.id) {
      setNotice("Önce cari seçin.");
      return false;
    }

    setIsSubmitting(true);
    let success = false;
    try {
      const result = await submitQuickOperationRecord(buildSubmitPayload());
      setSubmittedImpacts(
        result.workflowImpacts.map((impact) => ({
          id: impact.id,
          title: impact.title,
          description: impact.description,
          tone: impact.severity === "warning" ? "warning" : impact.severity === "success" ? "success" : "info"
        }))
      );
      setSideActions(result.sideActions ?? null);
      const ref = result.createdEntityNo ?? "—";
      if (result.mode === "foundation" || dataSourceConfig.useDemoData) {
        setNotice(`${MSG_DRAFT_SAVED} Referans: ${ref}`);
      } else if (result.mode === "executed") {
        setNotice(`İşlem kaydı alındı: ${ref}. Onay zinciri tamamlandığında uygulanır.`);
      } else {
        setNotice(`Taslak inceleme için hazırlandı. Referans: ${ref}`);
      }
      success = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      setNotice(`İşlem hazırlanamadı: ${message}`);
      success = false;
    } finally {
      setIsSubmitting(false);
    }
    return success;
  };

  const openDocumentPreview = () => {
    if (!documentPreview) {
      showFoundationNotice("Belge önizle");
      return;
    }
    setDocumentPreviewVisible(true);
  };

  const openWhatsappDraft = () => {
    if (!whatsappDraft) {
      showFoundationNotice("WhatsApp taslağı");
      return;
    }
    setWhatsappDraftVisible(true);
  };

  const resetDraft = () => {
    setSubmittedImpacts(null);
    setSideActions(null);
    setNotice(null);
    setLines(seedQuickOperationLines());
    setCustomerId(catalogCustomers[0]?.id ?? fallbackCustomer.id);
    setOperationTypeState("sale_order");
    setOperationNote("");
  };

  return {
    catalogCustomers,
    operationType,
    setOperationType,
    customerId,
    setCustomerId,
    selectedCustomer,
    isPreviewCustomer,
    isPreviewCustomerBlocked,
    applyProductFromUrl,
    initialCustomerParam: options?.initialCustomerId ?? null,
    initialCustomerResolved: Boolean(
      options?.initialCustomerId && findQuickOperationCustomer(options.initialCustomerId)
    ),
    lines,
    expandedLineId,
    setExpandedLineId,
    totals,
    impacts,
    notice,
    setNotice,
    operationNote,
    setOperationNote,
    addEmptyLine,
    removeLine,
    replaceLines,
    updateLine,
    selectProduct,
    selectSource,
    showFoundationNotice,
    submitOperation,
    isSubmitting,
    sideActions,
    aiInsight,
    documentPreview,
    whatsappDraft,
    documentPreviewVisible,
    setDocumentPreviewVisible,
    whatsappDraftVisible,
    setWhatsappDraftVisible,
    openDocumentPreview,
    openWhatsappDraft,
    resetDraft
  };
}
