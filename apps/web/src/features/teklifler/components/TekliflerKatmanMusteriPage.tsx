"use client";

import { TeklifBadge, TekliflerKatmanTabs, UserAvatar } from "./TekliflerKatmanShared";
import { useTekliflerKatmanReferenceData } from "@/features/teklifler/hooks/use-teklifler-katman-reference-data";

function statusTone(status: string): "ok" | "warn" | "bad" | "blue" {
  if (status === "Kazanıldı") return "ok";
  if (status === "Kaybedildi") return "bad";
  if (status === "Beklemede") return "warn";
  return "blue";
}

export function TekliflerKatmanMusteriPage() {
  const { data } = useTekliflerKatmanReferenceData();
  const { header, layer } = data;
  const musteriPage = layer.musteriPage;
  const musteriHistory = layer.musteriHistory;
  const musteriContext = layer.musteriContext;

  return (
    <div className="tkm-home tkm-home--musteri">
      <header className="tkm-page-head">
        <div className="tkm-page-head-main">
          <div>
            <h1>{musteriPage.title}</h1>
            <p className="tkm-subtitle">{musteriPage.subtitle}</p>
          </div>
          <div className="tkm-head-actions">
            <button type="button" className="tkm-btn tkm-btn--primary">
              + Yeni Teklif
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              İçe Aktar
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Dışa Aktar
            </button>
          </div>
        </div>
      </header>

      <nav className="tkm-hub-tabs" aria-label="Teklifler hub sekmeleri">
        {musteriPage.hubTabs.map((tab) => (
          <span
            key={tab}
            className={tab === "Müşteri" ? "tkm-hub-tab tkm-hub-tab--active" : "tkm-hub-tab"}
          >
            {tab}
          </span>
        ))}
      </nav>

      <TekliflerKatmanTabs active="musteri" tabs={layer.tabs} />

      <div className="tkm-workspace">
        <div className="tkm-main">
          <article className="tkm-snapshot-card">
            <header className="tkm-snapshot-head">
              <div>
                <span className="tkm-eyebrow">MÜ�?TERİ SNAPSHOT</span>
                <h2>{header.customer}</h2>
              </div>
              <div className="tkm-risk-box">
                <span className="tkm-eyebrow">RİSK DURUMU</span>
                <TeklifBadge tone="bad">{musteriPage.risk.label}</TeklifBadge>
                <ul>
                  {musteriPage.risk.items.map((item) => (
                    <li key={item.label} className={`tkm-risk-item tkm-risk-item--${item.tone}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
                <a className="tkm-link" href="#">
                  Risk Detaylarını Gör →
                </a>
              </div>
            </header>
            <div className="tkm-snapshot-metrics">
              {musteriPage.snapshot.map((m) => (
                <div key={m.label} className={m.tone ? `tkm-metric tkm-metric--${m.tone}` : "tkm-metric"}>
                  <span className="tkm-metric-label">{m.label}</span>
                  <strong>
                    {m.value}
                    {m.sub ? <small>{m.sub}</small> : null}
                  </strong>
                </div>
              ))}
            </div>
          </article>

          <article className="tkm-history-card">
            <header className="tkm-history-head">
              <h2>Teklif Geçmişi</h2>
              <div className="tkm-history-filters">
                <input type="search" placeholder="Teklif ara..." readOnly aria-label="Teklif ara" />
                <select defaultValue="all" aria-label="Durum">
                  <option value="all">Durum</option>
                </select>
                <select defaultValue="12" aria-label="Tarih aralığı">
                  <option value="12">Son 12 Ay</option>
                </select>
                <select defaultValue="all" aria-label="Oluşturan">
                  <option value="all">Oluşturan</option>
                </select>
                <button type="button" className="tkm-btn tkm-btn--primary tkm-btn--sm">
                  Filtrele
                </button>
              </div>
            </header>

            <div className="tkm-table-wrap">
              <table className="tkm-table">
                <thead>
                  <tr>
                    <th>Teklif No</th>
                    <th>Başlık</th>
                    <th>Toplam Tutar</th>
                    <th>Oluşturulma</th>
                    <th>Bitiş Tarihi</th>
                    <th>Durum</th>
                    <th>Olasılık</th>
                    <th>Oluşturan</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {musteriHistory.map((row) => (
                    <tr key={row.no}>
                      <td>{row.no}</td>
                      <td>{row.title}</td>
                      <td>{row.amount}</td>
                      <td>{row.created}</td>
                      <td>{row.end}</td>
                      <td>
                        <TeklifBadge tone={statusTone(row.status)}>{row.status}</TeklifBadge>
                      </td>
                      <td>{row.prob}</td>
                      <td>{row.owner}</td>
                      <td className="tkm-cell-actions">
                        <button type="button" aria-label="Görüntüle">
                          Gör
                        </button>
                        <button type="button" aria-label="Menü">
                          ···
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="tkm-table-foot">
              <span>Toplam 28 kayıt</span>
              <div className="tkm-pagination">
                <select defaultValue="10" aria-label="Sayfa boyutu">
                  <option value="10">10 satır</option>
                </select>
                <div className="tkm-page-nums">
                  <button type="button" className="tkm-page-btn tkm-page-btn--active">
                    1
                  </button>
                  <button type="button" className="tkm-page-btn">
                    2
                  </button>
                  <button type="button" className="tkm-page-btn">
                    3
                  </button>
                </div>
              </div>
            </footer>
          </article>
        </div>

        <aside className="tkm-context tkm-context--musteri" aria-label="Müşteri bağlamı">
          <header className="tkm-context-head">
            <h2>Müşteri Bağlamı</h2>
          </header>

          <div className="tkm-musteri-hero">
            <span className="tkm-musteri-logo">K</span>
            <div>
              <h3>{header.customer}</h3>
              <p>{musteriContext.code}</p>
              <TeklifBadge>{musteriContext.badge}</TeklifBadge>
            </div>
          </div>

          <dl className="tkm-dl">
            {musteriContext.fields.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <section className="tkm-context-block">
            <div className="tkm-block-head">
              <h3>İletişim Kişileri</h3>
              <a className="tkm-link" href="#">
                Tümü (3) →
              </a>
            </div>
            <ul className="tkm-contacts">
              {musteriContext.contacts.map((c) => (
                <li key={c.email}>
                  <UserAvatar name={c.name} />
                  <div>
                    <strong>
                      {c.name}
                      {c.primary ? <span className="tkm-star" aria-label="Birincil">★</span> : null}
                    </strong>
                    <span>{c.role}</span>
                    <span className="tkm-muted">{c.email}</span>
                    <span className="tkm-muted">{c.phone}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="tkm-context-block">
            <h3>Limit Bilgileri</h3>
            <dl className="tkm-dl tkm-dl--summary">
              <div>
                <dt>Kredi Limiti</dt>
                <dd>{musteriContext.limits.credit}</dd>
              </div>
              <div>
                <dt>Kullanılan Limit</dt>
                <dd>{musteriContext.limits.used}</dd>
              </div>
              <div className="tkm-dl-row--ok">
                <dt>Kalan Limit</dt>
                <dd>{musteriContext.limits.remaining}</dd>
              </div>
            </dl>
            <div className="tkm-donut" aria-label={`%${musteriContext.limits.usagePct} kullanım`}>
              <span className="tkm-donut-ring" style={{ ["--pct" as string]: musteriContext.limits.usagePct }} />
              <strong>%{musteriContext.limits.usagePct}</strong>
              <span>Kullanım Oranı</span>
            </div>
          </section>

          <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--block">
            Müşteri Detayına Git →
          </button>
        </aside>
      </div>
    </div>
  );
}

