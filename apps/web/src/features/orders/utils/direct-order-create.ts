import type { SaleOrder } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";
import { isOfflineLikeError } from "../../../lib/user-facing-data-error";

export type DirectOrderCreateResult =
  | { ok: true; orderId: string; orderNo?: string }
  | { ok: false; message: string; approvalRequestId?: string };

export async function createDirectDraftOrder(input: {
  customerId?: string | null;
  sourceOfferId?: string | null;
  note?: string;
}): Promise<DirectOrderCreateResult> {
  if (input.sourceOfferId) {
    try {
      const response = await sdk.offers.convertToOrder(input.sourceOfferId);
      const body = response as unknown;
      if (typeof body === "object" && body !== null) {
        const approvalRequestId =
          "approvalRequestId" in body && typeof (body as { approvalRequestId?: unknown }).approvalRequestId === "string"
            ? (body as { approvalRequestId: string }).approvalRequestId
            : undefined;
        if (approvalRequestId) {
          return { ok: false, message: "Sipariş dönüşümü onay kuyruğuna alındı.", approvalRequestId };
        }
        const item = "item" in body ? (body as { item?: SaleOrder }).item : undefined;
        if (item?.id) {
          return { ok: true, orderId: item.id, orderNo: item.orderNo };
        }
      }
      return { ok: false, message: "Tekliften sipariş oluşturulamadı." };
    } catch (error) {
      if (isOfflineLikeError(error)) {
        return { ok: false, message: "Bağlantı kurulamadı; sipariş oluşturulamadı." };
      }
      return { ok: false, message: "Tekliften sipariş oluşturulamadı." };
    }
  }

  try {
    const response = await sdk.orders.create({
      customerId: input.customerId ?? undefined,
      status: "draft",
      note: input.note?.trim() || "Doğrudan taslak sipariş",
      currency: "TRY"
    });

    const body = response as unknown;
    if (typeof body === "object" && body !== null) {
      const approvalRequestId =
        "approvalRequestId" in body && typeof (body as { approvalRequestId?: unknown }).approvalRequestId === "string"
          ? (body as { approvalRequestId: string }).approvalRequestId
          : undefined;
      if (approvalRequestId) {
        return { ok: false, message: "Sipariş onay kuyruğuna alındı.", approvalRequestId };
      }
      const item = "item" in body ? (body as { item?: SaleOrder }).item : undefined;
      if (item?.id) {
        return { ok: true, orderId: item.id, orderNo: item.orderNo };
      }
    }

    return { ok: false, message: "Taslak sipariş oluşturulamadı." };
  } catch (error) {
    if (isOfflineLikeError(error)) {
      return { ok: false, message: "Bağlantı kurulamadı; taslak sipariş oluşturulamadı." };
    }
    return { ok: false, message: "Taslak sipariş oluşturulamadı." };
  }
}
