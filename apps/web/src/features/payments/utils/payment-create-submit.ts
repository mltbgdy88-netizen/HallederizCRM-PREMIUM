import type { PaymentMethod } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";
import { submitQuickOperationRecord } from "../../../services/api/quick-operations.service";
import {
  mapSubmitActionError,
  resolveSubmitFeedback
} from "../../quick-operations/utils/quick-operation-submit-feedback";
import {
  extractApprovalRequestId,
  extractPaymentIdFromCreateResponse,
  isPaymentApprovalResponse,
  mapPaymentCreateApiError,
  PAYMENT_CREATE_MSG
} from "./payment-create-feedback";

export type PaymentCreateSubmitMode = "save" | "draft";

export type PaymentCreateSubmitInput = {
  customerId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  receivedAt: string;
  referenceNo: string;
  accountingRef: string;
  note: string;
  idempotencyKey: string;
  mode: PaymentCreateSubmitMode;
};

export type PaymentCreateSubmitSuccess =
  | { outcome: "created"; paymentId: string; toast: string }
  | { outcome: "approval"; approvalRequestId?: string; toast: string }
  | { outcome: "demo_blocked"; toast: string };

export type PaymentCreateSubmitFailure = {
  outcome: "error";
  toast: string;
  rotateIdempotencyKey: boolean;
};

export type PaymentCreateSubmitResult = PaymentCreateSubmitSuccess | PaymentCreateSubmitFailure;

function buildDescription(input: PaymentCreateSubmitInput): string {
  const note = input.note.trim();
  const accountingRef = input.accountingRef.trim();
  if (accountingRef && note) {
    return `İşlem ref: ${accountingRef}. ${note}`;
  }
  if (accountingRef) {
    return `İşlem ref: ${accountingRef}`;
  }
  if (note) {
    return note;
  }
  return "Tahsilat girişi";
}

export async function submitPaymentCreate(input: PaymentCreateSubmitInput): Promise<PaymentCreateSubmitResult> {
  const receivedAtIso = `${input.receivedAt}T12:00:00.000Z`;
  const description = buildDescription(input);
  const referenceNo = input.referenceNo.trim() || undefined;
  const draftToast = input.mode === "draft" ? PAYMENT_CREATE_MSG.DRAFT_READY : PAYMENT_CREATE_MSG.CREATED;

  if (input.orderId) {
    try {
      const result = await submitQuickOperationRecord(
        {
          operationType: "payment",
          customerId: input.customerId,
          orderId: input.orderId,
          note: input.note.trim() || undefined,
          paidAmount: input.amount,
          payment: {
            enabled: true,
            amount: input.amount,
            method: input.method,
            receivedAt: receivedAtIso,
            referenceNo,
            note: input.note.trim() || undefined,
            allocateToOrder: true
          },
          lines: []
        },
        { idempotencyKey: input.idempotencyKey }
      );

      if (result.mode === "queued_for_approval" || result.approvalId?.trim()) {
        return {
          outcome: "approval",
          approvalRequestId: result.approvalId,
          toast: PAYMENT_CREATE_MSG.APPROVAL_QUEUED
        };
      }

      const paymentId = result.createdPaymentId ?? result.createdEntityId;
      if (result.ok && paymentId) {
        return { outcome: "created", paymentId, toast: draftToast };
      }

      const feedback = resolveSubmitFeedback(result, { useDemoData: false, operationType: "payment" });
      return {
        outcome: "error",
        toast: feedback.toast,
        rotateIdempotencyKey: true
      };
    } catch (error) {
      return {
        outcome: "error",
        toast: mapSubmitActionError(error),
        rotateIdempotencyKey: true
      };
    }
  }

  try {
    const response = await sdk.payments.create(
      {
        customerId: input.customerId,
        amount: input.amount,
        currency: "TRY",
        method: input.method,
        status: "draft",
        description,
        referenceNo,
        receivedAt: receivedAtIso
      },
      { idempotencyKey: input.idempotencyKey }
    );

    const body = response as unknown;
    if (isPaymentApprovalResponse(body)) {
      return {
        outcome: "approval",
        approvalRequestId: extractApprovalRequestId(body),
        toast: PAYMENT_CREATE_MSG.APPROVAL_QUEUED
      };
    }

    const paymentId = extractPaymentIdFromCreateResponse(body);
    if (paymentId) {
      return { outcome: "created", paymentId, toast: draftToast };
    }

    return {
      outcome: "error",
      toast: PAYMENT_CREATE_MSG.GENERIC_FAIL,
      rotateIdempotencyKey: true
    };
  } catch (error) {
    const mapped = mapPaymentCreateApiError(error);
    return {
      outcome: "error",
      toast: mapped.message,
      rotateIdempotencyKey: mapped.rotateKey
    };
  }
}
