"use client";

import { resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer } from "@hallederiz/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CustomerIdentityHeader({ customer, financeLinked }: { customer: Customer; financeLinked: boolean }) {
  const router = useRouter();

  return (
    <section className="hz-content-card crm-identity-header">
      <div>
        <p className="drawer-eyebrow">Cari kartı</p>
        <h3>{customer.name}</h3>
        <p className="hz-content-card-description">
          {customer.code} | {resolveCustomerDisplayType(customer.type)} | {customer.city}
        </p>
        {!financeLinked ? (
          <p className="hz-customers-detail-finance-hint" role="note">
            Finans ve hareket özeti henüz bağlı değil; aşağıdaki sekmelerde yalnızca cari kartı verisi gösterilir.
          </p>
        ) : null}
      </div>

      <div className="hz-modal-actions">
        <Link href="/cariler" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Listeye dön
        </Link>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push(`/teklifler/yeni?customer=${customer.id}`)}>
          Teklif oluştur
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push(`/siparisler/yeni?customer=${customer.id}`)}>
          Sipariş oluştur
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push(`/tahsilatlar/yeni?customer=${customer.id}`)}>
          Tahsilat gir
        </button>
        <button
          type="button"
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          onClick={() => router.push(`/belgeler?customer=${customer.id}&type=statement_pdf`)}
        >
          Ekstre gönder
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push(`/whatsapp?customer=${customer.id}`)}>
          WhatsApp geçmişi
        </button>
      </div>
    </section>
  );
}
