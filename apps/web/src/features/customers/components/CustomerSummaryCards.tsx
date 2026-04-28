import { calculateCustomerRiskState } from "@hallederiz/domain";
import { MetricCard } from "@hallederiz/ui";
import type { Customer, CustomerAccount } from "@hallederiz/types";

export function CustomerSummaryCards({ customer, account }: { customer: Customer; account: CustomerAccount }) {
  const risk = calculateCustomerRiskState(customer, account);

  return (
    <section className="hz-metric-grid">
      <MetricCard
        title="Acik Bakiye"
        value={`${account.balance.toLocaleString("tr-TR")} ${account.currency}`}
        detail="Cari hesap bakiyesi"
        tone={account.balance > 0 ? "warning" : "success"}
      />
      <MetricCard title="Acik Teklif" value={String(account.openOfferCount)} detail="Aktif teklif" tone="info" />
      <MetricCard title="Acik Siparis" value={String(account.openOrderCount)} detail="Operasyon surecinde" tone="warning" />
      <MetricCard title="Risk Seviyesi" value={risk.label} detail={risk.description} tone={risk.requiresApproval ? "danger" : "success"} />
    </section>
  );
}
