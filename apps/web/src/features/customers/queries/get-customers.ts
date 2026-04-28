import type { Customer, CustomerAccount, CustomerAddress, CustomerContact, CustomerLedgerEntry } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
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
  if (!dataSourceConfig.useDemoData) {
    const [customersResponse] = await Promise.all([sdk.customers.list()]);

    return {
      customers: customersResponse.items,
      accounts: customerAccounts,
      contacts: customerContacts,
      addresses: customerAddresses,
      ledgerEntries: customerLedgerEntries,
      priceSlots: customerPriceSlots
    };
  }

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
  if (!dataSourceConfig.useDemoData) {
    const [customerResponse, accountResponse, ledgerResponse] = await Promise.all([
      sdk.customers.detail(customerId),
      sdk.customers.accountSummary(customerId),
      sdk.customers.ledger(customerId)
    ]);

    const customer = customerResponse.item ?? null;
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
      account: accountResponse.item ?? null,
      contacts: getCustomerContacts(customer.id),
      addresses: getCustomerAddresses(customer.id),
      ledgerEntries: ledgerResponse.items,
      priceSlots: customerPriceSlots
    };
  }

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
