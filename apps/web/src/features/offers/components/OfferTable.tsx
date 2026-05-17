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
    <section className="hz-content-card">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Teklif No</th>
              <th>Müşteri</th>
              <th>Toplam</th>
              <th>Durum</th>
              <th>Son İletişim</th>
              <th>Geçerlilik</th>
              <th>Fiyat Grubu</th>
              <th>Oluşturma</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.offerId}
                className={`stock-table-row ${selectedOfferId === row.offerId ? "is-selected-row" : ""}`}
                onClick={() => onSelectOffer(row.offerId)}
                onDoubleClick={() => onOpenOffer(row.offerId)}
              >
                <td>{row.offerNo}</td>
                <td>{row.customerName}</td>
                <td>{row.totalLabel}</td>
                <td><span className={`hz-badge hz-badge-${row.statusTone}`}>{row.statusLabel}</span></td>
                <td>{row.latestContactLabel}</td>
                <td>{row.validUntilLabel}</td>
                <td>{row.priceGroupLabel}</td>
                <td>{row.createdAtLabel}</td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}><div className="table-empty">Filtrelere uygun teklif bulunamadı.</div></td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
