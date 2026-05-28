import {
  buildQuickOperationAiInsight,
  buildQuickOperationDocumentPreview,
  buildQuickOperationWhatsappDraft,
  buildQuickOperationWorkflowImpacts,
  calculateQuickOperationTotals,
  deriveOrderPaymentStatus,
  deriveOrderPaymentStatusFromAmount,
  resolveQuickOperationPayment,
  validateQuickOperationRequest,
  type ResolvedQuickOperationPayment
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
    const totals = calculateQuickOperationTotals(request.lines);
    const resolvedPayment = resolveQuickOperationPayment(request);
    if (resolvedPayment.enabled && resolvedPayment.amount > 0) {
      totals.paidAmount = resolvedPayment.amount;
      totals.remainingAmount = Math.max(0, totals.grandTotal - resolvedPayment.amount);
    }
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

  private buildPaymentDescription(request: QuickOperationSubmitRequest, order?: SaleOrder): string {
    const resolved = resolveQuickOperationPayment(request);
    const note = resolved.note ?? request.note;
    if (order) {
      return note?.trim() ? `${note.trim()} · ${order.orderNo}` : `Hızlı İşlem · ${order.orderNo}`;
    }
    return note?.trim() ? note.trim() : "Hızlı İşlem tahsilat kaydı";
  }

  private async recordPaymentForOrder(
    request: QuickOperationSubmitRequest,
    order: SaleOrder,
    resolved: ResolvedQuickOperationPayment
  ): Promise<PaymentReceipt> {
    const paymentPayload: Partial<PaymentReceipt> = {
      customerId: order.customerId,
      amount: resolved.amount,
      currency: order.currency,
      method: resolved.method,
      status: "draft",
      description: this.buildPaymentDescription(request, order),
      referenceNo: resolved.referenceNo,
      createdBy: this.context.userId as PaymentReceipt["createdBy"],
      receivedAt: resolved.receivedAt
    };
    return this.commercialService.createPayment(paymentPayload);
  }

  private async applyOrderPaymentTotals(order: SaleOrder, paidAmount: number): Promise<SaleOrder> {
    const paymentStatus = deriveOrderPaymentStatusFromAmount(order.grandTotal, paidAmount);
    const patched = await this.commercialService.patchOrder(order.id, {
      paidTotal: paidAmount,
      paymentStatus
    });
    return patched ?? order;
  }

  private async executeSaleOrder(request: QuickOperationSubmitRequest, base: QuickOperationSubmitResponse): Promise<QuickOperationSubmitResponse> {
    const resolvedPayment = resolveQuickOperationPayment(request);
    const orderPayload: Partial<SaleOrder> = {
      customerId: request.customerId as SaleOrder["customerId"],
      note: request.note,
      status: "draft",
      paymentStatus: resolvedPayment.enabled && resolvedPayment.amount > 0 ? "partial" : "unpaid",
      paidTotal: resolvedPayment.enabled ? resolvedPayment.amount : 0,
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
    let updatedOrder = created;
    let createdPayment: PaymentReceipt | undefined;
    const extraImpacts: QuickOperationWorkflowImpact[] = [
      impact("impact_order_created", "sale_order_source_plan", "Sipariş hazırlandı", `${created.orderNo} sipariş kaydı hazırlandı.`, "success")
    ];

    if (resolvedPayment.enabled && resolvedPayment.amount > 0) {
      try {
        createdPayment = await this.recordPaymentForOrder(request, created, resolvedPayment);
        updatedOrder = await this.applyOrderPaymentTotals(created, resolvedPayment.amount);
        extraImpacts.push(
          impact(
            "impact_payment_recorded",
            "payment_recorded",
            "Tahsilat kaydı hazırlandı",
            `${createdPayment.receiptNo} tahsilat kaydı sipariş ile birlikte hazırlandı.`,
            "success"
          )
        );
        if (resolvedPayment.allocateToOrder) {
          extraImpacts.push(
            impact(
              "impact_payment_linked",
              "payment_status_check",
              "Tahsilat siparişe bağlandı",
              `${created.orderNo} siparişi için tahsilat eşleştirmesi tamamlandı.`,
              "info"
            )
          );
        }
      } catch (error) {
        return this.withSideActions(request, {
          ...base,
          ok: false,
          mode: "executed",
          createdEntityType: "order",
          createdEntityId: created.id,
          createdEntityNo: created.orderNo,
          orderPaymentStatus: "unpaid",
          paymentRecorded: false,
          workflowImpacts: [
            ...base.workflowImpacts,
            ...extraImpacts,
            impact(
              "impact_payment_failed",
              "payment_allocation_required",
              "Tahsilat tamamlanamadı",
              "Sipariş hazırlandı; tahsilat kaydı oluşturulamadı. Tahsilat ekranından tekrar deneyin.",
              "warning"
            )
          ],
          validationIssues: [
            ...(base.validationIssues ?? []),
            {
              code: "payment_create_failed",
              field: "payment",
              message: error instanceof Error ? error.message : "Tahsilat kaydı tamamlanamadı.",
              level: "error"
            }
          ]
        });
      }
    }

    const orderPaymentStatus = deriveOrderPaymentStatus(updatedOrder, createdPayment?.allocations ?? []);

    return this.withSideActions(request, {
      ...base,
      ok: true,
      mode: "executed",
      createdEntityType: "order",
      createdEntityId: created.id,
      createdEntityNo: created.orderNo,
      createdPaymentId: createdPayment?.id,
      createdPaymentNo: createdPayment?.receiptNo,
      orderPaymentStatus,
      paymentRecorded: Boolean(createdPayment),
      workflowImpacts: [...base.workflowImpacts, ...extraImpacts]
    });
  }

  private async executePayment(request: QuickOperationSubmitRequest, base: QuickOperationSubmitResponse): Promise<QuickOperationSubmitResponse> {
    const totals = calculateQuickOperationTotals(request.lines);
    const resolved = resolveQuickOperationPayment(request);
    const amount = resolved.enabled ? resolved.amount : request.paidAmount ?? totals.grandTotal;
    const paymentPayload: Partial<PaymentReceipt> = {
      customerId: request.customerId as PaymentReceipt["customerId"],
      amount,
      currency: "TRY",
      method: resolved.method,
      status: "draft",
      description: this.buildPaymentDescription(request),
      referenceNo: resolved.referenceNo,
      createdBy: this.context.userId as PaymentReceipt["createdBy"],
      receivedAt: resolved.receivedAt ?? nowIso()
    };

    const created = await this.commercialService.createPayment(paymentPayload);
    const linkedOrderId = request.orderId?.trim();
    let allocationImpacts: QuickOperationWorkflowImpact[] = [
      impact("impact_payment_recorded", "payment_recorded", "Tahsilat kaydı hazırlandı", `${created.receiptNo} tahsilat kaydı hazırlandı.`, "success")
    ];

    if (linkedOrderId) {
      const order = await this.commercialService.getOrder(linkedOrderId);
      if (order && resolved.allocateToOrder !== false) {
        const nextPaid = Math.min(order.grandTotal, order.paidTotal + amount);
        await this.commercialService.patchOrder(order.id, {
          paidTotal: nextPaid,
          paymentStatus: deriveOrderPaymentStatusFromAmount(order.grandTotal, nextPaid)
        });
        allocationImpacts = [
          ...allocationImpacts,
          impact(
            "impact_payment_linked",
            "payment_status_check",
            "Siparişe bağlandı",
            `${order.orderNo} siparişi ile tahsilat eşleştirildi.`,
            "info"
          )
        ];
      } else if (order) {
        allocationImpacts.push(
          impact(
            "impact_payment_allocation",
            "payment_allocation_required",
            "Eşleştirme gerekli",
            "Tahsilat kaydı hazırlandı; sipariş eşleştirmesini kontrol edin.",
            "warning"
          )
        );
      } else {
        allocationImpacts.push(
          impact(
            "impact_payment_allocation",
            "payment_allocation_required",
            "Eşleştirme gerekli",
            "Tahsilat kaydı hazırlandı; açık sipariş veya fatura eşleştirmesi yapılmalıdır.",
            "warning"
          )
        );
      }
    } else {
      allocationImpacts.push(
        impact(
          "impact_payment_allocation",
          "payment_allocation_required",
          "Eşleştirme gerekli",
          "Tahsilat kaydı hazırlandı; açık sipariş veya fatura eşleştirmesi yapılmalıdır.",
          "warning"
        )
      );
    }

    return this.withSideActions(request, {
      ...base,
      ok: true,
      mode: "executed",
      createdEntityType: "payment",
      createdEntityId: created.id,
      createdEntityNo: created.receiptNo,
      paymentRecorded: true,
      workflowImpacts: [...base.workflowImpacts, ...allocationImpacts]
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
    const resolvedPayment = resolveQuickOperationPayment(request);
    if (resolvedPayment.enabled && resolvedPayment.amount > 0) {
      extraImpacts.push(
        impact(
          "impact_qo_payment_preview",
          "payment_recorded",
          "Tahsilat planlandı",
          resolvedPayment.amount >= calculateQuickOperationTotals(request.lines).grandTotal
            ? "Tam tahsilat sipariş ile birlikte işlenecek."
            : "Kısmi tahsilat sipariş ile birlikte işlenecek.",
          "info"
        )
      );
    }
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
        deliveryId: request.deliveryId,
        paidAmount: request.paidAmount,
        payment: request.payment,
        paymentMethod: request.paymentMethod,
        paymentReceivedAt: request.paymentReceivedAt,
        paymentReferenceNo: request.paymentReferenceNo,
        paymentNote: request.paymentNote,
        allocatePaymentToOrder: request.allocatePaymentToOrder
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
