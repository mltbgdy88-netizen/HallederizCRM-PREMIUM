import { buildQuickOperationWorkflowImpacts, calculateQuickOperationTotals, validateQuickOperationRequest } from "@hallederiz/domain";
import type { QuickOperationPreviewResponse, QuickOperationSubmitRequest, QuickOperationSubmitResponse } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";

export class QuickOperationsService {
  constructor(private readonly _context: RequestContext) {}

  previewQuickOperation(request: QuickOperationSubmitRequest): QuickOperationPreviewResponse {
    const validationIssues = validateQuickOperationRequest(request);
    const totals = calculateQuickOperationTotals(request.lines);
    const workflowImpacts = buildQuickOperationWorkflowImpacts(request.operationType, request.lines);

    return {
      ok: validationIssues.every((issue) => issue.level !== "error"),
      operationType: request.operationType,
      totals,
      workflowImpacts,
      validationIssues
    };
  }

  submitQuickOperation(request: QuickOperationSubmitRequest): QuickOperationSubmitResponse {
    const preview = this.previewQuickOperation(request);
    const now = Date.now();

    return {
      ok: preview.ok,
      operationType: request.operationType,
      draftId: `qod_${now}`,
      createdEntityType: this.resolveCreatedEntityType(request.operationType),
      createdEntityId: `foundation_${request.operationType}_${now}`,
      createdEntityNo: `QO-${new Date().getFullYear()}-${String(now).slice(-6)}`,
      workflowImpacts: preview.workflowImpacts,
      documentIds: [],
      auditEventIds: [],
      validationIssues: preview.validationIssues,
      mode: "foundation"
    };
  }

  private resolveCreatedEntityType(operationType: QuickOperationSubmitRequest["operationType"]): QuickOperationSubmitResponse["createdEntityType"] {
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
}
