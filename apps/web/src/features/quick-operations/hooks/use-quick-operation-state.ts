"use client";

import { useMemo, useState } from "react";
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
import { submitQuickOperationRecord } from "../../../services/api/quick-operations.service";
import { calculateQuickOperationTotals } from "../utils/calculate-quick-operation-totals";
import { mapSourceSelectionToWorkflow } from "../utils/map-source-selection-to-workflow";

export const operationTypeLabels: Record<QuickOperationType, { label: string; title: string; description: string }> = {
  offer: {
    label: "Teklif",
    title: "Teklif hizli girisi",
    description: "Stok rezervasyonu yapmadan teklif, belge ve WhatsApp taslagi onizlenir."
  },
  sale_order: {
    label: "Satis / Siparis",
    title: "Satis ve siparis hizli girisi",
    description: "Satir kaynak secimine gore depo, fabrika ve tedarik workflow etkisi onizlenir."
  },
  delivery: {
    label: "Teslim",
    title: "Teslim hizli girisi",
    description: "Mevcut siparis veya serbest teslim icin depo hazirlik ve odeme kontrolleri onizlenir."
  },
  payment: {
    label: "Tahsilat",
    title: "Tahsilat hizli girisi",
    description: "Cari bakiye ve acik siparis/fatura allocation foundation'i onizlenir."
  },
  return: {
    label: "Iade",
    title: "Iade hizli girisi",
    description: "Iade talebi, stok/finans etkisi ve gerekirse approval ihtiyaci onizlenir."
  }
};

export const demoCustomers: QuickOperationCustomer[] = [
  {
    id: "customer_delta",
    name: "Delta A.Ş.",
    contactName: "Mehmet Yıldız",
    phone: "+90 312 555 01 48",
    priceGroup: "Bayi / Slot 1",
    risk: "Orta",
    balance: 72100,
    address: "Ostim OSB, 1232. Cad. No:4, Ankara",
    receivableDisplay: "84.500",
    payableDisplay: "12.300",
    warningDisplay: "2 gecikmiş ödeme"
  },
  {
    id: "customer_nova",
    name: "Nova Gıda",
    contactName: "Elif Aksoy",
    phone: "+90 232 444 90 12",
    priceGroup: "Perakende",
    risk: "Dusuk",
    balance: 12400,
    address: "İzmir Atatürk OSB, No:88",
    receivableDisplay: "42.100",
    payableDisplay: "3.200",
    warningDisplay: "—"
  },
  {
    id: "customer_ege",
    name: "Ege Un A.Ş.",
    contactName: "Can Öztürk",
    phone: "+90 266 333 77 65",
    priceGroup: "Üretici",
    risk: "Dusuk",
    balance: 8800,
    address: "Bandırma Lojistik Üssü",
    receivableDisplay: "118.900",
    payableDisplay: "6.450",
    warningDisplay: "Vade yaklaşıyor (1)"
  }
];

const fallbackCustomer: QuickOperationCustomer = {
  id: "customer_fallback",
  name: "ORNEK CARI",
  contactName: "Yetkili",
  phone: "-",
  priceGroup: "Genel",
  risk: "Dusuk",
  balance: 0,
  address: "-"
};

export const demoProducts: QuickOperationProduct[] = [
  { code: "DKG-1001", name: "Marvel Duvar Kagidi / Ivory", price: 590, taxRate: 20 },
  { code: "DKG-2040", name: "Luxe Modern Desen / Gri", price: 420, taxRate: 20 },
  { code: "HZM-01", name: "Uygulama / servis hizmeti", price: 1250, taxRate: 20 }
];

const fallbackProduct: QuickOperationProduct = {
  code: "ITEM-001",
  name: "Ornek urun/hizmet",
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
    title: "Fabrika Stogu",
    badge: "80 adet uygun",
    description: "Fabrika: Ankara Fabrika · Tahmini gelis: 3 gun",
    sourceLabel: "Fabrika",
    warehouseName: "Ankara Fabrika",
    rackCode: "-",
    locationCode: "Fabrika sevk"
  },
  {
    type: "supplier",
    title: "Tedarikci Stogu",
    badge: "120 adet uygun",
    description: "Tedarikci: Tedarikci A · Tahmini tedarik: 5 gun",
    sourceLabel: "Tedarikci",
    warehouseName: "Tedarikci A",
    rackCode: "-",
    locationCode: "Dis kaynak"
  },
  {
    type: "split",
    title: "Split Kaynak",
    badge: "Coklu plan",
    description: "Satir miktari depo/fabrika/tedarikci arasinda dagitilir.",
    sourceLabel: "Split",
    warehouseName: "Coklu kaynak",
    rackCode: "-",
    locationCode: "Dagitim plani"
  },
  {
    type: "auto",
    title: "Otomatik Kaynak",
    badge: "Sistem onerisi",
    description: "Sistem stok, teslim suresi ve cari onceligine gore kaynak onerir.",
    sourceLabel: "Auto",
    warehouseName: "Sistem onerisi",
    rackCode: "-",
    locationCode: "Oneri"
  }
];

const fallbackSource: SourceOption = {
  type: "auto",
  title: "Otomatik Kaynak",
  badge: "Sistem onerisi",
  description: "Kaynak secimi bekleniyor.",
  sourceLabel: "Auto",
  warehouseName: "Sistem onerisi",
  rackCode: "-",
  locationCode: "Oneri"
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

export function useQuickOperationState() {
  const [operationType, setOperationTypeState] = useState<QuickOperationType>("sale_order");
  const [customerId, setCustomerId] = useState(demoCustomers[0]?.id ?? fallbackCustomer.id);
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
    return demoCustomers.find((customer) => customer.id === customerId) ?? demoCustomers[0] ?? fallbackCustomer;
  }, [customerId]);
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

  const showFoundationNotice = (action: string) => {
    setNotice(`${action}: Bu turda taslak/onizleme olusturulur. Gercek gonderim/uretim sonraki asamada etkinlesecektir.`);
  };

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
      if (result.mode === "executed") {
        if (result.operationType === "delivery") {
          setNotice(`Teslim kaydı oluşturuldu: ${result.createdEntityNo ?? "Numara üretilmedi"}`);
        } else if (result.operationType === "return") {
          setNotice(`İade talebi oluşturuldu: ${result.createdEntityNo ?? "Numara üretilmedi"}`);
        } else {
          setNotice(`İşlem oluşturuldu: ${result.createdEntityNo ?? "Numara üretilmedi"}`);
        }
      } else {
        if (result.operationType === "return") {
          setNotice(`İade talebi oluşturuldu: ${result.createdEntityNo ?? "Numara üretilmedi"}`);
        } else {
          setNotice("Bu işlem inceleme modunda hazırlandı.");
        }
      }
      success = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      setNotice(`İşlem oluşturulamadı: ${message}`);
      success = false;
    } finally {
      setIsSubmitting(false);
    }
    return success;
  };

  const openDocumentPreview = () => {
    if (!documentPreview) {
      showFoundationNotice("Belge Onizle");
      return;
    }
    setDocumentPreviewVisible(true);
  };

  const openWhatsappDraft = () => {
    if (!whatsappDraft) {
      showFoundationNotice("WhatsApp Taslagi");
      return;
    }
    setWhatsappDraftVisible(true);
  };

  const resetDraft = () => {
    setSubmittedImpacts(null);
    setSideActions(null);
    setNotice(null);
    setLines(seedQuickOperationLines());
    setCustomerId(demoCustomers[0]?.id ?? fallbackCustomer.id);
    setOperationTypeState("sale_order");
    setOperationNote("");
  };

  return {
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
    addEmptyLine,
    removeLine,
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
