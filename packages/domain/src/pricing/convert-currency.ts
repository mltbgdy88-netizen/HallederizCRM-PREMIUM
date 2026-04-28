import type { CurrencyCode, ExchangeRate, ExchangeRatePolicy } from "@hallederiz/types";

function roundValue(value: number, precision: number): number {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function findRate(currency: Exclude<CurrencyCode, "TRY">, rates: ExchangeRate[]): ExchangeRate {
  const rate = rates.find((item) => item.currency === currency);
  if (!rate) {
    throw new Error(`Missing exchange rate for currency: ${currency}`);
  }
  return rate;
}

function toTry(amount: number, fromCurrency: CurrencyCode, rates: ExchangeRate[], policy: ExchangeRatePolicy): number {
  if (fromCurrency === "TRY") {
    return amount;
  }

  const rate = findRate(fromCurrency, rates);
  const rateValue = policy.useSellingRateForOrder ? rate.sellingRate : rate.buyingRate;
  const spreadMultiplier = 1 + policy.additionalSpreadPercent / 100;
  return amount * rateValue * spreadMultiplier;
}

export function convertCurrency(params: {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rates: ExchangeRate[];
  policy: ExchangeRatePolicy;
}): number {
  const { amount, fromCurrency, toCurrency, rates, policy } = params;

  if (fromCurrency === toCurrency) {
    return roundValue(amount, policy.roundingPrecision);
  }

  const amountInTry = toTry(amount, fromCurrency, rates, policy);

  if (toCurrency === "TRY") {
    return roundValue(amountInTry, policy.roundingPrecision);
  }

  const targetRate = findRate(toCurrency, rates);
  const targetRateValue = policy.useSellingRateForOrder ? targetRate.sellingRate : targetRate.buyingRate;
  const convertedAmount = amountInTry / targetRateValue;

  return roundValue(convertedAmount, policy.roundingPrecision);
}
