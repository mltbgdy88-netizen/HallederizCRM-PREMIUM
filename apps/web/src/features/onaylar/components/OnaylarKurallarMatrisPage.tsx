"use client";

import { useState } from "react";
import { IconRefresh, IconSearch } from "@/components/reference/icons";
import { useOnaylarReferenceData } from "@/features/onaylar/hooks/use-onaylar-reference-data";

function okrRoleClass(role: string): string {
  if (role === "Genel Müdür" || role === "Yönetici") return " okr-badge--gold";
  if (role === "Finans Müdürü") return " okr-badge--teal";
  return " okr-badge--green";
}

function mapRoleFromIcon(icon: "stock" | "customer" | "document" | "finance"): string {
  if (icon === "finance") return "Finans Müdürü";
  if (icon === "document") return "Genel Müdür";
  if (icon === "customer") return "Satış Müdürü";
  return "Satış Yetkilisi";
}

export function OnaylarKurallarMatrisPage() {
  const { page, kpis, pending, pagination, getDetailForId } = useOnaylarReferenceData();
  const [selectedId, setSelectedId] = useState(pending[0]?.id ?? "1");
  const detail = getDetailForId(selectedId);
  const selectedItem = pending.find((item) => item.id === selectedId) ?? pending[0];
  const tableRows = pending.map((item) => ({
    id: item.id,
    transactionType: item.ref.split("•")[1]?.trim() ?? item.title,
    limit: "Dinamik",
    role: mapRoleFromIcon(item.icon),
    requiredApproval: getDetailForId(item.id).priority === "Yüksek" ? "2 Onay" : "1 Onay",
    active: true
  }));
  const filters = [
    { id: "role", label: "Rol", options: [{ label: "Tümü", value: "all" }] },
    { id: "type", label: "İşlem Tipi", options: [{ label: "Tümü", value: "all" }] },
    { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
    { id: "currency", label: "Para Birimi", options: [{ label: "TRY", value: "try" }] }
  ];

  return (
    <div className="okr-home">
      <header className="okr-head">
        <div className="okr-head-text">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <div className="okr-head-actions">
          <button type="button" className="okr-btn okr-btn--primary">
            + Yeni Kural
          </button>
          <button type="button" className="okr-btn okr-btn--outline">
            Kural Grupları
          </button>
        </div>
      </header>

      <section className="okr-kpi-row">
        {kpis.slice(0, 4).map((kpi) => (
          <article key={kpi.label} className="okr-kpi-card">
            <span className="okr-kpi-value">{kpi.value}</span>
            <span className="okr-kpi-label">{kpi.label}</span>
          </article>
        ))}
        <span className="okr-last-update">Son güncelleme: {detail.dateTime}</span>
      </section>

      <div className="okr-workspace">
        <section className="okr-main">
          <div className="okr-filters">
            <label className="okr-filter-search">
              <IconSearch className="okr-filter-search-icon" />
              <input type="search" placeholder="Kural ara..." readOnly aria-label="Kural ara" />
            </label>
            {filters.map((f) => (
              <label key={f.id} className="okr-filter-field">
                <span>{f.label}</span>
                <select defaultValue={f.options[0]?.value} aria-label={f.label}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button type="button" className="okr-filter-reset">
              <IconRefresh className="okr-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="okr-table-panel">
            <div className="okr-table-wrap">
              <table className="okr-table">
                <thead>
                  <tr>
                    <th>İşlem Tipi</th>
                    <th>Limit</th>
                    <th>Rol</th>
                    <th>Gerekli Onay</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "okr-row okr-row--selected" : "okr-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>{row.transactionType}</td>
                      <td>{row.limit}</td>
                      <td>
                        <span className={`okr-badge${okrRoleClass(row.role)}`}>{row.role}</span>
                      </td>
                      <td>{row.requiredApproval}</td>
                      <td className="okr-cell-actions">
                        <button type="button" aria-label="Düzenle">
                          ✎
                        </button>
                        <button type="button" aria-label="Kopyala">
                          ⧉
                        </button>
                        <label className="okr-toggle">
                          <input type="checkbox" defaultChecked={row.active} readOnly aria-label="Aktif" />
                          <span />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="okr-table-foot">
              <span>{pagination.totalLabel}</span>
              <div className="okr-pagination">
                <label className="okr-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="okr-page-nums">
                  {["1"].map((p) => (
                    <button key={p} type="button" className={Number(pagination.page) === Number(p) ? "okr-page-btn okr-page-btn--active" : "okr-page-btn"}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="okr-detail" aria-label="Kural detayı">
          <header>
            <h2>Kural Detayı</h2>
            <span className="okr-badge okr-badge--active">Aktif</span>
          </header>
          <h3>{detail.title}</h3>
          <p className="okr-detail-type">{detail.ref}</p>
          <p className="okr-detail-desc">{detail.description}</p>
          <dl className="okr-detail-dl">
            <div>
              <dt>Öncelik</dt>
              <dd>{detail.priority ?? "—"}</dd>
            </div>
            <div>
              <dt>Oluşturma</dt>
              <dd>{detail.dateTime}</dd>
            </div>
            <div>
              <dt>Son Güncelleme</dt>
              <dd>{detail.dateTime}</dd>
            </div>
          </dl>
          <article className="okr-detail-section">
            <h4>Limit Bilgileri</h4>
            <dl className="okr-detail-dl">
              <div>
                <dt>Para Birimi</dt>
                <dd>TRY</dd>
              </div>
              <div>
                <dt>Limit Tipi</dt>
                <dd>Dinamik</dd>
              </div>
              <div>
                <dt>Min / Max</dt>
                <dd>
                  — — —
                </dd>
              </div>
            </dl>
          </article>
          <article className="okr-detail-section">
            <h4>Onay Bilgileri</h4>
            <dl className="okr-detail-dl">
              <div>
                <dt>Gerekli Onay</dt>
                <dd>{detail.priority === "Yüksek" ? "2" : "1"}</dd>
              </div>
              <div>
                <dt>Sıra</dt>
                <dd>Sıralı</dd>
              </div>
              <div>
                <dt>Onaylayan Rol</dt>
                <dd>
                  <span className={`okr-badge${okrRoleClass(mapRoleFromIcon(selectedItem?.icon ?? "stock"))}`}>
                    {mapRoleFromIcon(selectedItem?.icon ?? "stock")}
                  </span>
                </dd>
              </div>
            </dl>
          </article>
          <article className="okr-detail-section">
            <h4>Koşullar</h4>
            <ul className="okr-conditions">
              {detail.history.map((h) => (
                <li key={h.id}>{h.title}</li>
              ))}
            </ul>
          </article>
          <footer className="okr-detail-actions">
            <button type="button" className="okr-btn okr-btn--primary okr-btn--block">
              Düzenle
            </button>
            <button type="button" className="okr-btn okr-btn--outline okr-btn--block">
              Devre Dışı Bırak
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
