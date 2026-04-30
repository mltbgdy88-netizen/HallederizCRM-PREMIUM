import type { QuickOperationPreviewResponse, QuickOperationSubmitRequest, QuickOperationSubmitResponse } from "@hallederiz/types";
import type { ItemResponse } from "../base";
import { ApiClient } from "../base";

export class QuickOperationsClient {
  constructor(private readonly api: ApiClient) {}

  previewQuickOperation(payload: QuickOperationSubmitRequest) {
    return this.api.post<ItemResponse<QuickOperationPreviewResponse>>("/quick-operations/preview", payload);
  }

  submitQuickOperation(payload: QuickOperationSubmitRequest) {
    return this.api.post<ItemResponse<QuickOperationSubmitResponse>>("/quick-operations/submit", payload);
  }
}
