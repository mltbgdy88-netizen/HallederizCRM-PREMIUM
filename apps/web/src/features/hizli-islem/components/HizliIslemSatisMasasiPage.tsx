"use client";

import { useHizliIslemSatisMasasiReferenceData } from "@/features/hizli-islem/hooks/use-hizli-islem-satis-masasi-reference-data";

function statusClass(status: string): string {
  if (status === "Onayda") return "hism-badge hims-badge--pending";
  if (status === "Onaylandı") return "hism-badge hims-badge--ok";
  return "hism-badge";
}

export function HizliIslemSatisMasasiPage() {
  const { data } = useHizliIslemSatisMasasiReferenceData();
  const { page, recent, form, lines, summary } = data;

  return (
    <div className="hism-home">
      <header className="hism-head">
        <div>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
      </header>

      <section className="hism-recent" aria-label="Son işlemler">
        <div className="hism-recent-head">
          <strong>Son İşlemler</strong>
          <button type="button">Tümü &gt;</button>
        </div>
        <div className="hism-recent-row">
          {recent.map((r) => (
            <article key={r.id} className="hism-recent-card">
              <strong>{r.id}</strong>
              <span>{r.amount}</span>
              <p>{r.customer}</p>
              <footer>
                <span className={statusClass(r.status)}>{r.status}</span>
                <time>{r.time}</time>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <div className="hism-workspace">
        <div className="hism-main">
          <section className="hism-form">
            <h2>Cari Bilgileri</h2>
            <div className="hism-form-grid">
              <label>
                <span>{form.customer}</span>
                <input type="text" placeholder="Cari ara…" readOnly />
              </label>
              <label>
                <span>{form.taxOffice}</span>
                <input type="text" readOnly />
              </label>
              <label>
                <span>{form.taxNo}</span>
                <input type="text" readOnly />
              </label>
              <label>
                <span>{form.contact}</span>
                <input type="text" readOnly />
              </label>
              <label>
                <span>{form.comm}</span>
                <input type="text" readOnly />
              </label>
              <label className="hism-span-2">
                <span>{form.address}</span>
                <input type="text" readOnly />
              </label>
            </div>
          </section>

          <section className="hism-table-wrap">
            <header>
              <h2>Ürünler</h2>
              <input type="search" placeholder="Ürün ara…" readOnly />
              <button type="button">+ Ürün Ekle</button>
              <span>Fiyat Tipi: Perakende</span>
            </header>
            <table className="hism-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ürün</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th>Birim Fiyat</th>
                  <th>İskonto %</th>
                  <th>KDV %</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <strong>{row.code}</strong> {row.name}
                    </td>
                    <td>{row.qty}</td>
                    <td>{row.unit}</td>
                    <td>{row.price}</td>
                    <td>{row.disc}</td>
                    <td>{row.vat}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <footer>
              <button type="button">+ Satır Ekle</button>
              <button type="button">Satır Temizle</button>
              <span>
                {summary.products} · {summary.totalQty}
              </span>
            </footer>
          </section>
        </div>

        <aside className="hism-summary">
          <h2>Özet</h2>
          <dl>
            <div>
              <dt>Ara Toplam</dt>
              <dd>{summary.subtotal}</dd>
            </div>
            <div>
              <dt>Toplam İskonto</dt>
              <dd>{summary.discount}</dd>
            </div>
            <div>
              <dt>İskonto Sonrası</dt>
              <dd>{summary.afterDisc}</dd>
            </div>
            <div>
              <dt>KDV Toplamı (%20)</dt>
              <dd>{summary.vat}</dd>
            </div>
          </dl>
          <p className="hism-grand">{summary.grand}</p>
          <label>
            <span>Ödeme Şekli</span>
            <input type="text" readOnly />
          </label>
          <label>
            <span>Vade Tarihi</span>
            <input type="text" readOnly />
          </label>
          <label>
            <span>Açıklama</span>
            <textarea readOnly rows={2} />
          </label>
          <label className="hism-check">
            <input type="checkbox" readOnly /> E-fatura olarak kesilsin
          </label>
          <div className="hism-actions">
            <button type="button" className="hism-save">
              Kaydet
            </button>
            <button type="button" className="hism-approve">
              Onaya Gönder
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
