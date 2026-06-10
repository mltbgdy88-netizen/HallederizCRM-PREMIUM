// @ts-nocheck
export function money(amount: number, currency = "TRY"): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

/** Sipariş masası ve önizleme — tek tip ₺ formatı */
export function formatTryMoney(amount: number, currency = "TRY"): string {
  if (!Number.isFinite(amount)) {
    return "—";
  }

  const code = currency === "TL" || currency === "TRY" ? "TRY" : currency;

  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2
    }).format(amount);
  }
}

export function dateLabel(value?: string): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}


