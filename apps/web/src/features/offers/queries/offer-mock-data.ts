import { buildOfferLineFromProduct, calculateOfferTotals } from "@hallederiz/domain";
import type { Offer, OfferFollowUp, OfferStatus } from "@hallederiz/types";
import { getCustomerById } from "../../customers/queries/customer-mock-data";
import { getStockCatalog } from "../../stock/queries/get-stock-catalog";

const tenantId = "tenant_1";
const createdBy = "user_1";

const followUps: OfferFollowUp[] = [
  {
    id: "followup_1",
    offerId: "offer_1",
    contactChannel: "whatsapp",
    responseState: "waiting",
    note: "PDF teklif gonderildi, yarin telefonla donus alinacak.",
    plannedAt: "2026-04-29T10:30:00.000Z",
    createdBy,
    createdAt: "2026-04-28T09:00:00.000Z"
  },
  {
    id: "followup_2",
    offerId: "offer_2",
    contactChannel: "phone",
    responseState: "positive",
    note: "Musteri siparise donusmek istiyor; kaynak plani bekliyor.",
    plannedAt: "2026-04-28T14:00:00.000Z",
    completedAt: "2026-04-28T14:20:00.000Z",
    createdBy,
    createdAt: "2026-04-27T14:00:00.000Z"
  }
];

function withTotals(offer: Omit<Offer, "subtotal" | "discountTotal" | "taxRate" | "taxTotal" | "grandTotal">): Offer {
  const totals = calculateOfferTotals({ lines: offer.lines, currency: offer.currency, taxRate: 20 });

  return {
    ...offer,
    ...totals
  };
}

export async function getOfferMockData(): Promise<Offer[]> {
  const stock = await getStockCatalog();
  const customerOne = getCustomerById("customer_1");
  const customerTwo = getCustomerById("customer_2");
  const customerThree = getCustomerById("customer_3");

  if (!customerOne || !customerTwo || !customerThree) {
    return [];
  }

  const productOne = stock.products[0];
  const productTwo = stock.products[1];
  const productThree = stock.products[2];

  if (!productOne || !productTwo || !productThree) {
    return [];
  }

  const offerOneLines = [
    buildOfferLineFromProduct({
      lineId: "line_1",
      offerId: "offer_1",
      product: productOne,
      profile: customerOne.pricingProfile,
      priceSlots: stock.priceSlots,
      warehouses: stock.warehouses,
      quantity: 20,
      discountPercent: 3
    }),
    buildOfferLineFromProduct({
      lineId: "line_2",
      offerId: "offer_1",
      product: productTwo,
      profile: customerOne.pricingProfile,
      priceSlots: stock.priceSlots,
      warehouses: stock.warehouses,
      quantity: 12,
      discountPercent: 3
    })
  ];

  const offerTwoLines = [
    buildOfferLineFromProduct({
      lineId: "line_3",
      offerId: "offer_2",
      product: productOne,
      profile: customerTwo.pricingProfile,
      priceSlots: stock.priceSlots,
      warehouses: stock.warehouses,
      quantity: 40
    }),
    buildOfferLineFromProduct({
      lineId: "line_4",
      offerId: "offer_2",
      product: productThree,
      profile: customerTwo.pricingProfile,
      priceSlots: stock.priceSlots,
      warehouses: stock.warehouses,
      quantity: 35
    })
  ];

  const offerThreeLines = [
    buildOfferLineFromProduct({
      lineId: "line_5",
      offerId: "offer_3",
      product: productThree,
      profile: customerThree.pricingProfile,
      priceSlots: stock.priceSlots,
      warehouses: stock.warehouses,
      quantity: 18,
      overrideSlotNo: 2
    })
  ];

  const baseOffers: Array<Omit<Offer, "subtotal" | "discountTotal" | "taxRate" | "taxTotal" | "grandTotal">> = [
    {
      id: "offer_1",
      tenantId,
      offerNo: "OFF-801",
      customerId: "customer_1",
      status: "waiting_response",
      validUntil: "2026-04-30T18:00:00.000Z",
      note: "Bayi projesi icin iki koleksiyon fiyatlandi.",
      priceSlotNoSnapshot: customerOne.pricingProfile.selectedPriceSlotNo,
      priceSlotLabelSnapshot: customerOne.pricingProfile.priceSlotLabelSnapshot ?? "Bayi",
      currency: "TRY",
      createdBy,
      createdAt: "2026-04-27T10:10:00.000Z",
      updatedAt: "2026-04-28T09:00:00.000Z",
      sentAt: "2026-04-28T09:05:00.000Z",
      lines: offerOneLines,
      followUps: followUps.filter((item) => item.offerId === "offer_1"),
      documentStatus: "sent"
    },
    {
      id: "offer_2",
      tenantId,
      offerNo: "OFF-798",
      customerId: "customer_2",
      status: "approved",
      validUntil: "2026-05-02T18:00:00.000Z",
      note: "Kurumsal proje icin teklif onay bekliyor.",
      priceSlotNoSnapshot: customerTwo.pricingProfile.selectedPriceSlotNo,
      priceSlotLabelSnapshot: customerTwo.pricingProfile.priceSlotLabelSnapshot ?? "Proje",
      currency: "TRY",
      createdBy,
      createdAt: "2026-04-25T11:40:00.000Z",
      updatedAt: "2026-04-28T14:20:00.000Z",
      sentAt: "2026-04-26T10:05:00.000Z",
      lines: offerTwoLines,
      followUps: followUps.filter((item) => item.offerId === "offer_2"),
      documentStatus: "previewed"
    },
    {
      id: "offer_3",
      tenantId,
      offerNo: "OFF-792",
      customerId: "customer_3",
      status: "draft",
      validUntil: "2026-05-05T18:00:00.000Z",
      note: "Mimar fiyat grubu yerine proje slotu manuel secildi.",
      priceSlotNoSnapshot: customerThree.pricingProfile.selectedPriceSlotNo,
      priceSlotLabelSnapshot: customerThree.pricingProfile.priceSlotLabelSnapshot ?? "Mimar",
      currency: "TRY",
      createdBy,
      createdAt: "2026-04-24T13:00:00.000Z",
      updatedAt: "2026-04-24T13:20:00.000Z",
      lines: offerThreeLines,
      followUps: [],
      documentStatus: "not_created"
    }
  ];

  return baseOffers.map(withTotals);
}

export async function getNewOfferDraft(): Promise<Offer | null> {
  const stock = await getStockCatalog();
  const customer = getCustomerById("customer_1");
  const product = stock.products[0];

  if (!customer || !product) {
    return null;
  }

  return withTotals({
    id: "offer_new",
    tenantId,
    offerNo: "Yeni Teklif",
    customerId: customer.id,
    status: "draft",
    validUntil: "2026-05-05T18:00:00.000Z",
    note: "Yeni teklif taslagi.",
    priceSlotNoSnapshot: customer.pricingProfile.selectedPriceSlotNo,
    priceSlotLabelSnapshot: customer.pricingProfile.priceSlotLabelSnapshot ?? "Bayi",
    currency: "TRY",
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: [
      buildOfferLineFromProduct({
        lineId: "line_new_1",
        offerId: "offer_new",
        product,
        profile: customer.pricingProfile,
        priceSlots: stock.priceSlots,
        warehouses: stock.warehouses,
        quantity: 10
      })
    ],
    followUps: [],
    documentStatus: "not_created"
  });
}

export function getOfferStatusLabel(status: OfferStatus): string {
  const labels: Record<OfferStatus, string> = {
    draft: "Taslak",
    sent: "Gonderildi",
    waiting_response: "Cevap Bekliyor",
    approved: "Onaylandi",
    rejected: "Reddedildi",
    expired: "Suresi Doldu",
    converted: "Siparise Donustu"
  };

  return labels[status];
}
