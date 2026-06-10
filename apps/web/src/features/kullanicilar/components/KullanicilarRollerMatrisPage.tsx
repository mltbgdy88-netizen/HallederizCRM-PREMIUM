"use client";

import type { KrmPermLevel } from "@/features/kullanicilar/data/kullanicilar-roller-matris-mock";
import { useKullanicilarRollerReferenceData } from "@/features/kullanicilar/hooks/use-kullanicilar-roller-reference-data";

function PermCell({ level }: { level: KrmPermLevel }) {
  if (level === "full") {
    return (
      <span className="krm-perm krm-perm--full" title="Tam Yetki" aria-label="Tam Yetki">
        ✓
      </span>
    );
  }
  if (level === "limited") {
    return (
      <span className="krm-perm krm-perm--limited" title="Kısıtlı Yetki" aria-label="Kısıtlı Yetki">
        −
      </span>
    );
  }
  return (
    <span className="krm-perm krm-perm--none" title="Yetki Yok" aria-label="Yetki Yok">
      —
    </span>
  );
}

export function KullanicilarRollerMatrisPage() {
  const {
    data: {
      title: KRM_TITLE,
      subtitle: KRM_SUBTITLE,
      modules: KRM_MODULES,
      roles: KRM_ROLES,
      legend: KRM_LEGEND,
      filters: KRM_FILTERS,
      footerNote: KRM_FOOTER_NOTE
    }
  } = useKullanicilarRollerReferenceData();

  return (
    <div className="krm-home">
      <header className="krm-head">
        <div className="krm-head-text">
          <h1>{KRM_TITLE}</h1>
          <p>{KRM_SUBTITLE}</p>
        </div>
        <div className="krm-head-actions">
          <button type="button" className="krm-btn krm-btn--outline">
            Raporu Dışa Aktar
          </button>
          <button type="button" className="krm-btn krm-btn--primary">
            Yetki �?ablonları
          </button>
        </div>
      </header>

      <div className="krm-filters">
        {KRM_FILTERS.map((f) => (
          <label key={f.id} className="krm-filter-field">
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
        <label className="krm-filter-search">
          <input type="search" placeholder="Rol ara..." readOnly aria-label="Rol ara" />
        </label>
        <button type="button" className="krm-btn krm-btn--outline">
          Filtreleri Temizle
        </button>
      </div>

      <ul className="krm-legend" aria-label="Yetki açıklamaları">
        {KRM_LEGEND.map((l) => (
          <li key={l.level}>
            <PermCell level={l.level} />
            <div>
              <strong>{l.label}</strong>
              <span>{l.detail}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="krm-matrix-wrap">
        <table className="krm-matrix">
          <thead>
            <tr>
              <th className="krm-matrix-sticky">Rol</th>
              {KRM_MODULES.map((m) => (
                <th key={m.id}>{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KRM_ROLES.map((role) => (
              <tr key={role.id}>
                <th className="krm-matrix-sticky">
                  <strong>{role.name}</strong>
                  <span>{role.description}</span>
                </th>
                {role.permissions.map((perm, i) => (
                  <td key={`${role.id}-${KRM_MODULES[i]?.id}`}>
                    <PermCell level={perm} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="krm-footer-info" role="note">
        {KRM_FOOTER_NOTE}
      </div>
    </div>
  );
}

