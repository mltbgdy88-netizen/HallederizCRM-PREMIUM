export const RETURN_WINDOW_DAYS = 15;

export function diffDaysSinceIso(isoDate: string, now = new Date()): number | null {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
}

export function isReturnWindowExpiredFromIso(isoDate: string, now = new Date()): boolean {
  const days = diffDaysSinceIso(isoDate, now);
  if (days === null) {
    return false;
  }
  return days > RETURN_WINDOW_DAYS;
}

export function validateReturnWindowFromOrderCreatedAt(
  createdAt: string,
  now = new Date()
): { code: string; message: string } | null {
  if (!createdAt.trim()) {
    return null;
  }
  if (isReturnWindowExpiredFromIso(createdAt, now)) {
    return {
      code: "return_window_expired",
      message: "Siparis satis tarihinden itibaren 15 gun gectigi icin iade islemi reddedildi."
    };
  }
  return null;
}
