"use client";

import { convertOfferToOrderDraft } from "@hallederiz/domain";
import type { Customer, Offer } from "@hallederiz/types";
import { useRouter } from "next/navigation";

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function OfferConvertDialog({
  open,
  offer,
  customer,
  onClose
}: {
  open: boolean;
  offer: Offer;
  customer: Customer | null;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open) {
    return null;
  }

  const draft = convertOfferToOrderDraft(offer, customer ?? undefined);

  function handleConvert() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("hallederiz:order-draft", JSON.stringify(draft));
    }
    router.push(draft.navigationPath);
  }

  return (
    <div className="hz-modal-overlay" role="presentation" onClick={onClose}>
      <section className="hz-modal offer-small-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Siparise Donustur</p>
            <h3>{offer.offerNo}</h3>
            <p className="muted">Gercek siparis kaydi sonraki modul baglantisinda olusturulacak.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>Kapat</button>
        </header>

        <div className="hz-modal-content hz-tab-content">
          <ul className="hz-side-list">
            <li>Musteri: {draft.customer.name ?? draft.customerId}</li>
            <li>Satir Sayisi: {draft.lines.length}</li>
            <li>Toplam: {money(offer.grandTotal, offer.currency)}</li>
            <li>Secilen Fiyat Slotu: {draft.priceSlotLabelSnapshot}</li>
            <li>Uyari: {draft.warning}</li>
          </ul>
          <div className="stock-filter-actions hz-margin-top-sm">
            <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={handleConvert}>Siparise Donustur Onayi</button>
            <span className="hz-badge hz-badge-info">Draft: {draft.id}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
