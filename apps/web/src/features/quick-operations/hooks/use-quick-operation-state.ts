"use client";

import { useMemo, useState } from "react";
import type { QuickOperationSubmitRequest } from "@hallederiz/types";
import type { QuickOperationCustomer, QuickOperationImpact, QuickOperationLine, QuickOperationProduct, QuickOperationSourceType, QuickOperationType, SourceOption } from "../types";
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
    id: "customer_1",
    name: "MUSTERI FIRMA A.S.",
    contactName: "Ahmet Yilmaz",
    phone: "0532 111 22 33",
    priceGroup: "Bayi / Slot 2",
    risk: "Dusuk",
    balance: 8240,
    address: "Sanayi Bolgesi, 1234. Sokak No:5, Ankara"
  },
  {
    id: "customer_2",
    name: "MIMAR PROJE LTD.",
    contactName: "Selin Kara",
    phone: "0533 222 44 55",
    priceGroup: "Mimar / Slot 3",
    risk: "Orta",
    balance: 2460,
    address: "Cukurambar Mah. Proje Cad. No:18, Ankara"
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

function createLine(index: number): QuickOperationLine {
  const product = demoProducts[index % demoProducts.length] ?? demoProducts[0] ?? fallbackProduct;
  const source = sourceOptions[index === 1 ? 1 : 0] ?? sourceOptions[0] ?? fallbackSource;
  return {
    id: `line_${Date.now()}_${index}`,
    productCode: product.code,
    productName: product.name,
    quantity: index === 1 ? 10 : 5,
    sourceType: source.type,
    sourceLabel: source.sourceLabel,
    warehouseName: source.warehouseName,
    rackCode: source.rackCode,
    locationCode: source.locationCode,
    unitPrice: product.price,
    taxRate: product.taxRate
  };
}

export function useQuickOperationState() {
  const [operationType, setOperationTypeState] = useState<QuickOperationType>("offer");
  const [customerId, setCustomerId] = useState(demoCustomers[0]?.id ?? fallbackCustomer.id);
  const [lines, setLines] = useState<QuickOperationLine[]>([createLine(0), createLine(1), createLine(2)]);
  const [expandedLineId, setExpandedLineId] = useState<string | null>(lines[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedImpacts, setSubmittedImpacts] = useState<QuickOperationImpact[] | null>(null);

  const selectedCustomer = useMemo(() => {
    return demoCustomers.find((customer) => customer.id === customerId) ?? demoCustomers[0] ?? fallbackCustomer;
  }, [customerId]);
  const totals = useMemo(() => calculateQuickOperationTotals(lines), [lines]);
  const calculatedImpacts = useMemo(() => mapSourceSelectionToWorkflow(operationType, lines), [operationType, lines]);
  const impacts = submittedImpacts ?? calculatedImpacts;

  const updateLine = (lineId: string, patch: Partial<QuickOperationLine>) => {
    setSubmittedImpacts(null);
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
  };

  const selectProduct = (lineId: string, productCode: string) => {
    const product = demoProducts.find((item) => item.code === productCode);
    if (!product) return;
    updateLine(lineId, {
      productCode: product.code,
      productName: product.name,
      unitPrice: product.price,
      taxRate: product.taxRate
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

  const addLine = () => {
    const nextLine = createLine(lines.length);
    setSubmittedImpacts(null);
    setLines((current) => [...current, nextLine]);
    setExpandedLineId(nextLine.id);
  };

  const removeLine = (lineId: string) => {
    setSubmittedImpacts(null);
    setLines((current) => current.filter((line) => line.id !== lineId));
    if (expandedLineId === lineId) {
      setExpandedLineId(null);
    }
  };

  const showFoundationNotice = (action: string) => {
    setNotice(`${action}: Backend baglantisi sonraki asamada eklenecek. Bu ekran su an frontend-only onizleme modunda.`);
  };

  const setOperationType = (next: QuickOperationType) => {
    setSubmittedImpacts(null);
    setOperationTypeState(next);
  };

  const buildSubmitPayload = (): QuickOperationSubmitRequest => {
    return {
      operationType,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
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

  const submitOperation = async () => {
    setIsSubmitting(true);
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
      const validationErrorCount = (result.validationIssues ?? []).filter((issue) => issue.level === "error").length;
      const suffix =
        result.mode === "foundation"
          ? "Backend write bir sonraki adimda acilacaktir; bu cevap foundation mode'dur."
          : "Islem backend tarafinda calistirildi.";
      setNotice(
        `Islem sonucu: ${result.operationType} · mode=${result.mode} · impact=${result.workflowImpacts.length} · validation=${validationErrorCount}. ${suffix}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      setNotice(`Islem olusturulamadi: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
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
    addLine,
    removeLine,
    updateLine,
    selectProduct,
    selectSource,
    showFoundationNotice,
    submitOperation,
    isSubmitting
  };
}
