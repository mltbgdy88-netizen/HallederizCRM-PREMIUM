import type { Offer } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";
import { isOfflineLikeError } from "../../../lib/user-facing-data-error";

export type DirectOfferCreateResult =
  | { ok: true; offerId: string; offerNo?: string }
  | { ok: false; message: string; approvalRequestId?: string };

export async function createDirectDraftOffer(input: {
  customerId?: string | null;
  note?: string;
}): Promise<DirectOfferCreateResult> {
  try {
    const response = await sdk.offers.create({
      customerId: input.customerId ?? undefined,
      status: "draft",
      note: input.note?.trim() || "Doğrudan taslak teklif",
      currency: "TRY"
    });

    const body = response as unknown;
    if (typeof body === "object" && body !== null) {
      const approvalRequestId =
        "approvalRequestId" in body && typeof (body as { approvalRequestId?: unknown }).approvalRequestId === "string"
          ? (body as { approvalRequestId: string }).approvalRequestId
          : undefined;
      if (approvalRequestId) {
        return { ok: false, message: "Teklif onay kuyruğuna alındı.", approvalRequestId };
      }
      const item = "item" in body ? (body as { item?: Offer }).item : undefined;
      if (item?.id) {
        return { ok: true, offerId: item.id, offerNo: item.offerNo };
      }
    }

    return { ok: false, message: "Taslak teklif oluşturulamadı." };
  } catch (error) {
    if (isOfflineLikeError(error)) {
      return { ok: false, message: "Bağlantı kurulamadı; taslak teklif oluşturulamadı." };
    }
    return { ok: false, message: "Taslak teklif oluşturulamadı." };
  }
}
