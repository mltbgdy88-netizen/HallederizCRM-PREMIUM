import { calculateCustomerRiskState } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";
import { customerRiskLabelFromProfile } from "../utils/customer-detail-helpers";
import { EntityTimelinePanel } from "../../shared/components/EntityTimelinePanel";

export function CustomerInsightSidePanel({ customer, account }: { customer: Customer; account: CustomerAccount | null }) {
  const timeline = <EntityTimelinePanel entityType="customer" entityId={customer.id} />;

  if (!account) {
    const risk = customerRiskLabelFromProfile(customer);
    return (
      <>
      <section className="hz-content-card">
        <h3>AI ve risk paneli</h3>
        <ul className="hz-side-list hz-margin-top-sm">
          <li>AI önerisi: Finans özeti bağlandığında detaylı öneri üretilecek.</li>
          <li>Tahsilat uyarısı: Vade ve gecikme bilgisi hesap özeti bağlandığında gösterilir.</li>
          <li>Müşteri risk notu: {risk.description}</li>
          <li>Fiyat grubu: {customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</li>
        </ul>
      </section>
      {timeline}
      </>
    );
  }

  const risk = calculateCustomerRiskState(customer, account);

  return (
    <>
    <section className="hz-content-card">
      <h3>AI ve risk paneli</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>AI önerisi: {risk.requiresApproval ? "Yeni sipariş öncesi finans onayı alın." : "Standart teklif akışı uygundur."}</li>
        <li>
          Tahsilat uyarısı: {account.overdueAmount > 0 ? `${account.overdueAmount.toLocaleString("tr-TR")} ${account.currency} gecikmiş tutar` : "Gecikmiş tutar yok"}
        </li>
        <li>Müşteri risk notu: {risk.description}</li>
        <li>Fiyat grubu: {customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</li>
      </ul>
    </section>
    {timeline}
    </>
  );
}

