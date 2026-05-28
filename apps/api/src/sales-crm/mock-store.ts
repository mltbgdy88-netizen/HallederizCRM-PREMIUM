import { calculateOfferTotals, convertOfferToOrderDraft } from "@hallederiz/domain";
import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerLedgerEntry,
  CustomerPricingProfile,
  Offer,
  OfferFollowUp,
  OfferLine
} from "@hallederiz/types";

const tenantId = "tenant_1";
const createdBy = "user_1";

let customers: Customer[] = [
  {
    id: "customer_1",
    tenantId,
    code: "CUS-001",
    name: "Aydin Dekor",
    type: "bayi",
    taxOffice: "Kadikoy",
    taxNumber: "1234567890",
    phone: "0532 111 22 33",
    email: "satinalma@aydindekor.com",
    city: "Istanbul",
    district: "Kadikoy",
    addressLine: "Egitim Mah. Operasyon Cad. No: 12",
    active: true,
    riskLevel: "medium",
    pricingProfile: {
      id: "cpp_customer_1",
      tenantId,
      customerId: "customer_1",
      selectedPriceSlotNo: 4,
      priceSlotLabelSnapshot: "Bayi",
      preferredCurrency: "TRY",
      active: true
    },
    whatsappMatched: true,
    lastOrderAt: "2026-04-24T12:30:00.000Z",
    createdAt: "2026-01-04T10:00:00.000Z",
    updatedAt: "2026-04-26T09:00:00.000Z"
  }
];

let accounts: CustomerAccount[] = [
  {
    id: "account_1",
    tenantId,
    customerId: "customer_1",
    balance: 245000,
    currency: "TRY",
    creditLimit: 500000,
    overdueAmount: 35000,
    openOfferCount: 2,
    openOrderCount: 3,
    lastPaymentAt: "2026-04-22T09:00:00.000Z"
  }
];

let contacts: CustomerContact[] = [];
let addresses: CustomerAddress[] = [];
let ledger: CustomerLedgerEntry[] = [];

let offers: Offer[] = [
  {
    id: "offer_1",
    tenantId,
    offerNo: "OFF-801",
    customerId: "customer_1",
    status: "waiting_response",
    validUntil: "2026-04-30T18:00:00.000Z",
    note: "API mock teklif kaydi.",
    priceSlotNoSnapshot: 4,
    priceSlotLabelSnapshot: "Bayi",
    currency: "TRY",
    subtotal: 17640,
    discountTotal: 0,
    taxRate: 20,
    taxTotal: 3528,
    grandTotal: 21168,
    createdBy,
    createdAt: "2026-04-27T10:10:00.000Z",
    updatedAt: "2026-04-28T09:00:00.000Z",
    sentAt: "2026-04-28T09:05:00.000Z",
    documentStatus: "sent",
    lines: [
      {
        id: "line_1",
        offerId: "offer_1",
        productId: "prod_1",
        productCode: "DK-1001",
        productName: "Linen Soft Ivory",
        quantity: 20,
        priceSlotNo: 4,
        priceSlotLabelSnapshot: "Bayi",
        unitPrice: 840,
        currency: "TRY",
        exchangeRate: 1,
        discountPercent: 0,
        lineTotal: 16800,
        sourcePreference: "warehouse",
        centerStockSnapshot: 38,
        factoryStockSnapshot: 420,
        priceOverride: false
      }
    ],
    followUps: []
  }
];

function recalculateOffer(offer: Offer): Offer {
  return {
    ...offer,
    ...calculateOfferTotals({ lines: offer.lines, currency: offer.currency, taxRate: offer.taxRate }),
    updatedAt: new Date().toISOString()
  };
}

export function listCustomers(): Customer[] {
  return customers;
}

export function getCustomer(customerId: string): Customer | undefined {
  return customers.find((customer) => customer.id === customerId);
}

export function createCustomer(input: Partial<Customer>): Customer {
  const id = `customer_${customers.length + 1}`;
  const customer: Customer = {
    id,
    tenantId,
    code: input.code ?? `CUS-${String(customers.length + 1).padStart(3, "0")}`,
    name: input.name ?? "Yeni Cari",
    type: input.type ?? "bayi",
    phone: input.phone ?? "",
    email: input.email,
    city: input.city ?? "",
    district: input.district,
    addressLine: input.addressLine ?? "",
    active: input.active ?? true,
    riskLevel: input.riskLevel ?? "low",
    pricingProfile:
      input.pricingProfile ??
      {
        id: `cpp_${id}`,
        tenantId,
        customerId: id,
        selectedPriceSlotNo: 1,
        priceSlotLabelSnapshot: "Perakende",
        active: true
      },
    whatsappMatched: input.whatsappMatched ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  customers = [...customers, customer];
  return customer;
}

export function patchCustomer(customerId: string, input: Partial<Customer>): Customer | null {
  const existing = getCustomer(customerId);
  if (!existing) {
    return null;
  }

  const updated = { ...existing, ...input, id: existing.id, tenantId: existing.tenantId, updatedAt: new Date().toISOString() };
  customers = customers.map((customer) => (customer.id === customerId ? updated : customer));
  return updated;
}

export function getAccountSummary(customerId: string): CustomerAccount | undefined {
  return accounts.find((account) => account.customerId === customerId);
}

export function getLedger(customerId: string): CustomerLedgerEntry[] {
  return ledger.filter((entry) => entry.customerId === customerId);
}

export function addContact(customerId: string, input: Partial<CustomerContact>): CustomerContact {
  const contact: CustomerContact = {
    id: `contact_${contacts.length + 1}`,
    tenantId,
    customerId,
    fullName: input.fullName ?? "Yeni Yetkili",
    title: input.title,
    phone: input.phone ?? "",
    email: input.email,
    isPrimary: input.isPrimary ?? false
  };
  contacts = [...contacts, contact];
  return contact;
}

export function addAddress(customerId: string, input: Partial<CustomerAddress>): CustomerAddress {
  const address: CustomerAddress = {
    id: `address_${addresses.length + 1}`,
    tenantId,
    customerId,
    type: input.type ?? "delivery",
    title: input.title ?? "Yeni Adres",
    city: input.city ?? "",
    district: input.district,
    line: input.line ?? "",
    isDefault: input.isDefault ?? false
  };
  addresses = [...addresses, address];
  return address;
}

export function patchPricingProfile(customerId: string, input: Partial<CustomerPricingProfile>): Customer | null {
  const customer = getCustomer(customerId);
  if (!customer) {
    return null;
  }

  return patchCustomer(customerId, {
    pricingProfile: {
      ...customer.pricingProfile,
      ...input,
      id: customer.pricingProfile.id,
      tenantId,
      customerId
    }
  });
}

export function listOffers(): Offer[] {
  return offers;
}

export function getOffer(offerId: string): Offer | undefined {
  return offers.find((offer) => offer.id === offerId || offer.offerNo === offerId);
}

export function createOffer(input: Partial<Offer>): Offer {
  const id = `offer_${offers.length + 1}`;
  const offer = recalculateOffer({
    id,
    tenantId,
    offerNo: input.offerNo ?? `OFF-${800 + offers.length + 1}`,
    customerId: input.customerId ?? customers[0]?.id ?? "customer_1",
    status: input.status ?? "draft",
    validUntil: input.validUntil ?? new Date().toISOString(),
    note: input.note,
    priceSlotNoSnapshot: input.priceSlotNoSnapshot ?? 1,
    priceSlotLabelSnapshot: input.priceSlotLabelSnapshot ?? "Perakende",
    currency: input.currency ?? "TRY",
    subtotal: 0,
    discountTotal: 0,
    taxRate: input.taxRate ?? 20,
    taxTotal: 0,
    grandTotal: 0,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: input.lines ?? [],
    followUps: input.followUps ?? [],
    documentStatus: "not_created"
  });
  offers = [...offers, offer];
  return offer;
}

export function patchOffer(offerId: string, input: Partial<Offer>): Offer | null {
  const offer = getOffer(offerId);
  if (!offer) {
    return null;
  }

  const updated = recalculateOffer({ ...offer, ...input, id: offer.id, tenantId: offer.tenantId });
  offers = offers.map((item) => (item.id === offer.id ? updated : item));
  return updated;
}

export function addOfferLine(offerId: string, input: Partial<OfferLine>): Offer | null {
  const offer = getOffer(offerId);
  if (!offer) {
    return null;
  }

  const line: OfferLine = {
    id: `line_${offer.lines.length + 1}`,
    offerId: offer.id,
    productId: input.productId ?? "prod_1",
    productCode: input.productCode ?? "DK-0000",
    productName: input.productName ?? "Yeni Urun",
    quantity: input.quantity ?? 1,
    priceSlotNo: input.priceSlotNo ?? offer.priceSlotNoSnapshot,
    priceSlotLabelSnapshot: input.priceSlotLabelSnapshot ?? offer.priceSlotLabelSnapshot,
    unitPrice: input.unitPrice ?? 0,
    currency: input.currency ?? offer.currency,
    exchangeRate: input.exchangeRate ?? 1,
    discountPercent: input.discountPercent ?? 0,
    lineTotal: input.lineTotal ?? 0,
    sourcePreference: input.sourcePreference ?? "warehouse",
    centerStockSnapshot: input.centerStockSnapshot ?? 0,
    factoryStockSnapshot: input.factoryStockSnapshot ?? 0,
    priceOverride: input.priceOverride ?? false,
    pricingWarning: input.pricingWarning
  };

  return patchOffer(offer.id, { lines: [...offer.lines, line] });
}

export function patchOfferLine(offerId: string, lineId: string, input: Partial<OfferLine>): Offer | null {
  const offer = getOffer(offerId);
  if (!offer) {
    return null;
  }

  return patchOffer(offer.id, {
    lines: offer.lines.map((line) => (line.id === lineId ? { ...line, ...input, id: line.id, offerId: offer.id } : line))
  });
}

export function addOfferFollowUp(offerId: string, input: Partial<OfferFollowUp>): Offer | null {
  const offer = getOffer(offerId);
  if (!offer) {
    return null;
  }

  const followUp: OfferFollowUp = {
    id: `followup_${offer.followUps.length + 1}`,
    offerId: offer.id,
    contactChannel: input.contactChannel ?? "whatsapp",
    responseState: input.responseState ?? "planned",
    note: input.note ?? "",
    plannedAt: input.plannedAt ?? new Date().toISOString(),
    completedAt: input.completedAt,
    createdBy,
    createdAt: new Date().toISOString()
  };

  return patchOffer(offer.id, { followUps: [...offer.followUps, followUp] });
}

export function sendOffer(offerId: string): Offer | null {
  return patchOffer(offerId, {
    status: "sent",
    sentAt: new Date().toISOString(),
    documentStatus: "sent"
  });
}

export function convertOffer(offerId: string) {
  const offer = getOffer(offerId);
  if (!offer) {
    return null;
  }

  const draft = convertOfferToOrderDraft(offer);
  patchOffer(offer.id, {
    status: "converted",
    convertedOrderDraftId: draft.id
  });
  return draft;
}
