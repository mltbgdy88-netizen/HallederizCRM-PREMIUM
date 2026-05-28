import type { QuickOperationCustomer } from "../types";
import { demoCustomers } from "../hooks/use-quick-operation-state";

interface Props {
  customerId: string;
  customer: QuickOperationCustomer;
  onCustomerChange: (customerId: string) => void;
}

export function QuickOperationCustomerPanel({ customerId, customer, onCustomerChange }: Props) {
  return (
    <section className="hz-content-card">
      <div className="crm-identity-header">
        <div>
          <h3>Cari Bilgileri</h3>
          <p className="hz-content-card-description">Fiyat grubu, risk ve bakiye bilgisi satir hesaplarina baglam saglar.</p>
        </div>
        <label className="hz-field-label" style={{ minWidth: 240 }}>
          Cari sec
          <select className="hz-control" value={customerId} onChange={(event) => onCustomerChange(event.target.value)}>
            {demoCustomers.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="hz-modal-panel-grid hz-margin-top-sm">
        <div className="hz-kv-item"><span>Firma</span><strong>{customer.name}</strong></div>
        <div className="hz-kv-item"><span>Yetkili / Telefon</span><strong>{customer.contactName} · {customer.phone}</strong></div>
        <div className="hz-kv-item"><span>Fiyat Grubu / Risk</span><strong>{customer.priceGroup} · {customer.risk}</strong></div>
        <div className="hz-kv-item"><span>Bakiye</span><strong>{customer.balance.toLocaleString("tr-TR")} TL</strong></div>
      </div>
      <p className="hz-content-card-description hz-margin-top-sm">Adres: {customer.address}</p>
    </section>
  );
}
