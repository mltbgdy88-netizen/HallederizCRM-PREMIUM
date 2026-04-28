"use client";

import { resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer } from "@hallederiz/types";
import { useRouter } from "next/navigation";

export function CustomerIdentityHeader({ customer }: { customer: Customer }) {
  const router = useRouter();

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
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push(`/teklifler/yeni?customer=${customer.id}`)}>
          Teklif Olustur
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push(`/siparisler/yeni?customer=${customer.id}`)}>
          Siparis Olustur
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push(`/tahsilatlar/yeni?customer=${customer.id}`)}>
          Tahsilat Gir
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push(`/belgeler?customer=${customer.id}&type=statement_pdf`)}>
          Ekstre Gonder
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push(`/whatsapp?customer=${customer.id}`)}>
          WhatsApp Gecmisi
        </button>
      </div>
    </section>
  );
}
