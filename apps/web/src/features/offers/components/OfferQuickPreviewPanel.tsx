// @ts-nocheck
import { buildOfferFollowUpSummary } from "@hallederiz/domain";
import type { Customer, Offer } from "@hallederiz/types";
import Link from "next/link";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { getOfferStatusLabel } from "../queries/offer-mock-data";

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function OfferQuickPreviewPanel({ offer, customer }: { offer: Offer | null; customer: Customer | null }) {
  if (!offer || !customer) {
    return (
      <section className="hz-offers-context-card hz-offers-context-card--empty">
        <h3>Teklif BaÄŸlamÄ±</h3>
        <p>Tablodan bir teklif seÃ§ildiÄŸinde takip, belge ve dÃ¶nÃ¼ÅŸÃ¼m Ã¶zeti gÃ¶rÃ¼nÃ¼r.</p>
      </section>
    );
  }

  const followUp = buildOfferFollowUpSummary(offer.followUps);

  return (
    <section className="hz-offers-context" aria-label="Teklif baÄŸlamÄ±">
      <header className="hz-offers-context__head">
        <p className="hz-offers-context__eyebrow">Teklif BaÄŸlamÄ±</p>
        <h3>{offer.offerNo}</h3>
        <p>{customer.name}</p>
        <strong>{money(offer.grandTotal, offer.currency)}</strong>
        <span className="hz-offers-badge hz-offers-badge--info">{getOfferStatusLabel(offer.status)}</span>
      </header>

      <div className="hz-offers-context__body">
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="clock" size={14} /> GeÃ§erlilik UyarÄ±sÄ±</h4>
          <p>Teklif geÃ§erlilik sÃ¼resi {new Date(offer.validUntil).toLocaleDateString("tr-TR")} tarihinde doluyor.</p>
        </article>
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="users-round" size={14} /> MÃ¼ÅŸteri Takibi</h4>
          <p>{followUp.latestNote}</p>
          <p>Son gÃ¶nderim: {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString("tr-TR") : "HenÃ¼z gÃ¶nderilmedi"}</p>
        </article>
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="file-text" size={14} /> DokÃ¼man & WhatsApp</h4>
          <p>Teklif PDF: HazÄ±r</p>
          <p>WhatsApp: {customer.whatsappMatched ? "EÅŸleÅŸti" : "EÅŸleÅŸme yok"}</p>
        </article>
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="shopping-cart" size={14} /> DÃ¶nÃ¼ÅŸÃ¼m Durumu</h4>
          <p>{offer.status === "converted" ? "SipariÅŸe dÃ¶nÃ¼ÅŸtÃ¼." : offer.status === "approved" ? "SipariÅŸe dÃ¶nÃ¼ÅŸÃ¼m iÃ§in hazÄ±r." : "MÃ¼ÅŸteri yanÄ±tÄ± bekleniyor."}</p>
        </article>
      </div>

      <footer className="hz-offers-context__actions">
        <Link href={`/teklifler/${offer.id}`} className="hz-offers-context-btn hz-offers-context-btn--primary">Detaya Git</Link>
        <Link href={`/teklifler/${offer.id}/satirlar`} className="hz-offers-context-btn">Revize Et</Link>
        <Link href={`/teklifler/${offer.id}/siparise-donusturme`} className="hz-offers-context-btn">SipariÅŸe DÃ¶nÃ¼ÅŸtÃ¼r</Link>
      </footer>
    </section>
  );
}

