// @ts-nocheck
import Link from "next/link";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { OfferRow } from "../mappers/map-offer-row";

export function OfferTable({
  rows,
  selectedOfferId,
  onSelectOffer,
  onOpenOffer
}: {
  rows: OfferRow[];
  selectedOfferId: string | null;
  onSelectOffer: (offerId: string) => void;
  onOpenOffer: (offerId: string) => void;
}) {
  return (
    <section className="hz-offers-table-card">
      <div className="hz-offers-table-wrap">
        <table className="hz-offers-table">
          <thead>
            <tr>
              <th>Teklif No</th>
              <th>Cari</th>
              <th>Tarih</th>
              <th>Geçerlilik</th>
              <th>Durum</th>
              <th>Tutar</th>
              <th>Takip</th>
              <th>Dönüşüm</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.offerId}
                className={`hz-offers-row ${selectedOfferId === row.offerId ? "is-selected" : ""}`}
                onClick={() => onSelectOffer(row.offerId)}
                onDoubleClick={() => onOpenOffer(row.offerId)}
              >
                <td>{row.offerNo}</td>
                <td>{row.customerName}</td>
                <td>{row.createdAtLabel}</td>
                <td>{row.validUntilLabel}</td>
                <td><span className={`hz-offers-badge hz-offers-badge--${row.statusTone}`}>{row.statusLabel}</span></td>
                <td>{row.totalLabel}</td>
                <td>{row.latestContactLabel}</td>
                <td>{row.conversionLabel}</td>
                <td className="hz-offers-row-actions" onClick={(event) => event.stopPropagation()}>
                  <Link href={`/teklifler/${row.offerId}`} className="hz-offers-row-action" title="Detay">
                    <LucideIcon name="eye" size={13} />
                    <span>Detay</span>
                  </Link>
                  <Link href={`/teklifler/${row.offerId}/satirlar`} className="hz-offers-row-action" title="Revize">
                    <LucideIcon name="file-text" size={13} />
                    <span>Revize</span>
                  </Link>
                  <Link href={`/teklifler/${row.offerId}/siparise-donusturme`} className="hz-offers-row-action" title="Siparişe Dönüştür">
                    <LucideIcon name="shopping-cart" size={13} />
                    <span>Siparişe Dönüştür</span>
                  </Link>
                </td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td colSpan={9}><div className="table-empty">Filtrelere uygun teklif bulunamadı.</div></td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}


