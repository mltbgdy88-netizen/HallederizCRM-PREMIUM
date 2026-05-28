import type {
  CustomerId,
  ExchangeRate,
  ExchangeRatePolicy,
  OrderPriceSnapshot,
  Product,
  PriceSlotConfig
} from "@hallederiz/types";
import { convertCurrency } from "./convert-currency";
import { resolveCustomerPrice } from "./resolve-customer-price";

export function snapshotOrderPrice(params: {
  customerId: CustomerId;
  product: Product;
  slotConfigs: PriceSlotConfig[];
  exchangeRates: ExchangeRate[];
  exchangeRatePolicy: ExchangeRatePolicy;
  assignedPriceSlot: PriceSlotConfig["slotNumber"];
}): OrderPriceSnapshot | null {
  const { customerId, product, slotConfigs, exchangeRates, exchangeRatePolicy, assignedPriceSlot } = params;
  const resolvedPrice = resolveCustomerPrice({
    product,
    profile: {
      id: `profile_${customerId}`,
      tenantId: product.tenantId,
      customerId,
      selectedPriceSlotNo: assignedPriceSlot,
      assignedPriceSlot,
      active: true
    },
    slotConfigs
  });

  if (!resolvedPrice) {
    return null;
  }

  const amountInTargetCurrency = convertCurrency({
    amount: resolvedPrice.amount,
    fromCurrency: resolvedPrice.currency,
    toCurrency: exchangeRatePolicy.baseCurrency,
    rates: exchangeRates,
    policy: exchangeRatePolicy
  });

  return {
    productId: product.id,
    customerId,
    slotNumber: resolvedPrice.slotNumber,
    sourceCurrency: resolvedPrice.currency,
    targetCurrency: exchangeRatePolicy.baseCurrency,
    amountInSourceCurrency: resolvedPrice.amount,
    amountInTargetCurrency,
    exchangeRates,
    exchangeRatePolicy,
    capturedAt: new Date().toISOString()
  };
}
