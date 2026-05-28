"use client";

import {
  SiparisKatmanBreadcrumbHead,
  SiparislerKatmanTabs,
  SkmKpiIcon
} from "./SiparislerKatmanShared";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

export function SiparislerKatmanOdemePage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;
  const ctx = layer.odemeContext;

  return (
    <div className="skm-home skm-home--layer">
      <SiparisKatmanBreadcrumbHead
        breadcrumb={header.breadcrumb}
        orderId={header.orderId}
        status={header.status}
        meta={header.meta}
        actions={
          <>
            <button type="button" className="skm-btn skm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Yazdır ▾
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Diğer İşlemler ▾
            </button>
          </>
        }
      />

      <SiparislerKatmanTabs active="odeme" tabs={layer.tabs} />

      <div className="skm-workspace skm-workspace--layer">
        <div className="skm-main">
          <section className="skm-kpi-row skm-kpi-row--4" aria-label="Ödeme özetleri">
            {data.kpis.map((kpi) => (
              <article
                key={kpi.id}
                className={`skm-kpi-card skm-kpi-card--${kpi.tone ?? "green"}`}
              >
                <SkmKpiIcon tone={kpi.tone ?? "green"} />
                <div>
                  <span className="skm-kpi-value">{kpi.value}</span>
                  <span className="skm-kpi-label">{kpi.label}</span>
                  {"sub" in kpi && kpi.sub ? <span className="skm-kpi-sub">{kpi.sub}</span> : null}
                </div>
              </article>
            ))}
          </section>

          <section className="skm-panel skm-panel--layer" aria-labelledby="skm-odeme-list">
            <header className="skm-panel-head skm-panel-head--split">
              <h2 id="skm-odeme-list">Ödeme Tahsilat Listesi</h2>
              <div className="skm-head-actions">
                <button type="button" className="skm-btn skm-btn--primary">
                  + Tahsilat Ekle
                </button>
                <button type="button" className="skm-btn skm-btn--outline skm-btn--sm" aria-label="Filtre">
                  ⛃
                </button>
              </div>
            </header>

            <div className="skm-table-wrap">
              <table className="skm-table">
                <thead>
                  <tr>
                    <th>Tahsilat #</th>
                    <th>Tarih</th>
                    <th>Tahsilat Yöntemi</th>
                    <th>Açıklama</th>
                    <th>Tahsilat Tutarı</th>
                    <th>Kalan Bakiye</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {layer.odemeRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.date}</td>
                      <td>{row.method}</td>
                      <td>{row.desc}</td>
                      <td>{row.amount}</td>
                      <td>{row.balance}</td>
                      <td className="skm-cell-actions">···</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="skm-table-foot">
              <span>Toplam {layer.odemeRows.length} kayıt bulundu</span>
              <div className="skm-pagination">
                <select defaultValue="10" aria-label="Sayfa boyutu">
                  <option value="10">10 satır</option>
                </select>
                <span>1 / 1</span>
              </div>
            </footer>

            <div className="skm-progress-block">
              <h3>Tahsilat Dağılımı</h3>
              <div className="skm-progress-bar" role="img" aria-label="Tahsilat dağılımı">
                <span className="skm-progress-collected" style={{ width: `${ctx.collectedPct}%` }} />
                <span className="skm-progress-remaining" style={{ width: `${ctx.remainingPct}%` }} />
              </div>
              <div className="skm-progress-legend">
                <span>Tahsil Edilen: {ctx.collected} ({ctx.collectedPct}%)</span>
                <span>Kalan Bakiye: {ctx.remaining} ({ctx.remainingPct}%)</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="skm-context" aria-label={ctx.title}>
          <header className="skm-context-head">
            <h2>{ctx.title}</h2>
          </header>

          <section className="skm-context-block skm-open-balance">
            <span>Açık Bakiye Özeti</span>
            <strong>{ctx.openBalance}</strong>
            <p>Açık Bakiye</p>
            <dl className="skm-dl skm-dl--summary">
              <div>
                <dt>Sipariş Tutarı</dt>
                <dd>{ctx.orderAmount}</dd>
              </div>
              <div>
                <dt>Tahsil Edilen</dt>
                <dd>{ctx.collected}</dd>
              </div>
              <div className="skm-dl-row--warn">
                <dt>Kalan Bakiye</dt>
                <dd>{ctx.remaining}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>Ödeme Bilgileri</h3>
            <dl className="skm-dl">
              <div>
                <dt>Ödeme Koşulu</dt>
                <dd>{ctx.terms}</dd>
              </div>
              <div>
                <dt>Vade Tarihi</dt>
                <dd>{ctx.dueDate}</dd>
              </div>
              <div>
                <dt>Para Birimi</dt>
                <dd>{ctx.currency}</dd>
              </div>
              <div>
                <dt>Kur Tarihi</dt>
                <dd>{ctx.rateDate}</dd>
              </div>
              <div>
                <dt>Döviz Kuru</dt>
                <dd>{ctx.rate}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>Son Tahsilat</h3>
            <dl className="skm-dl">
              <div>
                <dt>Tahsilat #</dt>
                <dd>{ctx.lastId}</dd>
              </div>
              <div>
                <dt>Tarih</dt>
                <dd>{ctx.lastDate}</dd>
              </div>
              <div>
                <dt>Tutar</dt>
                <dd>{ctx.lastAmount}</dd>
              </div>
              <div>
                <dt>Yöntem</dt>
                <dd>{ctx.lastMethod}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>Hızlı İşlemler</h3>
            <div className="skm-context-actions">
              <button type="button" className="skm-btn skm-btn--primary skm-btn--block">
                + Tahsilat Ekle
              </button>
              <button type="button" className="skm-btn skm-btn--outline skm-btn--block">
                Ödeme Planı Oluştur
              </button>
              <button type="button" className="skm-btn skm-btn--outline skm-btn--block">
                Tahsilat Raporu
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

