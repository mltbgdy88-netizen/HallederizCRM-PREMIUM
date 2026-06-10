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
        <h3>Teklif Bağlamı</h3>
        <p>Tablodan bir teklif seçildiğinde takip, belge ve dönüşüm özeti görünür.</p>
      </section>
    );
  }

  const followUp = buildOfferFollowUpSummary(offer.followUps);

  return (
    <section className="hz-offers-context" aria-label="Teklif bağlamı">
      <header className="hz-offers-context__head">
        <p className="hz-offers-context__eyebrow">Teklif Bağlamı</p>
        <h3>{offer.offerNo}</h3>
        <p>{customer.name}</p>
        <strong>{money(offer.grandTotal, offer.currency)}</strong>
        <span className="hz-offers-badge hz-offers-badge--info">{getOfferStatusLabel(offer.status)}</span>
      </header>

      <div className="hz-offers-context__body">
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="clock" size={14} /> Geçerlilik Uyarısı</h4>
          <p>Teklif geçerlilik süresi {new Date(offer.validUntil).toLocaleDateString("tr-TR")} tarihinde doluyor.</p>
        </article>
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="users-round" size={14} /> Müşteri Takibi</h4>
          <p>{followUp.latestNote}</p>
          <p>Son gönderim: {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString("tr-TR") : "Henüz gönderilmedi"}</p>
        </article>
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="file-text" size={14} /> Doküman & WhatsApp</h4>
          <p>Teklif PDF: Hazır</p>
          <p>WhatsApp: {customer.whatsappMatched ? "Eşleşti" : "Eşleşme yok"}</p>
        </article>
        <article className="hz-offers-context-card">
          <h4><LucideIcon name="shopping-cart" size={14} /> Dönüşüm Durumu</h4>
          <p>{offer.status === "converted" ? "Siparişe dönüştü." : offer.status === "approved" ? "Siparişe dönüşüm için hazır." : "Müşteri yanıtı bekleniyor."}</p>
        </article>
      </div>

      <footer className="hz-offers-context__actions">
        <Link href={`/teklifler/${offer.id}`} className="hz-offers-context-btn hz-offers-context-btn--primary">Detaya Git</Link>
        <Link href={`/teklifler/${offer.id}/satirlar`} className="hz-offers-context-btn">Revize Et</Link>
        <Link href={`/teklifler/${offer.id}/siparise-donusturme`} className="hz-offers-context-btn">Siparişe Dönüştür</Link>
      </footer>
    </section>
  );
}


