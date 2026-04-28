import { buildCustomerSearchText } from "@hallederiz/domain";
import type { Customer, CustomerAccount, CustomerContact } from "@hallederiz/types";
import type { CustomerFilters } from "../schemas/customer-filter-schema";

export function filterCustomers(params: {
  customers: Customer[];
  accounts: CustomerAccount[];
  contacts: CustomerContact[];
  filters: CustomerFilters;
}): Customer[] {
  const { customers, accounts, contacts, filters } = params;
  const searchQuery = filters.searchText.trim().toLocaleLowerCase("tr-TR");

  return customers.filter((customer) => {
    const account = accounts.find((item) => item.customerId === customer.id);
    const customerContacts = contacts.filter((item) => item.customerId === customer.id);

    if (searchQuery && !buildCustomerSearchText(customer, customerContacts).includes(searchQuery)) {
      return false;
    }

    if (filters.customerType && customer.type !== filters.customerType) {
      return false;
    }

    if (filters.city && customer.city !== filters.city) {
      return false;
    }

    if (filters.riskLevel && customer.riskLevel !== filters.riskLevel) {
      return false;
    }

    if (filters.priceSlotNo && customer.pricingProfile.selectedPriceSlotNo !== filters.priceSlotNo) {
      return false;
    }

    if (filters.activeState === "active" && !customer.active) {
      return false;
    }

    if (filters.activeState === "inactive" && customer.active) {
      return false;
    }

    if (filters.balanceState === "open_balance" && (!account || account.balance <= 0)) {
      return false;
    }

    if (filters.balanceState === "credit" && (!account || account.balance >= 0)) {
      return false;
    }

    if (filters.balanceState === "zero" && account?.balance !== 0) {
      return false;
    }

    return true;
  });
}
