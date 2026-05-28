// @ts-nocheck
import { buildOfferFollowUpSummary } from "@hallederiz/domain";
import type { Customer, Offer } from "@hallederiz/types";
import { getOfferStatusLabel } from "../queries/offer-mock-data";

export interface OfferRow {
  offerId: string;
  offerNo: string;
  customerName: string;
  totalLabel: string;
  statusLabel: string;
  statusTone: "info" | "success" | "warning" | "danger";
  latestContactLabel: string;
  validUntilLabel: string;
  priceGroupLabel: string;
  createdAtLabel: string;
  conversionLabel: string;
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

function statusTone(status: Offer["status"]): OfferRow["statusTone"] {
  if (status === "approved" || status === "converted") {
    return "success";
  }

  if (status === "rejected" || status === "expired") {
    return "danger";
  }

  if (status === "waiting_response" || status === "sent") {
    return "warning";
  }

  return "info";
}

export function mapOfferToRow(offer: Offer, customer?: Customer): OfferRow {
  const followUp = buildOfferFollowUpSummary(offer.followUps);

  return {
    offerId: offer.id,
    offerNo: offer.offerNo,
    customerName: customer?.name ?? "-",
    totalLabel: formatMoney(offer.grandTotal, offer.currency),
    statusLabel: getOfferStatusLabel(offer.status),
    statusTone: statusTone(offer.status),
    latestContactLabel: followUp.nextPlannedAt
      ? new Date(followUp.nextPlannedAt).toLocaleString("tr-TR")
      : followUp.latestNote,
    validUntilLabel: new Date(offer.validUntil).toLocaleDateString("tr-TR"),
    priceGroupLabel: offer.priceSlotLabelSnapshot,
    createdAtLabel: new Date(offer.createdAt).toLocaleDateString("tr-TR"),
    conversionLabel: offer.status === "converted" ? "TamamlandÄ±" : offer.status === "approved" ? "HazÄ±r" : "Bekliyor"
  };
}

