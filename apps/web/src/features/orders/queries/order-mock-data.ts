import {
  buildOrderSourcePlan,
  calculateOrderTotals,
  convertOfferToOrderDraft,
  deriveOrderDeliveryStatus,
  deriveOrderPaymentStatus
} from "@hallederiz/domain";
import type {
  CurrencyCode,
  Customer,
  OfferOrderDraft,
  OrderChannel,
  OrderDeliveryStatus,
  OrderPaymentStatus,
  OrderSourcePreference,
  PriceSlotNumber,
  Product,
  SaleOrder,
  SaleOrderLine,
  SaleOrderStatus
} from "@hallederiz/types";
import { customers, getCustomerById } from "../../customers/queries/customer-mock-data";
import { getOfferMockData } from "../../offers/queries/offer-mock-data";
import { getStockCatalog } from "../../stock/queries/get-stock-catalog";

const tenantId = "tenant_1";
const createdBy = "user_1";

function toOrderSourcePreference(source: string): OrderSourcePreference {
  if (source === "factory") {
    return "factory";
  }

  if (source === "hybrid") {
    return "split";
  }

  return "warehouse";
}

function createLine({
  orderId,
  lineId,
  product,
  quantity,
  unitPrice,
  priceSlotNo,
  priceSlotLabelSnapshot,
  sourcePreference,
  preparedQuantity = 0,
  deliveredQuantity = 0
}: {
  orderId: string;
  lineId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  priceSlotNo: PriceSlotNumber;
  priceSlotLabelSnapshot: string;
  sourcePreference: OrderSourcePreference;
  preparedQuantity?: number;
  deliveredQuantity?: number;
}): SaleOrderLine {
  const centerStockSnapshot = product.warehouseStocks.find((stock) => stock.warehouseId === "wh_1")?.onHand ?? 0;
  const lineTotal = Number((quantity * unitPrice).toFixed(2));

  return {
    id: lineId,
    orderId,
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    quantity,
    unitPrice,
    currency: "TRY",
    exchangeRate: 1,
    tlUnitPrice: unitPrice,
    lineTotal,
    tlLineTotal: lineTotal,
    priceSlotNo,
    priceSlotLabelSnapshot,
    sourcePreference,
    centerStockSnapshot,
    factoryStockSnapshot: product.factoryStockSummary.totalStock,
    preparedQuantity,
    deliveredQuantity
  };
}

function withDerivedState(order: Omit<SaleOrder, "subtotal" | "taxTotal" | "grandTotal" | "paymentStatus" | "deliveryStatus" | "sourcePlans">): SaleOrder {
  const totals = calculateOrderTotals({ lines: order.lines, currency: order.currency, taxRate: order.taxRate });
  const orderWithTotals: SaleOrder = {
    ...order,
    subtotal: totals.subtotal,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    paymentStatus: "unpaid",
    deliveryStatus: "none",
    sourcePlans: []
  };
  const sourcePlans = buildOrderSourcePlan(orderWithTotals);

  return {
    ...orderWithTotals,
    sourcePlans,
    paymentStatus: deriveOrderPaymentStatus({ ...orderWithTotals, grandTotal: totals.grandTotal }),
    deliveryStatus: deriveOrderDeliveryStatus(orderWithTotals)
  };
}

export function mapOfferDraftToSaleOrder(draft: OfferOrderDraft, customer?: Customer | null): SaleOrder {
  const orderId = `order_from_${draft.offerId}`;
  const lines: SaleOrderLine[] = draft.lines.map((line, index) => {
    const sourcePreference = toOrderSourcePreference(line.sourcePreference);
    const lineTotal = Number((line.quantity * line.unitPrice).toFixed(2));

    return {
      id: `order_line_${draft.offerId}_${index + 1}`,
      orderId,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      currency: line.currency,
      exchangeRate: line.exchangeRate,
      tlUnitPrice: Number((line.unitPrice * line.exchangeRate).toFixed(2)),
      lineTotal,
      tlLineTotal: Number((lineTotal * line.exchangeRate).toFixed(2)),
      priceSlotNo: line.priceSlotNo,
      priceSlotLabelSnapshot: line.priceSlotLabelSnapshot,
      sourcePreference,
      centerStockSnapshot: line.centerStockSnapshot,
      factoryStockSnapshot: line.factoryStockSnapshot,
      preparedQuantity: 0,
      deliveredQuantity: 0
    };
  });

  return withDerivedState({
    id: orderId,
    tenantId,
    orderNo: "Yeni Siparis",
    customerId: draft.customerId,
    offerId: draft.offerId,
    status: "draft",
    channel: "offer_conversion",
    deliveryType: "hybrid",
    note: draft.note ?? `${draft.offerNo} teklifinden siparis taslagi.`,
    priceSlotNoSnapshot: draft.priceSlotNoSnapshot,
    priceSlotLabelSnapshot: draft.priceSlotLabelSnapshot,
    currency: "TRY",
    taxRate: 20,
    paidTotal: 0,
    source: "teklif_donusumu",
    createdBy,
    createdAt: draft.createdAt,
    updatedAt: draft.createdAt,
    lines
  });
}

export async function getOrderMockData(): Promise<SaleOrder[]> {
  const stock = await getStockCatalog();
  const productOne = stock.products[0];
  const productTwo = stock.products[1];
  const productThree = stock.products[2];
  const customerOne = getCustomerById("customer_1");
  const customerTwo = getCustomerById("customer_2");
  const customerThree = getCustomerById("customer_3");

  if (!productOne || !productTwo || !productThree || !customerOne || !customerTwo || !customerThree) {
    return [];
  }

  const orderOne = withDerivedState({
    id: "order_1",
    tenantId,
    orderNo: "SO-2481",
    customerId: customerOne.id,
    offerId: "offer_2",
    status: "in_preparation",
    channel: "offer_conversion",
    deliveryType: "hybrid",
    note: "Tekliften donusen siparis; depo ve fabrika ayrimi planlanacak.",
    priceSlotNoSnapshot: customerOne.pricingProfile.selectedPriceSlotNo,
    priceSlotLabelSnapshot: customerOne.pricingProfile.priceSlotLabelSnapshot ?? "Bayi",
    currency: "TRY",
    taxRate: 20,
    paidTotal: 25000,
    source: "teklif_donusumu",
    createdBy,
    createdAt: "2026-04-28T08:30:00.000Z",
    updatedAt: "2026-04-28T11:40:00.000Z",
    confirmedAt: "2026-04-28T09:00:00.000Z",
    lines: [
      createLine({
        orderId: "order_1",
        lineId: "order_line_1",
        product: productOne,
        quantity: 20,
        unitPrice: 840,
        priceSlotNo: 4,
        priceSlotLabelSnapshot: "Bayi",
        sourcePreference: "warehouse",
        preparedQuantity: 8
      }),
      createLine({
        orderId: "order_1",
        lineId: "order_line_2",
        product: productTwo,
        quantity: 18,
        unitPrice: 650,
        priceSlotNo: 4,
        priceSlotLabelSnapshot: "Bayi",
        sourcePreference: "split"
      })
    ]
  });

  const orderTwo = withDerivedState({
    id: "order_2",
    tenantId,
    orderNo: "SO-2478",
    customerId: customerTwo.id,
    status: "waiting_stock",
    channel: "phone",
    deliveryType: "factory",
    note: "Kurumsal proje icin fabrika stok teyidi bekleniyor.",
    priceSlotNoSnapshot: customerTwo.pricingProfile.selectedPriceSlotNo,
    priceSlotLabelSnapshot: customerTwo.pricingProfile.priceSlotLabelSnapshot ?? "Proje",
    currency: "TRY",
    taxRate: 20,
    paidTotal: 0,
    source: "manual",
    createdBy,
    createdAt: "2026-04-27T15:10:00.000Z",
    updatedAt: "2026-04-28T10:10:00.000Z",
    confirmedAt: "2026-04-27T15:30:00.000Z",
    lines: [
      createLine({
        orderId: "order_2",
        lineId: "order_line_3",
        product: productThree,
        quantity: 42,
        unitPrice: 610,
        priceSlotNo: 2,
        priceSlotLabelSnapshot: "Proje",
        sourcePreference: "factory"
      })
    ]
  });

  const orderThree = withDerivedState({
    id: "order_3",
    tenantId,
    orderNo: "SO-2469",
    customerId: customerThree.id,
    status: "confirmed",
    channel: "whatsapp",
    deliveryType: "warehouse",
    note: "WhatsApp uzerinden alinan siparis; tahsilat ve depo emri bekliyor.",
    priceSlotNoSnapshot: customerThree.pricingProfile.selectedPriceSlotNo,
    priceSlotLabelSnapshot: customerThree.pricingProfile.priceSlotLabelSnapshot ?? "Mimar",
    currency: "TRY",
    taxRate: 20,
    paidTotal: 0,
    source: "whatsapp",
    createdBy,
    createdAt: "2026-04-26T16:00:00.000Z",
    updatedAt: "2026-04-27T08:45:00.000Z",
    lines: [
      createLine({
        orderId: "order_3",
        lineId: "order_line_4",
        product: productOne,
        quantity: 10,
        unitPrice: 870,
        priceSlotNo: 3,
        priceSlotLabelSnapshot: "Mimar",
        sourcePreference: "auto"
      })
    ]
  });

  return [
    {
      ...orderOne,
      paymentStatus: "partial",
      deliveryStatus: "preparing"
    },
    orderTwo,
    orderThree
  ];
}

export async function getNewOrderDraft(sourceOfferId?: string | null, customerId?: string | null): Promise<SaleOrder | null> {
  if (sourceOfferId) {
    const offers = await getOfferMockData();
    const offer = offers.find((item) => item.id === sourceOfferId || item.offerNo === sourceOfferId);
    const customer = offer ? getCustomerById(offer.customerId) : null;

    if (offer) {
      return mapOfferDraftToSaleOrder(convertOfferToOrderDraft(offer, customer ?? undefined), customer);
    }
  }

  const stock = await getStockCatalog();
  const customer = getCustomerById(customerId ?? "customer_1") ?? getCustomerById("customer_1");
  const product = stock.products[0];

  if (!customer || !product) {
    return null;
  }

  return withDerivedState({
    id: "order_new",
    tenantId,
    orderNo: "Yeni Siparis",
    customerId: customer.id,
    status: "draft",
    channel: "field",
    deliveryType: "warehouse",
    note: "Yeni siparis taslagi.",
    priceSlotNoSnapshot: customer.pricingProfile.selectedPriceSlotNo,
    priceSlotLabelSnapshot: customer.pricingProfile.priceSlotLabelSnapshot ?? "Bayi",
    currency: "TRY",
    taxRate: 20,
    paidTotal: 0,
    source: "manual",
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: [
      createLine({
        orderId: "order_new",
        lineId: "order_line_new_1",
        product,
        quantity: 6,
        unitPrice: 840,
        priceSlotNo: 4,
        priceSlotLabelSnapshot: "Bayi",
        sourcePreference: "warehouse"
      })
    ]
  });
}

export async function getOrderById(orderId?: string, sourceOfferId?: string | null, customerId?: string | null): Promise<SaleOrder | null> {
  if (!orderId) {
    return getNewOrderDraft(sourceOfferId, customerId);
  }

  const orders = await getOrderMockData();
  return orders.find((order) => order.id === orderId || order.orderNo === orderId) ?? null;
}

export function getOrderStatusLabel(status: SaleOrderStatus): string {
  const labels: Record<SaleOrderStatus, string> = {
    draft: "Taslak",
    confirmed: "Onaylandi",
    waiting_stock: "Stok Bekliyor",
    in_preparation: "Hazirlaniyor",
    ready: "Hazir",
    partially_delivered: "Kismi Teslim",
    delivered: "Teslim Edildi",
    completed: "Tamamlandi",
    cancelled: "Iptal"
  };
  return labels[status];
}

export function getPaymentStatusLabel(status: OrderPaymentStatus): string {
  const labels: Record<OrderPaymentStatus, string> = {
    unpaid: "Odenmedi",
    partial: "Kismi",
    paid: "Odendi",
    overpaid: "Fazla Odeme"
  };
  return labels[status];
}

export function getDeliveryStatusLabel(status: OrderDeliveryStatus): string {
  const labels: Record<OrderDeliveryStatus, string> = {
    none: "Baslamadi",
    preparing: "Hazirlaniyor",
    ready: "Hazir",
    partial: "Kismi",
    delivered: "Teslim"
  };
  return labels[status];
}

export function getOrderChannelLabel(channel: OrderChannel): string {
  const labels: Record<OrderChannel, string> = {
    field: "Saha",
    phone: "Telefon",
    whatsapp: "WhatsApp",
    web: "Web",
    offer_conversion: "Teklif Donusumu"
  };
  return labels[channel];
}

export { customers };
