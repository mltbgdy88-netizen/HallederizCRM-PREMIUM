export function money(amount: number, currency = "TRY"): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
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
