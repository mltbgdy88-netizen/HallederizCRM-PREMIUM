import { calculateCustomerRiskState } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";

export function CustomerInsightSidePanel({ customer, account }: { customer: Customer; account: CustomerAccount }) {
  const risk = calculateCustomerRiskState(customer, account);

  return (
    <section className="hz-content-card">
      <h3>AI ve Risk Paneli</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>AI Onerisi: {risk.requiresApproval ? "Yeni siparis oncesi finans onayi alin." : "Standart teklif akisi uygundur."}</li>
        <li>Tahsilat Uyarisi: {account.overdueAmount.toLocaleString("tr-TR")} {account.currency} gecikmis tutar</li>
        <li>Musteri Risk Notu: {risk.description}</li>
        <li>Fiyat Grubu: {customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</li>
      </ul>
    </section>
  );
}
