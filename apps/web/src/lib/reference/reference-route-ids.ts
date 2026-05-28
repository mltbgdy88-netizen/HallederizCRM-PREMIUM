import { demoScenario } from "../../demo/scenario";

/** Demo entity IDs for PREMIUM dynamic routes ↔ Final static mock aliases */
export const REFERENCE_ROUTE_IDS = {
  customerId: demoScenario.primaryCustomerId,
  offerId: demoScenario.primaryOfferId,
  orderId: demoScenario.primaryOrderId,
  paymentId: demoScenario.paymentId,
  invoiceId: demoScenario.invoiceId,
  deliveryId: demoScenario.deliveryId,
  returnId: "return_1",
  documentId: demoScenario.documentId,
  taskId: "task_1",
  approvalId: demoScenario.approvalId,
  factoryOrderId: demoScenario.factoryOrderId,
  warehouseOrderId: demoScenario.warehouseOrderId,
  conversationId: "conv_1"
} as const;
