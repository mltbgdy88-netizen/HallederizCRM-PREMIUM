"use client";

import Link from "next/link";
import { SiparisBadge, SiparisKatmanBreadcrumbHead, SiparislerKatmanTabs } from "./SiparislerKatmanShared";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

export function SiparislerKatmanIadePage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;

  return (
    <div className="skm-home skm-home--layer">
      <SiparisKatmanBreadcrumbHead
        breadcrumb={[...header.breadcrumb, "İadeler"]}
        orderId={header.orderId}
        status={header.status}
        meta={header.meta}
        actions={
          <>
            <Link href="/siparisler" className="skm-btn skm-btn--outline">
              ← Siparişlere Dön
            </Link>
            <button type="button" className="skm-btn skm-btn--outline">
              Yazdır
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Diğer İşlemler ▾
            </button>
          </>
        }
      />

      <div className="skm-meta-strip" aria-label="Sipariş özeti">
        <div>
          <span className="skm-meta-label">Sipariş No</span>
          <strong>{header.orderId}</strong>
        </div>
        <div>
          <span className="skm-meta-label">Müşteri</span>
          <strong>{header.customerName}</strong>
        </div>
        <div>
          <span className="skm-meta-label">Sipariş Tarihi</span>
          <strong>{header.orderDateLabel}</strong>
        </div>
        <div>
          <span className="skm-meta-label">Toplam Tutar</span>
          <strong>{data.totals.find((t) => t.strong)?.value ?? data.totals.at(-1)?.value ?? "—"}</strong>
        </div>
        <div>
          <span className="skm-meta-label">Ödeme Durumu</span>
          <SiparisBadge tone="ok">—</SiparisBadge>
        </div>
        <div>
          <span className="skm-meta-label">Sipariş Durumu</span>
          <SiparisBadge tone="ok">{header.status}</SiparisBadge>
        </div>
      </div>

      <SiparislerKatmanTabs active="iade" tabs={layer.tabs} />

      <div className="skm-workspace skm-workspace--layer">
        <section className="skm-panel skm-panel--layer skm-main">
          <header className="skm-panel-head">
            <div>
              <h2>İadeler</h2>
              <p className="skm-panel-desc">Siparişe bağlı iade kayıtlarını görüntüleyin.</p>
            </div>
          </header>

          <div className="skm-table-wrap">
            <table className="skm-table">
              <thead>
                <tr>
                  <th aria-label="İkon" />
                  <th>İade No</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {layer.iadeRows.map((row) => (
                  <tr key={row.no}>
                    <td className="skm-cell-icon" aria-hidden>
                      ↺
                    </td>
                    <td>
                      <strong>{row.no}</strong>
                      <span className="skm-row-sub">{row.date}</span>
                    </td>
                    <td>{row.amount}</td>
                    <td>
                      <SiparisBadge tone={row.tone}>{row.status}</SiparisBadge>
                    </td>
                    <td className="skm-cell-actions">Detay · İade Belgesi ···</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="skm-table-foot">
            <span>Toplam {layer.iadeRows.length} kayıt</span>
            <div className="skm-pagination">
              <select defaultValue="10" aria-label="Sayfa boyutu">
                <option value="10">10 satır</option>
              </select>
              <span>1 / 1</span>
            </div>
          </footer>
        </section>

        <aside className="skm-context" aria-label={layer.iadeContext.title}>
          <header className="skm-context-head">
            <h2>{layer.iadeContext.title}</h2>
          </header>

          <section className="skm-context-block skm-highlight-card">
            <h3>Stok Etkisi</h3>
            <dl className="skm-dl">
              <div>
                <dt>Toplam İade Tutarı</dt>
                <dd>{layer.iadeContext.totalAmount}</dd>
              </div>
              <div>
                <dt>İade Edilen Ürün Adedi</dt>
                <dd>{layer.iadeContext.productCount}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>Stok Hareket Özeti</h3>
            <ul className="skm-stock-summary">
              <li>
                <span>Stoktan Çıkan (Sevkiyat)</span>
                <span className="skm-neg">{layer.iadeContext.stockOut}</span>
              </li>
              <li>
                <span>İade Edilen</span>
                <span className="skm-pos">{layer.iadeContext.stockIn}</span>
              </li>
              <li>
                <span>Net Stok Etkisi</span>
                <span className="skm-neg">{layer.iadeContext.net}</span>
              </li>
              <li>
                <span>Etkilenen Ürün</span>
                <span>{layer.iadeContext.affected}</span>
              </li>
            </ul>
          </section>

          <section className="skm-context-block">
            <h3>Son İade İşlemi</h3>
            <dl className="skm-dl">
              <div>
                <dt>İade No</dt>
                <dd>{layer.iadeContext.lastId}</dd>
              </div>
              <div>
                <dt>Tarih</dt>
                <dd>{layer.iadeContext.lastDate}</dd>
              </div>
              <div>
                <dt>Tutar</dt>
                <dd>{layer.iadeContext.lastAmount}</dd>
              </div>
              <div>
                <dt>Durum</dt>
                <dd>
                  <SiparisBadge tone="ok">{layer.iadeContext.lastStatus}</SiparisBadge>
                </dd>
              </div>
            </dl>
            <button type="button" className="skm-btn skm-btn--primary skm-btn--block">
              Stok Hareketlerini Görüntüle
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
