import { buildQuickOperationWorkflowImpacts, calculateQuickOperationTotals, validateQuickOperationRequest } from "@hallederiz/domain";
import type {
  Offer,
  OfferLine,
  PaymentReceipt,
  ProductSource,
  QuickOperationLine,
  QuickOperationPreviewResponse,
  QuickOperationSubmitRequest,
  QuickOperationSubmitResponse,
  QuickOperationWorkflowImpact,
  SaleOrder,
  SaleOrderLine
} from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { CommercialCoreService } from "../commercial-core/service";
import { SalesCrmService } from "../sales-crm/service";

const nowIso = () => new Date().toISOString();

function impact(id: string, key: QuickOperationWorkflowImpact["key"], title: string, description: string, severity: QuickOperationWorkflowImpact["severity"]): QuickOperationWorkflowImpact {
  return { id, key, title, description, severity };
}

function mapSourcePreference(sourceType: QuickOperationLine["sourceType"]): SaleOrderLine["sourcePreference"] {
  switch (sourceType) {
    case "center_warehouse":
      return "warehouse";
    case "factory":
      return "factory";
    case "split":
      return "split";
    case "supplier":
    case "auto":
    default:
      return "auto";
  }
}

function mapOfferSourcePreference(sourceType: QuickOperationLine["sourceType"]): ProductSource {
  switch (sourceType) {
    case "center_warehouse":
      return "warehouse";
    case "factory":
      return "factory";
    case "supplier":
    case "split":
    case "auto":
    default:
      return "hybrid";
  }
}

export class QuickOperationsService {
  private readonly commercialService: CommercialCoreService;
  private readonly salesCrmService: SalesCrmService;

  constructor(private readonly context: RequestContext) {
    this.commercialService = new CommercialCoreService(context);
    this.salesCrmService = new SalesCrmService(context);
  }

  previewQuickOperation(request: QuickOperationSubmitRequest): QuickOperationPreviewResponse {
    const validationIssues = validateQuickOperationRequest(request);
    if (request.operationType === "payment") {
      const paymentAmount = request.paidAmount ?? calculateQuickOperationTotals(request.lines).grandTotal;
      if (paymentAmount <= 0) {
        validationIssues.push({
          code: "payment_amount_required",
          field: "paidAmount",
          message: "Tahsilat islemi icin odeme tutari sifirdan buyuk olmalidir.",
          level: "error"
        });
      }
    }

    const totals = calculateQuickOperationTotals(request.lines);
    const workflowImpacts = this.buildImpacts(request, buildQuickOperationWorkflowImpacts(request.operationType, request.lines));

    return {
      ok: validationIssues.every((issue) => issue.level !== "error"),
      operationType: request.operationType,
      totals,
      workflowImpacts,
      validationIssues
    };
  }

  async submitQuickOperation(request: QuickOperationSubmitRequest): Promise<QuickOperationSubmitResponse> {
    const preview = this.previewQuickOperation(request);
    const now = Date.now();
    const base: QuickOperationSubmitResponse = {
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

    if (!preview.ok) {
      return base;
    }

    switch (request.operationType) {
      case "offer":
        return this.executeOffer(request, base);
      case "sale_order":
        return this.executeSaleOrder(request, base);
      case "payment":
        return this.executePayment(request, base);
      case "delivery":
        return {
          ...base,
          workflowImpacts: [
            ...preview.workflowImpacts,
            impact("impact_delivery_pending", "delivery_execution_pending", "Teslim execution sonraki turda", "Teslim olusturma bu turda foundation olarak birakildi.", "warning")
          ],
          mode: "foundation"
        };
      case "return":
        return {
          ...base,
          workflowImpacts: [
            ...preview.workflowImpacts,
            impact("impact_return_review", "return_review_required", "Iade inceleme bekliyor", "Iade execution sonraki turda tam baglanacaktir.", "warning")
          ],
          mode: "foundation"
        };
      default:
        return base;
    }
  }

  private async executeOffer(request: QuickOperationSubmitRequest, base: QuickOperationSubmitResponse): Promise<QuickOperationSubmitResponse> {
    const offerPayload: Partial<Offer> = {
      customerId: request.customerId as Offer["customerId"],
      note: request.note,
      status: "draft",
      createdBy: this.context.userId as Offer["createdBy"],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      validUntil: nowIso(),
      lines: request.lines.map(
        (line, index) =>
          ({
            id: `offer_line_qo_${Date.now()}_${index}`,
            offerId: "offer_new" as OfferLine["offerId"],
            productId: (line.productId ?? line.productCode) as OfferLine["productId"],
            productCode: line.productCode,
            productName: line.productName,
            quantity: line.quantity,
            priceSlotNo: 1,
            priceSlotLabelSnapshot: "Fiyat Alani 1",
            unitPrice: line.unitPrice,
            currency: "TRY",
            exchangeRate: 1,
            discountPercent: line.discountRate ?? 0,
            lineTotal: line.lineTotal,
            sourcePreference: mapOfferSourcePreference(line.sourceType),
            centerStockSnapshot: 0,
            factoryStockSnapshot: 0,
            priceOverride: false
          }) satisfies OfferLine
      )
    };

    const created = await this.salesCrmService.createOffer(offerPayload);
    return {
      ...base,
      ok: true,
      mode: "executed",
      createdEntityType: "offer",
      createdEntityId: created.id,
      createdEntityNo: created.offerNo,
      workflowImpacts: [
        ...base.workflowImpacts,
        impact("impact_offer_created", "offer_created", "Teklif olusturuldu", `${created.offerNo} kaydi olusturuldu.`, "success"),
        impact("impact_offer_doc", "document_preview_available", "Belge onizleme hazir", "Belge onizleme aksiyonu sonraki adimda baglanacaktir.", "info"),
        impact("impact_offer_wa", "whatsapp_draft_available", "WhatsApp taslagi hazir", "WhatsApp taslak gonderimi sonraki adimda baglanacaktir.", "info")
      ]
    };
  }

  private async executeSaleOrder(request: QuickOperationSubmitRequest, base: QuickOperationSubmitResponse): Promise<QuickOperationSubmitResponse> {
    const orderPayload: Partial<SaleOrder> = {
      customerId: request.customerId as SaleOrder["customerId"],
      note: request.note,
      status: "draft",
      paymentStatus: "unpaid",
      deliveryStatus: "none",
      channel: "field",
      deliveryType: "warehouse",
      source: "manual",
      createdBy: this.context.userId as SaleOrder["createdBy"],
      lines: request.lines.map(
        (line, index) =>
          ({
            id: `order_line_qo_${Date.now()}_${index}`,
            orderId: "order_new" as SaleOrderLine["orderId"],
            productId: (line.productId ?? line.productCode) as SaleOrderLine["productId"],
            productCode: line.productCode,
            productName: line.productName,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            currency: "TRY",
            exchangeRate: 1,
            tlUnitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
            tlLineTotal: line.lineTotal,
            priceSlotNo: 1,
            priceSlotLabelSnapshot: "Fiyat Alani 1",
            sourcePreference: mapSourcePreference(line.sourceType),
            centerStockSnapshot: 0,
            factoryStockSnapshot: 0,
            preparedQuantity: 0,
            deliveredQuantity: 0
          }) satisfies SaleOrderLine
      )
    };

    const created = await this.commercialService.createOrder(orderPayload);
    return {
      ...base,
      ok: true,
      mode: "executed",
      createdEntityType: "order",
      createdEntityId: created.id,
      createdEntityNo: created.orderNo
    };
  }

  private async executePayment(request: QuickOperationSubmitRequest, base: QuickOperationSubmitResponse): Promise<QuickOperationSubmitResponse> {
    const totals = calculateQuickOperationTotals(request.lines);
    const amount = request.paidAmount ?? totals.grandTotal;
    const paymentPayload: Partial<PaymentReceipt> = {
      customerId: request.customerId as PaymentReceipt["customerId"],
      amount,
      currency: "TRY",
      method: "transfer",
      status: "draft",
      description: request.note ?? "Hizli Islem Merkezi tahsilat kaydi",
      createdBy: this.context.userId as PaymentReceipt["createdBy"],
      receivedAt: nowIso()
    };

    const created = await this.commercialService.createPayment(paymentPayload);
    return {
      ...base,
      ok: true,
      mode: "executed",
      createdEntityType: "payment",
      createdEntityId: created.id,
      createdEntityNo: created.receiptNo,
      workflowImpacts: [
        ...base.workflowImpacts,
        impact("impact_payment_recorded", "payment_recorded", "Tahsilat kaydi olustu", `${created.receiptNo} tahsilat kaydi olusturuldu.`, "success"),
        impact("impact_payment_allocation", "payment_allocation_required", "Allocation adimi gerekli", "Tahsilat kaydi olustu, allocation adimi sonraki turda derinlestirilecektir.", "warning")
      ]
    };
  }

  private buildImpacts(request: QuickOperationSubmitRequest, defaultImpacts: QuickOperationWorkflowImpact[]): QuickOperationWorkflowImpact[] {
    if (request.operationType !== "sale_order") {
      return defaultImpacts;
    }

    const extraImpacts: QuickOperationWorkflowImpact[] = [];
    if (request.lines.some((line) => line.sourceType === "center_warehouse")) {
      extraImpacts.push(
        impact("impact_qo_wh", "warehouse_prepare", "Depo hazirlik etkisi", "Merkez depo kaynakli satirlar icin depo hazirlik etkisi olusur.", "info")
      );
    }
    if (request.lines.some((line) => line.sourceType === "factory")) {
      extraImpacts.push(impact("impact_qo_factory", "factory_plan", "Fabrika plan etkisi", "Fabrika kaynakli satirlar icin fabrika plani olusur.", "info"));
    }
    if (request.lines.some((line) => line.sourceType === "supplier")) {
      extraImpacts.push(
        impact("impact_qo_supplier", "supplier_procurement", "Tedarik etkisi", "Tedarikci kaynakli satirlar procurement takibine dusurulur.", "warning")
      );
    }
    if (request.lines.some((line) => line.sourceType === "split" || line.sourceType === "auto")) {
      extraImpacts.push(
        impact("impact_qo_source_plan", "sale_order_source_plan", "Kaynak planlama etkisi", "Split/auto satirlar kaynak planlama adimina dahil edilir.", "info")
      );
    }

    return [...defaultImpacts, ...extraImpacts];
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
