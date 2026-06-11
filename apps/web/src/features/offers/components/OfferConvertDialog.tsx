"use client";

import { convertOfferToOrderDraft } from "@hallederiz/domain";
import type { Customer, Offer } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { buildQuickOrderFromOfferHref, OFFER_PREFILL_NOTE } from "../utils/map-offer-detail-to-reference";

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
  const quickHref = buildQuickOrderFromOfferHref(offer.id, offer.customerId);

  function handleConvert() {
    pushToast("Sipariş hazırlığı Hızlı İşlem'de açıldı; canlı kayıt onay gerektirir.");
    router.push(quickHref);
    onClose();
  }

  return (
    <div className="ofd-modal-overlay" role="presentation" onClick={onClose}>
      <section className="ofd-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="ofd-modal__header">
          <div>
            <p className="ofd-modal__eyebrow">Siparişe Dönüştür</p>
            <h3>{offer.offerNo}</h3>
            <p className="ofd-modal__lead">Sipariş taslağı Hızlı İşlem workbench üzerinden hazırlanır; canlı kayıt onay gerektirir.</p>
          </div>
          <button type="button" className="ofd-modal__close" onClick={onClose}>
            Kapat
          </button>
        </header>

        <div className="ofd-modal__content">
          <ul className="ofd-side-list">
            <li>
              <span>Müşteri</span>
              <strong>{draft.customer.name ?? draft.customerId}</strong>
            </li>
            <li>
              <span>Satır sayısı</span>
              <strong>{String(draft.lines.length)}</strong>
            </li>
            <li>
              <span>Toplam</span>
              <strong>{money(offer.grandTotal, offer.currency)}</strong>
            </li>
            <li>
              <span>Fiyat slotu</span>
              <strong>{draft.priceSlotLabelSnapshot}</strong>
            </li>
            <li>
              <span>Not</span>
              <strong>{draft.warning}</strong>
            </li>
          </ul>
          <p className="ofd-note">{OFFER_PREFILL_NOTE}</p>
          <div className="ofd-conversion__actions">
            <button type="button" className="ofd-actions__btn ofd-actions__btn--primary" onClick={handleConvert}>
              Hızlı İşlem&apos;de hazırla
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
