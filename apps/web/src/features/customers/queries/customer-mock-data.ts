import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerLedgerEntry,
  PriceSlotConfig
} from "@hallederiz/types";

const tenantId = "tenant_1";

export const customerPriceSlots: PriceSlotConfig[] = [
  { slotNumber: 1, slotName: "Perakende", currency: "TRY", amount: 0, active: true },
  { slotNumber: 2, slotName: "Proje", currency: "TRY", amount: 0, active: true },
  { slotNumber: 3, slotName: "Mimar", currency: "TRY", amount: 0, active: true },
  { slotNumber: 4, slotName: "Bayi", currency: "TRY", amount: 0, active: true },
  { slotNumber: 5, slotName: "Kampanya", currency: "USD", amount: 0, active: false },
  { slotNumber: 6, slotName: "Ihracat", currency: "EUR", amount: 0, active: false }
];

export const customers: Customer[] = [
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
      discountPolicy: { type: "percentage", value: 3, note: "Duzgun odeme gecmisi indirimi" },
      preferredCurrency: "TRY",
      active: true
    },
    whatsappMatched: true,
    lastOrderAt: "2026-04-24T12:30:00.000Z",
    createdAt: "2026-01-04T10:00:00.000Z",
    updatedAt: "2026-04-26T09:00:00.000Z"
  },
  {
    id: "customer_2",
    tenantId,
    code: "CUS-002",
    name: "Mira Yapi",
    type: "kurumsal",
    taxOffice: "Cankaya",
    taxNumber: "9876543210",
    phone: "0533 444 55 66",
    email: "muhasebe@mirayapi.com",
    city: "Ankara",
    district: "Cankaya",
    addressLine: "Turan Gunes Bulvari No: 80",
    active: true,
    riskLevel: "high",
    pricingProfile: {
      id: "cpp_customer_2",
      tenantId,
      customerId: "customer_2",
      selectedPriceSlotNo: 2,
      priceSlotLabelSnapshot: "Proje",
      discountPolicy: { type: "manual_review", note: "Yuksek bakiye nedeniyle manuel kontrol" },
      preferredCurrency: "TRY",
      active: true
    },
    whatsappMatched: true,
    lastOrderAt: "2026-04-22T09:45:00.000Z",
    createdAt: "2026-01-07T10:00:00.000Z",
    updatedAt: "2026-04-27T11:00:00.000Z"
  },
  {
    id: "customer_3",
    tenantId,
    code: "CUS-003",
    name: "Pera Mimarlik",
    type: "mimar",
    taxOffice: "Beyoglu",
    taxNumber: "1122334455",
    phone: "0535 000 11 22",
    email: "proje@peramimarlik.com",
    city: "Istanbul",
    district: "Beyoglu",
    addressLine: "Tomtom Mah. Tasarim Sok. No: 5",
    active: true,
    riskLevel: "low",
    pricingProfile: {
      id: "cpp_customer_3",
      tenantId,
      customerId: "customer_3",
      selectedPriceSlotNo: 3,
      priceSlotLabelSnapshot: "Mimar",
      discountPolicy: { type: "none" },
      preferredCurrency: "TRY",
      active: true
    },
    whatsappMatched: false,
    lastOrderAt: "2026-04-18T15:20:00.000Z",
    createdAt: "2026-02-02T10:00:00.000Z",
    updatedAt: "2026-04-19T10:00:00.000Z"
  }
];

export const customerAccounts: CustomerAccount[] = [
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
  },
  {
    id: "account_2",
    tenantId,
    customerId: "customer_2",
    balance: 388450,
    currency: "TRY",
    creditLimit: 300000,
    overdueAmount: 112000,
    openOfferCount: 1,
    openOrderCount: 2,
    lastPaymentAt: "2026-04-16T10:30:00.000Z"
  },
  {
    id: "account_3",
    tenantId,
    customerId: "customer_3",
    balance: 74300,
    currency: "TRY",
    creditLimit: 250000,
    overdueAmount: 0,
    openOfferCount: 3,
    openOrderCount: 1,
    lastPaymentAt: "2026-04-24T14:15:00.000Z"
  }
];

export const customerContacts: CustomerContact[] = [
  {
    id: "contact_1",
    tenantId,
    customerId: "customer_1",
    fullName: "Selin Aydin",
    title: "Satinalma Yoneticisi",
    phone: "0532 111 22 33",
    email: "selin@aydindekor.com",
    isPrimary: true
  },
  {
    id: "contact_2",
    tenantId,
    customerId: "customer_2",
    fullName: "Murat Kaya",
    title: "Finans Sorumlusu",
    phone: "0533 444 55 66",
    email: "murat@mirayapi.com",
    isPrimary: true
  },
  {
    id: "contact_3",
    tenantId,
    customerId: "customer_3",
    fullName: "Deniz Pera",
    title: "Kurucu Mimar",
    phone: "0535 000 11 22",
    email: "deniz@peramimarlik.com",
    isPrimary: true
  }
];

export const customerAddresses: CustomerAddress[] = [
  {
    id: "addr_1",
    tenantId,
    customerId: "customer_1",
    type: "billing",
    title: "Fatura Adresi",
    city: "Istanbul",
    district: "Kadikoy",
    line: "Egitim Mah. Operasyon Cad. No: 12",
    isDefault: true
  },
  {
    id: "addr_2",
    tenantId,
    customerId: "customer_1",
    type: "delivery",
    title: "Merkez Santiye",
    city: "Istanbul",
    district: "Atasehir",
    line: "Serifali Mah. Depo Sok. No: 8",
    isDefault: true
  },
  {
    id: "addr_3",
    tenantId,
    customerId: "customer_2",
    type: "billing",
    title: "Fatura Adresi",
    city: "Ankara",
    district: "Cankaya",
    line: "Turan Gunes Bulvari No: 80",
    isDefault: true
  }
];

export const customerLedgerEntries: CustomerLedgerEntry[] = [
  {
    id: "ledger_1",
    tenantId,
    customerId: "customer_1",
    direction: "debit",
    amount: 124300,
    currency: "TRY",
    description: "SO-2481 siparis borclandirma",
    referenceType: "order",
    referenceId: "SO-2481",
    occurredAt: "2026-04-24T12:30:00.000Z"
  },
  {
    id: "ledger_2",
    tenantId,
    customerId: "customer_1",
    direction: "credit",
    amount: 90000,
    currency: "TRY",
    description: "PAY-930 tahsilat",
    referenceType: "payment",
    referenceId: "PAY-930",
    occurredAt: "2026-04-22T09:00:00.000Z"
  },
  {
    id: "ledger_3",
    tenantId,
    customerId: "customer_2",
    direction: "debit",
    amount: 228100,
    currency: "TRY",
    description: "SO-2478 siparis borclandirma",
    referenceType: "order",
    referenceId: "SO-2478",
    occurredAt: "2026-04-22T09:45:00.000Z"
  }
];

export function getCustomerById(customerId: string): Customer | undefined {
  return customers.find((customer) => customer.id === customerId);
}

export function getCustomerAccount(customerId: string): CustomerAccount {
  return (
    customerAccounts.find((account) => account.customerId === customerId) ?? {
      id: `account_${customerId}`,
      tenantId,
      customerId,
      balance: 0,
      currency: "TRY",
      overdueAmount: 0,
      openOfferCount: 0,
      openOrderCount: 0
    }
  );
}

export function getCustomerContacts(customerId: string): CustomerContact[] {
  return customerContacts.filter((contact) => contact.customerId === customerId);
}

export function getCustomerAddresses(customerId: string): CustomerAddress[] {
  return customerAddresses.filter((address) => address.customerId === customerId);
}

export function getCustomerLedger(customerId: string): CustomerLedgerEntry[] {
  return customerLedgerEntries.filter((entry) => entry.customerId === customerId);
}
