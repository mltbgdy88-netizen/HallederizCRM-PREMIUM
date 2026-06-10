import type { Customer, CustomerAccount } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";
import { isCustomerFinanceLinked } from "./customer-finance";

export async function fetchCustomerAccountSummary(customerId: string): Promise<CustomerAccount | null> {
  try {
    const response = await sdk.customers.accountSummary(customerId);
    const account = response.item ?? null;
    return isCustomerFinanceLinked(account) ? account : null;
  } catch {
    return null;
  }
}

/** Production listesi için cari başına hesap özeti; hata tek cariyi düşürmez. */
export async function loadProductionCustomerAccounts(customers: Customer[]): Promise<CustomerAccount[]> {
  if (!customers.length) {
    return [];
  }

  const results = await Promise.all(customers.map((customer) => fetchCustomerAccountSummary(customer.id)));
  return results.filter((account): account is CustomerAccount => account !== null);
}

