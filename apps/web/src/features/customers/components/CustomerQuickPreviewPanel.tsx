import { calculateCustomerRiskState } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR")} ${currency}`;
}

export function CustomerQuickPreviewPanel({
  customer,
  account
}: {
  customer: Customer | null;
  account: CustomerAccount | null;
}) {
  if (!customer || !account) {
    return (
      <section className="hz-content-card">
        <h3>Cari Preview</h3>
        <p className="hz-content-card-description">Tablodan bir cari secildiginde operasyon ozeti burada gorunur.</p>
      </section>
    );
  }

  const risk = calculateCustomerRiskState(customer, account);

  return (
    <section className="hz-content-card">
      <h3>{customer.name}</h3>
      <p className="hz-content-card-description">{customer.code} cari operasyon ozeti</p>

      <div className="hz-side-list hz-margin-top-sm">
        <li>Acik Bakiye: {formatMoney(account.balance, account.currency)}</li>
        <li>Fiyat Grubu: {customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`}</li>
        <li>Risk Seviyesi: {risk.label}</li>
        <li>Son Tahsilat: {account.lastPaymentAt ? new Date(account.lastPaymentAt).toLocaleDateString("tr-TR") : "-"}</li>
        <li>WhatsApp Eslesmesi: {customer.whatsappMatched ? "Aktif" : "Bekliyor"}</li>
      </div>
    </section>
  );
}
