import { resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer } from "@hallederiz/types";

export function CustomerIdentityHeader({ customer }: { customer: Customer }) {
  return (
    <section className="hz-content-card crm-identity-header">
      <div>
        <p className="drawer-eyebrow">Cari Karti</p>
        <h3>{customer.name}</h3>
        <p className="hz-content-card-description">
          {customer.code} | {resolveCustomerDisplayType(customer.type)} | {customer.city}
        </p>
      </div>

      <div className="hz-modal-actions">
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">
          Teklif Olustur
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Siparis Olustur
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Tahsilat Gir
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Ekstre Gonder
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          WhatsApp Gecmisi
        </button>
      </div>
    </section>
  );
}
