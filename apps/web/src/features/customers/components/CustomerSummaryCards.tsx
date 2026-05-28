import { calculateCustomerRiskState } from "@hallederiz/domain";
import { MetricCard } from "@hallederiz/ui";
import type { Customer, CustomerAccount } from "@hallederiz/types";
import { customerRiskLabelFromProfile } from "../utils/customer-detail-helpers";

export function CustomerSummaryCards({ customer, account }: { customer: Customer; account: CustomerAccount | null }) {
  if (!account) {
    const risk = customerRiskLabelFromProfile(customer);
    return (
      <section className="hz-metric-grid">
        <p className="hz-customers-detail-finance-banner" role="note">
          Finans özeti henüz bağlı değil; bakiye, açık teklif ve sipariş sayıları hesap özeti bağlandığında gösterilir.
        </p>
        <MetricCard title="Açık bakiye" value="—" detail="Hesap özeti bekleniyor" tone="info" />
        <MetricCard title="Açık teklif" value="—" detail="Hesap özeti bekleniyor" tone="info" />
        <MetricCard title="Açık sipariş" value="—" detail="Hesap özeti bekleniyor" tone="info" />
        <MetricCard title="Risk seviyesi" value={risk.label} detail={risk.description} tone={customer.riskLevel === "high" || customer.riskLevel === "blocked" ? "danger" : "success"} />
      </section>
    );
  }

  const risk = calculateCustomerRiskState(customer, account);

  return (
    <section className="hz-metric-grid">
      <MetricCard
        title="Açık bakiye"
        value={`${account.balance.toLocaleString("tr-TR")} ${account.currency}`}
        detail="Cari hesap bakiyesi"
        tone={account.balance > 0 ? "warning" : "success"}
      />
      <MetricCard title="Açık teklif" value={String(account.openOfferCount)} detail="Aktif teklif" tone="info" />
      <MetricCard title="Açık sipariş" value={String(account.openOrderCount)} detail="Operasyon sürecinde" tone="warning" />
      <MetricCard title="Risk seviyesi" value={risk.label} detail={risk.description} tone={risk.requiresApproval ? "danger" : "success"} />
    </section>
  );
}
