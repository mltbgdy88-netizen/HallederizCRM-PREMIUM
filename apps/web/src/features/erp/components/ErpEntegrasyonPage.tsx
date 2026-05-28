"use client";

import { useState } from "react";
import { IconInfo, KpiIcon } from "@/components/reference/icons";
import { eemStatusClass } from "@/features/erp/data/erp-entegrasyon-mock";
import { useErpReferenceData } from "@/features/erp/hooks/use-erp-reference-data";

export function ErpEntegrasyonPage() {
  const {
    data: {
      title: EEM_TITLE,
      subtitle: EEM_SUBTITLE,
      kpis: EEM_KPIS,
      tabs: EEM_TABS,
      tableRows: EEM_TABLE_ROWS,
      tableTotal: EEM_TABLE_TOTAL,
      pageNumbers: EEM_PAGE_NUMBERS,
      connections: EEM_CONNECTIONS,
      health: EEM_HEALTH
    }
  } = useErpReferenceData();
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="eem-home">
      <header className="eem-head">
        <div className="eem-head-text">
          <h1>{EEM_TITLE}</h1>
          <p>{EEM_SUBTITLE}</p>
        </div>
        <div className="eem-head-actions">
          <button type="button" className="eem-btn eem-btn--primary">
            + Yeni Entegrasyon
          </button>
          <button type="button" className="eem-btn eem-btn--outline">
            Entegrasyon Ayarları
          </button>
          <button type="button" className="eem-btn eem-btn--outline">
            Yenile
          </button>
        </div>
      </header>

      <section className="eem-kpi-row">
        {EEM_KPIS.map((kpi) => (
          <article key={kpi.id} className={`eem-kpi-card eem-kpi-card--${kpi.tone}`}>
            <div className={`eem-kpi-icon eem-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="eem-kpi-body">
              <span className="eem-kpi-value">{kpi.value}</span>
              <span className="eem-kpi-label">{kpi.label}</span>
              {kpi.sub ? <span className="eem-kpi-sub">{kpi.sub}</span> : null}
            </div>
            <button type="button" className="eem-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="eem-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="eem-workspace">
        <section className="eem-main">
          <div className="eem-tabs" role="tablist">
            {EEM_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={activeTab === tab.id ? "eem-tab eem-tab--active" : "eem-tab"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count != null ? ` (${tab.count})` : ""}
              </button>
            ))}
          </div>

          <div className="eem-table-panel">
            <div className="eem-table-wrap">
              <table className="eem-table">
                <thead>
                  <tr>
                    <th>Entegrasyon</th>
                    <th>Olay Tipi</th>
                    <th>Durum</th>
                    <th>Zaman</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {EEM_TABLE_ROWS.map((row) => (
                    <tr key={row.id} className="eem-row">
                      <td>
                        <span className="eem-erp-logo">{row.erpLogo}</span>
                        <span>{row.erp}</span>
                      </td>
                      <td>{row.eventType}</td>
                      <td>
                        <span className={`eem-badge${eemStatusClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td>{row.time}</td>
                      <td className="eem-cell-actions">
                        <button type="button">Gör</button>
                        {row.status !== "Başarılı" ? <button type="button">Tekrar</button> : null}
                        {row.status === "Bekliyor" ? <button type="button">▶</button> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="eem-table-foot">
              <span>{EEM_TABLE_TOTAL}</span>
              <div className="eem-pagination">
                <label className="eem-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="eem-page-nums">
                  {EEM_PAGE_NUMBERS.map((p) => (
                    <button key={p} type="button" className={p === "1" ? "eem-page-btn eem-page-btn--active" : "eem-page-btn"}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="eem-context" aria-label="Bağlantı durumu">
          <h2>Bağlantı Durumu</h2>
          {EEM_CONNECTIONS.map((c) => (
            <article key={c.id} className="eem-conn-card">
              <header>
                <strong>{c.name}</strong>
                <span className={c.online ? "eem-badge eem-badge--ok" : "eem-badge eem-badge--err"}>
                  {c.online ? "Çevrimiçi" : "Çevrimdışı"}
                </span>
              </header>
              <dl>
                <div>
                  <dt>Endpoint</dt>
                  <dd>{c.endpoint}</dd>
                </div>
                {c.responseMs ? (
                  <div>
                    <dt>Yanıt Süresi</dt>
                    <dd>{c.responseMs}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Son Kontrol</dt>
                  <dd>{c.lastCheck}</dd>
                </div>
              </dl>
            </article>
          ))}
          <article className="eem-health-card">
            <h3>Sistem Sağlığı</h3>
            <ul>
              {EEM_HEALTH.map((h) => (
                <li key={h.label}>
                  <span className={`eem-dot eem-dot--${h.tone}`} aria-hidden />
                  {h.label}: {h.status}
                </li>
              ))}
            </ul>
          </article>
          <footer className="eem-context-actions">
            <button type="button" className="eem-btn eem-btn--outline eem-btn--block">
              Entegrasyon Raporu
            </button>
            <button type="button" className="eem-btn eem-btn--outline eem-btn--block">
              Bildirim Ayarları
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
