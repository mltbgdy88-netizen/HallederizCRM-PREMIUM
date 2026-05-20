import {
  buildQuickOperationAiInsight,
  buildQuickOperationDocumentPreview,
  buildQuickOperationWhatsappDraft,
  buildQuickOperationWorkflowImpacts,
  calculateQuickOperationTotals,
  validateQuickOperationRequest
} from "@hallederiz/domain";
import type {
  Delivery,
  DeliveryLine,
  Offer,
  OfferLine,
  PaymentReceipt,
  ProductSource,
  QuickOperationLine,
  QuickOperationPreviewResponse,
  QuickOperationSubmitRequest,
  QuickOperationSubmitResponse,
  QuickOperationWorkflowImpact,
  Return,
  ReturnLine,
  SaleOrder,
  SaleOrderLine
} from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { resolvePendingApprovalRepository } from "../../shared/approval-repository-runtime";
import { evaluatePolicyEngineForContext } from "../../shared/policy-engine-runtime";
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
      workflowImpacts: preview.workflowImpacts,
      documentIds: [],
      auditEventIds: [],
      validationIssues: preview.validationIssues,
      mode: "foundation"
    };

    if (!preview.ok) {
      return this.withSideActions(request, base);
    }

    const approvalQueued = await this.queueForApprovalIfRequired(request, preview);
    if (approvalQueued) {
      return this.withSideActions(request, approvalQueued);
    }

    switch (request.operationType) {
      case "offer":
        return this.executeOffer(request, base);
      case "sale_order":
        return this.executeSaleOrder(request, base);
      case "payment":
        return this.executePayment(request, base);
      case "delivery":
        return this.executeDelivery(request, base);
      case "return":
        return this.executeReturn(request, base);
      default:
        return this.withSideActions(request, base);
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
    return this.withSideActions(request, {
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
    });
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
    return this.withSideActions(request, {
      ...base,
      ok: true,
      mode: "executed",
      createdEntityType: "order",
      createdEntityId: created.id,
      createdEntityNo: created.orderNo
    });
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
    return this.withSideActions(request, {
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
    });
  }

  private async executeDelivery(request: QuickOperationSubmitRequest, base: QuickOperationSubmitResponse): Promise<QuickOperationSubmitResponse> {
    if (!request.orderId) {
      return this.withSideActions(request, {
        ...base,
        mode: "foundation",
        validationIssues: [
          ...(base.validationIssues ?? []),
          {
            code: "delivery_reference_required",
            field: "orderId",
            message: "Teslim kaydi icin siparis referansi gereklidir.",
            level: "error"
          }
        ],
        workflowImpacts: [
          ...base.workflowImpacts,
          impact("impact_delivery_pending", "delivery_execution_pending", "Teslim inceleme bekliyor", "Siparis referansi olmadan teslim execution baslatilamaz.", "warning")
        ]
      });
    }

    try {
      const deliveryPayload: Partial<Delivery> = {
        orderId: request.orderId as Delivery["orderId"],
        customerId: request.customerId as Delivery["customerId"],
        status: "pending",
        note: request.note,
        plannedAt: nowIso(),
        documentStatus: "missing",
        lines: request.lines.map(
          (line, index) =>
            ({
              id: `delivery_line_qo_${Date.now()}_${index}`,
              deliveryId: "delivery_new" as DeliveryLine["deliveryId"],
              orderLineId: `order_line_qo_${line.id}`,
              productId: (line.productId ?? line.productCode) as DeliveryLine["productId"],
              productCode: line.productCode,
              productName: line.productName,
              orderedQuantity: line.quantity,
              preparedQuantity: line.quantity,
              deliveredQuantity: line.quantity
            }) satisfies DeliveryLine
        )
      };

      const created = await this.commercialService.createDelivery(deliveryPayload);
      return this.withSideActions(request, {
        ...base,
        ok: true,
        mode: "executed",
        createdEntityType: "delivery",
        createdEntityId: created.id,
        createdEntityNo: created.deliveryNo,
        workflowImpacts: [
          ...base.workflowImpacts,
          impact("impact_delivery_created", "delivery_execution_pending", "Teslim kaydi olusturuldu", `${created.deliveryNo} teslim kaydi olusturuldu.`, "success"),
          impact("impact_delivery_wh_check", "warehouse_preparation_check", "Depo hazirlik kontrolu", "Depo hazirlik emri ve satir uygunlugu kontrol edilmelidir.", "warning"),
          impact("impact_delivery_payment_check", "payment_status_check", "Odeme durumu kontrolu", "Teslim oncesi odeme ve approval durumlari tekrar gozden gecirilmelidir.", "warning"),
          impact("impact_delivery_doc_preview", "document_preview_available", "Belge onizleme hazir", "Teslim fisi onizleme taslagi olusturuldu.", "info")
        ]
      });
    } catch (error) {
      return this.withSideActions(request, {
        ...base,
        mode: "foundation",
        workflowImpacts: [
          ...base.workflowImpacts,
          impact("impact_delivery_pending", "delivery_execution_pending", "Teslim execution foundation modda", "Teslim kaydi olusturulamadi, inceleme modunda taslak olusturuldu.", "warning")
        ],
        validationIssues: [
          ...(base.validationIssues ?? []),
          {
            code: "delivery_execution_unavailable",
            field: "operationType",
            message: error instanceof Error ? error.message : "Teslim execution su an tamamlanamadi.",
            level: "warning"
          }
        ]
      });
    }
  }

  private async executeReturn(request: QuickOperationSubmitRequest, base: QuickOperationSubmitResponse): Promise<QuickOperationSubmitResponse> {
    try {
      const returnPayload: Partial<Return> = {
        customerId: request.customerId as Return["customerId"],
        orderId: request.orderId as Return["orderId"],
        deliveryId: request.deliveryId as Return["deliveryId"],
        status: "draft",
        note: request.reason ?? request.note,
        lines: request.lines.map(
          (line, index) =>
            ({
              id: `return_line_qo_${Date.now()}_${index}`,
              returnId: "return_new" as ReturnLine["returnId"],
              productId: (line.productId ?? line.productCode) as ReturnLine["productId"],
              productCode: line.productCode,
              productName: line.productName,
              quantity: line.quantity,
              reasonCategory: "other",
              note: request.reason ?? request.note
            }) satisfies ReturnLine
        )
      };

      const created = await this.commercialService.createReturn(returnPayload);
      return this.withSideActions(request, {
        ...base,
        ok: true,
        mode: "executed",
        createdEntityType: "return",
        createdEntityId: created.id,
        createdEntityNo: created.returnNo,
        workflowImpacts: [
          ...base.workflowImpacts,
          impact("impact_return_review", "return_review_required", "Iade inceleme akisina alindi", `${created.returnNo} iade kaydi inceleme durumuna alindi.`, "warning"),
          impact("impact_return_approval", "return_approval_may_be_required", "Approval gerekebilir", "Iade miktari ve risk seviyesine gore ek onay adimi tetiklenebilir.", "warning"),
          impact("impact_return_stock_finance", "stock_finance_impact_pending", "Stok/finans etkisi beklemede", "Iade kaydi olustu, stok ve finans etkisi inceleme sonrasi kesinlesecektir.", "info"),
          impact("impact_return_doc_preview", "document_preview_available", "Belge onizleme hazir", "Iade talebi onizleme taslagi olusturuldu.", "info")
        ]
      });
    } catch (error) {
      return this.withSideActions(request, {
        ...base,
        mode: "foundation",
        workflowImpacts: [
          ...base.workflowImpacts,
          impact("impact_return_review", "return_review_required", "Iade inceleme bekliyor", "Iade kaydi olusturulamadi, inceleme/foundation modunda taslak uretildi.", "warning"),
          impact("impact_return_approval", "return_approval_may_be_required", "Approval gerekebilir", "Iade talebinin onay akisina alinmasi onerilir.", "warning")
        ],
        validationIssues: [
          ...(base.validationIssues ?? []),
          {
            code: "return_execution_unavailable",
            field: "operationType",
            message: error instanceof Error ? error.message : "Iade execution su an tamamlanamadi.",
            level: "warning"
          }
        ]
      });
    }
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

  private resolveQuickOperationActionKey(operationType: QuickOperationSubmitRequest["operationType"]): string {
    switch (operationType) {
      case "offer":
        return "platform.offers.create";
      case "sale_order":
        return "platform.orders.create";
      case "payment":
        return "platform.payments.create";
      case "delivery":
        return "platform.ai.propose";
      case "return":
        return "platform.ai.propose";
      default:
        return "platform.ai.propose";
    }
  }

  private async queueForApprovalIfRequired(
    request: QuickOperationSubmitRequest,
    preview: QuickOperationPreviewResponse
  ): Promise<QuickOperationSubmitResponse | null> {
    const actionKey = this.resolveQuickOperationActionKey(request.operationType);
    const policyDecision = evaluatePolicyEngineForContext(this.context, {
      actionKey,
      channel: "web",
      source: "web",
      idempotencyKey: `quick_operation.${request.operationType}.${request.customerId}.${Date.now()}`,
      metadata: {
        route: "quick-operations.submit",
        operationType: request.operationType,
        customerId: request.customerId
      }
    });

    if (policyDecision.effect !== "require_approval") {
      return null;
    }

    const approvalRuntime = resolvePendingApprovalRepository(this.context);
    if (!approvalRuntime.repository) {
      return {
        ok: true,
        operationType: request.operationType,
        draftId: `qod_${Date.now()}`,
        workflowImpacts: [
          ...preview.workflowImpacts,
          impact(
            "impact_qo_approval_pending",
            "return_review_required",
            "Onay kaydı bekleniyor",
            "Onay deposu bu ortamda hazır değil; işlem canlı bağlantı kurulduğunda onaya gönderilecek.",
            "warning"
          )
        ],
        documentIds: [],
        auditEventIds: [],
        validationIssues: preview.validationIssues,
        mode: "foundation"
      };
    }

    const totals = calculateQuickOperationTotals(request.lines);
    const pending = await approvalRuntime.repository.createPendingApprovalRequest({
      tenantId: this.context.tenantId,
      actorId: this.context.userId,
      actionKey,
      reasons: policyDecision.reasons,
      payload: {
        source: "quick-operations.submit",
        operationType: request.operationType,
        customerId: request.customerId,
        customerName: request.customerName,
        note: request.note,
        lines: request.lines,
        totals,
        orderId: request.orderId,
        deliveryId: request.deliveryId
      },
      idempotencyKey: `quick_operation.${request.operationType}.${request.customerId}.${Date.now()}`,
      requestedAt: nowIso(),
      auditRequired: policyDecision.auditPolicy?.auditRequired ?? true,
      timelineRequired: policyDecision.auditPolicy?.timelineRequired ?? true
    });

    return {
      ok: true,
      operationType: request.operationType,
      draftId: `qod_${Date.now()}`,
      approvalId: pending.approvalRequestId,
      workflowImpacts: [
        ...preview.workflowImpacts,
        impact(
          "impact_qo_approval_created",
          "return_review_required",
          "Onay kaydı oluşturuldu",
          "İşlem onay kuyruğuna alındı; onay sonrası kayıt işlenecek.",
          "warning"
        )
      ],
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

  private withSideActions(request: QuickOperationSubmitRequest, response: QuickOperationSubmitResponse): QuickOperationSubmitResponse {
    return {
      ...response,
      sideActions: {
        documentPreview: buildQuickOperationDocumentPreview(request, response),
        whatsappDraft: buildQuickOperationWhatsappDraft(request, response),
        aiInsight: buildQuickOperationAiInsight(request)
      }
    };
  }
}
