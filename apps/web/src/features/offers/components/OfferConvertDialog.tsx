"use client";

import { convertOfferToOrderDraft } from "@hallederiz/domain";
import type { Customer, Offer } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";

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
  const { pushToast } = useToast();

  if (!open) {
    return null;
  }

  const draft = convertOfferToOrderDraft(offer, customer ?? undefined);

  function handleConvert() {
    const customerParam = offer.customerId ? `?customer=${encodeURIComponent(offer.customerId)}` : "";
    pushToast("Sipariş hazırlığı Hızlı İşlem'de açıldı; canlı kayıt onay gerektirir.");
    router.push(`/hizli-islem${customerParam}`);
    onClose();
  }

  return (
    <div className="hz-modal-overlay" role="presentation" onClick={onClose}>
      <section className="hz-modal offer-small-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Siparişe Dönüştür</p>
            <h3>{offer.offerNo}</h3>
            <p className="muted">Sipariş taslağı Hızlı İşlem workbench üzerinden hazırlanır; canlı kayıt onay gerektirir.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>
            Kapat
          </button>
        </header>

        <div className="hz-modal-content hz-tab-content">
          <ul className="hz-side-list">
            <li>Müşteri: {draft.customer.name ?? draft.customerId}</li>
            <li>Satır sayısı: {draft.lines.length}</li>
            <li>Toplam: {money(offer.grandTotal, offer.currency)}</li>
            <li>Seçilen fiyat slotu: {draft.priceSlotLabelSnapshot}</li>
            <li>Not: {draft.warning}</li>
          </ul>
          <div className="stock-filter-actions hz-margin-top-sm">
            <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={handleConvert}>
              Hızlı İşlem&apos;de hazırla
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

