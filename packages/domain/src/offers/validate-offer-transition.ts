import type { OfferStatus } from "@hallederiz/types";

const ALLOWED_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  draft: ["sent", "waiting_response", "rejected", "expired"],
  sent: ["waiting_response", "approved", "rejected", "expired"],
  waiting_response: ["approved", "rejected", "expired", "sent"],
  approved: ["converted", "expired"],
  rejected: [],
  expired: [],
  converted: []
};

export interface OfferTransitionValidation {
  valid: boolean;
  reason?: string;
}

export function validateOfferTransition(from: OfferStatus, to: OfferStatus): OfferTransitionValidation {
  if (from === to) {
    return { valid: true };
  }

  if (from === "converted") {
    return {
      valid: false,
      reason: "Siparise donusmus teklif tekrar duzenlenemez."
    };
  }

  const allowedTargets = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowedTargets.includes(to)) {
    return {
      valid: false,
      reason: `${from} durumundan ${to} durumuna gecis desteklenmiyor.`
    };
  }

  return { valid: true };
}
