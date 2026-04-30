import type { QuickOperationSubmitRequest, QuickOperationSubmitResponse } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../lib/data-source";

function resolveCreatedEntityType(operationType: QuickOperationSubmitRequest["operationType"]): QuickOperationSubmitResponse["createdEntityType"] {
  switch (operationType) {
    case "offer":
      return "offer";
    case "sale_order":
      return "order";
    case "delivery":
      return "delivery";
    case "payment":
      return "payment";
    case "return":
      return "return";
    default:
      return undefined;
  }
}

export async function submitQuickOperationRecord(payload: QuickOperationSubmitRequest): Promise<QuickOperationSubmitResponse> {
  if (dataSourceConfig.useDemoData) {
    return {
      ok: true,
      operationType: payload.operationType,
      draftId: `qod_demo_${Date.now()}`,
      createdEntityType: resolveCreatedEntityType(payload.operationType),
      createdEntityId: `foundation_${payload.operationType}_${Date.now()}`,
      createdEntityNo: `QO-DEMO-${String(Date.now()).slice(-6)}`,
      workflowImpacts: [],
      documentIds: [],
      auditEventIds: [],
      validationIssues: [],
      mode: "foundation"
    };
  }

  const response = await sdk.quickOperations.submitQuickOperation(payload);
  return response.item;
}
