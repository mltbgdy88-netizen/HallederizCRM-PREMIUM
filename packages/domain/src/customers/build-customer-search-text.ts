import type { Customer, CustomerContact } from "@hallederiz/types";

export function buildCustomerSearchText(customer: Customer, contacts: CustomerContact[] = []): string {
  return [
    customer.code,
    customer.name,
    customer.phone,
    customer.email,
    customer.city,
    customer.taxNumber,
    customer.pricingProfile.priceSlotLabelSnapshot,
    ...contacts.map((contact) => `${contact.fullName} ${contact.phone} ${contact.email ?? ""}`)
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");
}
