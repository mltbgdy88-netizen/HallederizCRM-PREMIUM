import type { CurrencyCode } from "@hallederiz/types";

const formatterByCurrency: Record<CurrencyCode, Intl.NumberFormat> = {
  TRY: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }),
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  EUR: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })
};

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return formatterByCurrency[currency].format(amount);
}
