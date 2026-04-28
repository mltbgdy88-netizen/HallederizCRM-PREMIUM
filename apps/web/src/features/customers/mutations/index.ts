import type { Customer, CustomerPricingProfile } from "@hallederiz/types";
import { createCustomerRecord, updateCustomerPricingProfile, updateCustomerRecord } from "../../../services/api/customers.service";

export async function createCustomerMutation(payload: Partial<Customer>) {
  return createCustomerRecord(payload);
}

export async function updateCustomerMutation(customerId: string, payload: Partial<Customer>) {
  return updateCustomerRecord(customerId, payload);
}

export async function updateCustomerPricingProfileMutation(customerId: string, payload: Partial<CustomerPricingProfile>) {
  return updateCustomerPricingProfile(customerId, payload);
}
