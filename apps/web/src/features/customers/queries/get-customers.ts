import type { Customer, CustomerAccount, CustomerAddress, CustomerContact, CustomerLedgerEntry } from "@hallederiz/types";
import {
  customerAccounts,
  customerAddresses,
  customerContacts,
  customerLedgerEntries,
  customerPriceSlots,
  customers,
  getCustomerAccount,
  getCustomerAddresses,
  getCustomerById,
  getCustomerContacts,
  getCustomerLedger
} from "./customer-mock-data";

export interface CustomersQueryResult {
  customers: Customer[];
  accounts: CustomerAccount[];
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  ledgerEntries: CustomerLedgerEntry[];
  priceSlots: typeof customerPriceSlots;
}

export interface CustomerDetailQueryResult {
  customer: Customer | null;
  account: CustomerAccount | null;
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  ledgerEntries: CustomerLedgerEntry[];
  priceSlots: typeof customerPriceSlots;
}

export async function getCustomers(): Promise<CustomersQueryResult> {
  return {
    customers,
    accounts: customerAccounts,
    contacts: customerContacts,
    addresses: customerAddresses,
    ledgerEntries: customerLedgerEntries,
    priceSlots: customerPriceSlots
  };
}

export async function getCustomerDetail(customerId: string): Promise<CustomerDetailQueryResult> {
  const customer = getCustomerById(customerId) ?? null;

  if (!customer) {
    return {
      customer: null,
      account: null,
      contacts: [],
      addresses: [],
      ledgerEntries: [],
      priceSlots: customerPriceSlots
    };
  }

  return {
    customer,
    account: getCustomerAccount(customer.id),
    contacts: getCustomerContacts(customer.id),
    addresses: getCustomerAddresses(customer.id),
    ledgerEntries: getCustomerLedger(customer.id),
    priceSlots: customerPriceSlots
  };
}
