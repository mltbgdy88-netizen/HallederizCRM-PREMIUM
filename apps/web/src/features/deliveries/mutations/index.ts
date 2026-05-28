import type { Delivery } from "@hallederiz/types";
import {
  completeDeliveryRecord,
  createDeliveryRecord,
  notifyDeliveryCustomerRecord,
  rollbackDeliveryRecord,
  validateDeliveryRecord
} from "../../../services/api/deliveries.service";

export async function createDeliveryMutation(payload: Partial<Delivery>) {
  return createDeliveryRecord(payload);
}

export async function validateDeliveryMutation(deliveryId: string) {
  return validateDeliveryRecord(deliveryId);
}

export async function completeDeliveryMutation(deliveryId: string) {
  return completeDeliveryRecord(deliveryId);
}

export async function rollbackDeliveryMutation(deliveryId: string) {
  return rollbackDeliveryRecord(deliveryId);
}

export async function notifyDeliveryCustomerMutation(deliveryId: string) {
  return notifyDeliveryCustomerRecord(deliveryId);
}
