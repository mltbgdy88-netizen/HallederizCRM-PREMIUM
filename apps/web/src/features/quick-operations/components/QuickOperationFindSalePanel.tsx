"use client";

import { FOUND_SALES, type FoundSaleSummary } from "../data/quick-operation-find-sale-demo";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onBack: () => void;
  onClose: () => void;
  onSelect: (sale: FoundSaleSummary) => void;
};

function matchesSale(sale: FoundSaleSummary, query: string): boolean {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (!q) return true;
  return [sale.saleNo, sale.customerName, sale.date, sale.amount, sale.status]
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .includes(q);
}

export function QuickOperationFindSalePanel({ query, onQueryChange, onBack, onClose, onSelect }: Props) {
  const filteredFoundSales = FOUND_SALES.filter((sale) => matchesSale(sale, query));

  return (
    <aside className="hism-find-sale-panel" aria-label="Gerçekleşen satış bul">
      <div className="hism-find-sale-head">
        <button type="button" onClick={onBack}>
          ‹ Geri
        </button>
        <div>
          <h2>Gerçekleşen Satış Bul</h2>
          <p>Satış, teslim, iade veya tahsilat için geçmiş kayıt seçin.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Kapat">
          ×
        </button>
      </div>

      <div className="hism-find-sale-fields">
        <label>
          <span>Cari adı / kodu</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="C-0025 - ABC İnşaat A.Ş."
            autoComplete="off"
          />
        </label>
        <label>
          <span>Sipariş no / belge no</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Sipariş no veya belge no girin..."
            autoComplete="off"
          />
        </label>
        <div className="hism-find-sale-date-row">
          <label>
            <span>Tarih başlangıç</span>
            <input value="01.04.2025" readOnly />
          </label>
          <label>
            <span>Tarih bitiş</span>
            <input value="07.05.2025" readOnly />
          </label>
        </div>
        <div className="hism-find-sale-chips" aria-label="Durum filtreleri">
          <button type="button" className="is-active">
            Kısmi Teslim
          </button>
          <button type="button">Ödendi</button>
          <button type="button">Fabrika Bekliyor</button>
          <button type="button">Tümü</button>
        </div>
      </div>

      <div className="hism-find-sale-results">
        <strong>Bulunan sonuçlar ({filteredFoundSales.length})</strong>
        {filteredFoundSales.length > 0 ? (
          filteredFoundSales.map((sale) => (
            <article key={sale.id} className="hism-find-sale-card">
              <div>
                <strong>{sale.saleNo}</strong>
                <span>{sale.customerName}</span>
                <small>{sale.date}</small>
              </div>
              <b>{sale.amount}</b>
              <p>{sale.status}</p>
              <button type="button" onClick={() => onSelect(sale)}>
                Seç
              </button>
            </article>
          ))
        ) : (
          <div className="hism-find-empty">
            <strong>Kayıt bulunamadı</strong>
            <p>Arama kriterlerini değiştirin veya canlı satış arama bağlantısı tamamlandığında tekrar deneyin.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
