import type { Customer, Offer, OfferOrderDraft } from "@hallederiz/types";

export function convertOfferToOrderDraft(offer: Offer, customer?: Pick<Customer, "id" | "code" | "name">): OfferOrderDraft {
  return {
    id: `order_draft_${offer.id}`,
    customer: customer ?? { id: offer.customerId },
    customerId: offer.customerId,
    offerId: offer.id,
    offerNo: offer.offerNo,
    source: "teklif_donusumu",
    orderSource: "teklif_donusumu",
    note: offer.note,
    priceSlotNoSnapshot: offer.priceSlotNoSnapshot,
    priceSlotLabelSnapshot: offer.priceSlotLabelSnapshot,
    lines: offer.lines.map((line) => ({
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      currency: line.currency,
      exchangeRate: line.exchangeRate,
      priceSlotNo: line.priceSlotNo,
      priceSlotLabelSnapshot: line.priceSlotLabelSnapshot,
      sourcePreference: line.sourcePreference,
      centerStockSnapshot: line.centerStockSnapshot,
      factoryStockSnapshot: line.factoryStockSnapshot,
      linePriceSnapshot: line
    })),
    warning: "Kaynak plani henuz yapilmadi; siparis modulunde depo/fabrika dagilimi olusturulacak.",
    navigationPath: `/siparisler/yeni?sourceOffer=${offer.id}`,
    createdAt: new Date().toISOString()
  };
}
