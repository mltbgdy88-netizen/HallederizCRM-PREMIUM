"use client";

import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { kumRoleClass } from "@/features/kullanicilar/data/kullanicilar-operasyon-mock";
import { useKullanicilarReferenceData } from "@/features/kullanicilar/hooks/use-kullanicilar-reference-data";

export function KullanicilarOperasyonPage() {
  const {
    data: {
      title: KUM_TITLE,
      subtitle: KUM_SUBTITLE,
      kpis: KUM_KPIS,
      filterSearch: KUM_FILTER_SEARCH,
      filters: KUM_FILTERS,
      tableRows: KUM_TABLE_ROWS,
      tableTotal: KUM_TABLE_TOTAL,
      pageNumbers: KUM_PAGE_NUMBERS,
      getContext: getKumContext
    }
  } = useKullanicilarReferenceData();
  const [selectedId, setSelectedId] = useState("1");
  const ctx = getKumContext(selectedId);

  return (
    <div className="kum-home">
      <header className="kum-head">
        <div className="kum-head-text">
          <h1>{KUM_TITLE}</h1>
          <p>{KUM_SUBTITLE}</p>
        </div>
        <div className="kum-head-actions">
          <button type="button" className="kum-btn kum-btn--primary">
            + Yeni Kullanıcı
          </button>
          <button type="button" className="kum-btn kum-btn--outline">
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="kum-kpi-row">
        {KUM_KPIS.map((kpi) => (
          <article key={kpi.id} className={`kum-kpi-card kum-kpi-card--${kpi.tone}`}>
            <div className={`kum-kpi-icon kum-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="kum-kpi-body">
              <span className="kum-kpi-value">{kpi.value}</span>
              <span className="kum-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="kum-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="kum-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="kum-workspace">
        <section className="kum-main">
          <div className="kum-filters">
            <label className="kum-filter-search">
              <IconSearch className="kum-filter-search-icon" />
              <input type="search" placeholder={KUM_FILTER_SEARCH} readOnly aria-label="Kullanıcı ara" />
            </label>
            {KUM_FILTERS.map((f) => (
              <label key={f.id} className="kum-filter-field">
                <span>{f.label}</span>
                <select defaultValue="all" aria-label={f.label}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button type="button" className="kum-filter-reset">
              <IconRefresh className="kum-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="kum-table-panel">
            <div className="kum-table-wrap">
              <table className="kum-table">
                <thead>
                  <tr>
                    <th>Ad</th>
                    <th>Rol</th>
                    <th>Son Giriş</th>
                    <th>Durum</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {KUM_TABLE_ROWS.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "kum-row kum-row--selected" : "kum-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>
                        <span className="kum-user-name">{row.name}</span>
                        <span className="kum-user-email">{row.email}</span>
                      </td>
                      <td>
                        <span className={`kum-badge${kumRoleClass(row.role)}`}>{row.role}</span>
                      </td>
                      <td>{row.lastLogin}</td>
                      <td>
                        <span className={row.status === "Aktif" ? "kum-badge kum-badge--active" : "kum-badge kum-badge--passive"}>
                          {row.status}
                        </span>
                      </td>
                      <td className="kum-cell-actions">
                        <button type="button">Gör</button>
                        <button type="button">Düzenle</button>
                        <button type="button">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="kum-table-foot">
              <span>{KUM_TABLE_TOTAL}</span>
              <div className="kum-pagination">
                <label className="kum-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="kum-page-nums">
                  {KUM_PAGE_NUMBERS.map((p) => (
                    <button key={p} type="button" className={p === "1" ? "kum-page-btn kum-page-btn--active" : "kum-page-btn"}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="kum-context" aria-label="Kullanıcı bağlamı">
          <h2>Kullanıcı Bağlamı</h2>
          <div className="kum-context-hero">
            <span className="kum-avatar" aria-hidden>
              {ctx.name
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </span>
            <div>
              <strong>{ctx.name}</strong>
              <span>{ctx.email}</span>
              <span className={ctx.status === "Aktif" ? "kum-badge kum-badge--active" : "kum-badge kum-badge--passive"}>
                {ctx.status}
              </span>
            </div>
          </div>
          <dl className="kum-context-dl">
            <div>
              <dt>Rol</dt>
              <dd>{ctx.role}</dd>
            </div>
            <div>
              <dt>Departman</dt>
              <dd>{ctx.department}</dd>
            </div>
            <div>
              <dt>Son Giriş</dt>
              <dd>{ctx.lastLogin}</dd>
            </div>
            <div>
              <dt>Oluşturma</dt>
              <dd>{ctx.created}</dd>
            </div>
          </dl>
          <article className="kum-perm-card">
            <h3>Yetki Özeti</h3>
            <dl className="kum-context-dl kum-context-dl--compact">
              {ctx.permissions.map((p) => (
                <div key={p.label}>
                  <dt>{p.label}</dt>
                  <dd>{p.value}</dd>
                </div>
              ))}
            </dl>
          </article>
          <article className="kum-perm-card">
            <h3>Rol Yetkileri</h3>
            <ul className="kum-perm-list">
              {ctx.rolePerms.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </article>
          <footer className="kum-context-actions">
            <button type="button" className="kum-btn kum-btn--primary kum-btn--block">
              Kullanıcıyı Düzenle
            </button>
            <button type="button" className="kum-btn kum-btn--outline kum-btn--block">
              Parola Sıfırla
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

