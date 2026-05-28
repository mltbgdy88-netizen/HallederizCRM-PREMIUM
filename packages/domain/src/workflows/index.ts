import type { Delivery, Offer, SaleOrder, WorkflowInstance, WorkflowStep, WorkflowStepStatus } from "@hallederiz/types";

function stepStatus(active: boolean, completed: boolean): WorkflowStepStatus {
  if (completed) {
    return "completed";
  }

  return active ? "active" : "pending";
}

function workflowStep({ workflowId, key, title, sortOrder, completed, active, description }: {
  workflowId: string;
  key: string;
  title: string;
  sortOrder: number;
  completed?: boolean;
  active?: boolean;
  description?: string;
}): WorkflowStep {
  return {
    id: `${workflowId}_${key}`,
    workflowId,
    key,
    title,
    description,
    sortOrder,
    status: stepStatus(Boolean(active), Boolean(completed))
  };
}

export function buildOrderWorkflow(order: SaleOrder): WorkflowInstance {
  const workflowId = `workflow_order_${order.id}`;
  const hasWarehouse = order.sourcePlans.some((plan) => plan.warehouseQuantity > 0);
  const hasFactory = order.sourcePlans.some((plan) => plan.factoryQuantity > 0);
  const paid = order.paymentStatus === "paid" || order.paymentStatus === "overpaid";
  const delivered = order.deliveryStatus === "delivered";
  const completed = order.status === "completed";

  const steps = [
    workflowStep({ workflowId, key: "confirm", title: "Siparis onayi", sortOrder: 1, completed: order.status !== "draft", active: order.status === "draft" }),
    workflowStep({ workflowId, key: "source_plan", title: "Kaynak plani", sortOrder: 2, completed: order.sourcePlans.length > 0, active: order.status === "confirmed" }),
    workflowStep({ workflowId, key: "warehouse", title: "Depo hazirlik", sortOrder: 3, completed: !hasWarehouse || ["ready", "partial", "delivered"].includes(order.deliveryStatus), active: hasWarehouse && order.deliveryStatus === "preparing" }),
    workflowStep({ workflowId, key: "factory", title: "Fabrika takip", sortOrder: 4, completed: !hasFactory || order.status !== "waiting_stock", active: hasFactory && order.status === "waiting_stock" }),
    workflowStep({ workflowId, key: "payment", title: "Tahsilat kontrolu", sortOrder: 5, completed: paid, active: !paid }),
    workflowStep({ workflowId, key: "delivery", title: "Teslim", sortOrder: 6, completed: delivered, active: order.deliveryStatus === "ready" || order.deliveryStatus === "partial" }),
    workflowStep({ workflowId, key: "invoice", title: "Fatura ve belge", sortOrder: 7, completed, active: delivered && !completed })
  ];

  const activeStep = steps.find((step) => step.status === "active") ?? steps.find((step) => step.status === "pending");

  return {
    id: workflowId,
    tenantId: order.tenantId,
    workflowNo: `WF-${order.orderNo}`,
    entityType: "order",
    entityId: order.id,
    entityNo: order.orderNo,
    status: completed ? "completed" : "active",
    currentStepKey: activeStep?.key,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    steps
  };
}

export function buildOfferWorkflow(offer: Offer): WorkflowInstance {
  const workflowId = `workflow_offer_${offer.id}`;
  const sent = ["sent", "waiting_response", "approved", "rejected", "expired", "converted"].includes(offer.status);
  const decided = ["approved", "rejected", "expired", "converted"].includes(offer.status);
  const converted = offer.status === "converted";
  const steps = [
    workflowStep({ workflowId, key: "draft", title: "Teklif taslagi", sortOrder: 1, completed: offer.status !== "draft", active: offer.status === "draft" }),
    workflowStep({ workflowId, key: "send", title: "Teklif gonderimi", sortOrder: 2, completed: sent, active: offer.status === "draft" }),
    workflowStep({ workflowId, key: "followup", title: "Follow-up", sortOrder: 3, completed: decided, active: offer.status === "waiting_response" || offer.status === "sent" }),
    workflowStep({ workflowId, key: "decision", title: "Musteri karari", sortOrder: 4, completed: decided, active: !decided && sent }),
    workflowStep({ workflowId, key: "convert", title: "Siparise donusum", sortOrder: 5, completed: converted, active: offer.status === "approved" })
  ];

  const activeStep = steps.find((step) => step.status === "active") ?? steps.find((step) => step.status === "pending");

  return {
    id: workflowId,
    tenantId: offer.tenantId,
    workflowNo: `WF-${offer.offerNo}`,
    entityType: "offer",
    entityId: offer.id,
    entityNo: offer.offerNo,
    status: converted || offer.status === "rejected" || offer.status === "expired" ? "completed" : "active",
    currentStepKey: activeStep?.key,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    steps
  };
}

export function buildDeliveryWorkflow(delivery: Delivery): WorkflowInstance {
  const workflowId = `workflow_delivery_${delivery.id}`;
  const validated = delivery.validation.valid;
  const documentReady = delivery.documentStatus !== "missing";
  const notified = Boolean(delivery.confirmation?.customerNotified);
  const delivered = delivery.status === "delivered";
  const steps = [
    workflowStep({ workflowId, key: "validate", title: "Teslim dogrulama", sortOrder: 1, completed: validated, active: !validated }),
    workflowStep({ workflowId, key: "document", title: "Teslim belgesi", sortOrder: 2, completed: documentReady, active: validated && !documentReady }),
    workflowStep({ workflowId, key: "notify", title: "Musteri bilgilendirme", sortOrder: 3, completed: notified, active: documentReady && !notified }),
    workflowStep({ workflowId, key: "complete", title: "Teslim tamamlama", sortOrder: 4, completed: delivered, active: notified && !delivered })
  ];
  const activeStep = steps.find((step) => step.status === "active") ?? steps.find((step) => step.status === "pending");

  return {
    id: workflowId,
    tenantId: delivery.tenantId,
    workflowNo: `WF-${delivery.deliveryNo}`,
    entityType: "delivery",
    entityId: delivery.id,
    entityNo: delivery.deliveryNo,
    status: delivered ? "completed" : "active",
    currentStepKey: activeStep?.key,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
    steps
  };
}

export function advanceWorkflowStep(workflow: WorkflowInstance, stepId: string, now = new Date().toISOString()): WorkflowInstance {
  const stepIndex = workflow.steps.findIndex((step) => step.id === stepId || step.key === stepId);
  if (stepIndex < 0) {
    return workflow;
  }

  const nextSteps = workflow.steps.map((step, index) => {
    if (index === stepIndex) {
      return { ...step, status: "completed" as const, completedAt: now };
    }

    if (index === stepIndex + 1 && step.status === "pending") {
      return { ...step, status: "active" as const, startedAt: now };
    }

    return step;
  });
  const activeStep = nextSteps.find((step) => step.status === "active");

  return {
    ...workflow,
    status: activeStep ? "active" : "completed",
    currentStepKey: activeStep?.key,
    updatedAt: now,
    steps: nextSteps
  };
}
