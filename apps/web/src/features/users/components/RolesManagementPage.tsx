"use client";

import type { RolePresetItem } from "@hallederiz/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listRolePresetsApi } from "../../../services/api";

export function RolesManagementPage() {
  const [presets, setPresets] = useState<RolePresetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    void listRolePresetsApi()
      .then((items) => {
        if (!active) return;
        setPresets(items);
      })
      .catch(() => {
        if (!active) setPresets([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [presets, search]);

  return (
    <div className="hz-roles-page hz-page-stack">
      <header className="hz-roles-topbar">
        <div>
          <h1 className="hz-roles-topbar-title">Roller ve yetkiler</h1>
          <p className="hz-roles-topbar-sub">Rol matrisi mevcut yetki modeline göre görüntülenir; atama API üzerinden yapılır.</p>
        </div>
        <Link className="hz-btn hz-btn-secondary" href="/kullanicilar">
          Kullanıcı listesi
        </Link>
      </header>

      <p className="hz-roles-preview-band" role="status">
        Yetki değişiklikleri canlı politika ve onay akışıyla yönetilir; sahte rol veya yetki üretilmez.
      </p>

      <p className="hz-roles-permission-note">
        Kritik izinler yalnız yetkili kullanıcılar tarafından değiştirilebilir. Bu ekran salt okunur inceleme içindir.
      </p>

      <section className="hz-roles-kpi-strip" aria-label="Özet">
        <div className="hz-roles-kpi">
          <span className="hz-roles-kpi-label">Şablon</span>
          <span className="hz-roles-kpi-value">{loading ? "—" : String(presets.length)}</span>
        </div>
        <div className="hz-roles-kpi">
          <span className="hz-roles-kpi-label">Onaylı rol</span>
          <span className="hz-roles-kpi-value">
            {loading ? "—" : String(presets.filter((p) => p.approvalEnabled).length)}
          </span>
        </div>
        <div className="hz-roles-kpi">
          <span className="hz-roles-kpi-label">Filtrede</span>
          <span className="hz-roles-kpi-value">{loading ? "—" : String(filtered.length)}</span>
        </div>
        <div className="hz-roles-kpi">
          <span className="hz-roles-kpi-label">Durum</span>
          <span className="hz-roles-kpi-value">{loading ? "Yükleniyor" : "Canlı model"}</span>
        </div>
      </section>

      <div className="hz-roles-filter-row">
        <div className="hz-roles-filter-field">
          <label className="hz-roles-filter-label" htmlFor="hz-roles-search">
            Ara
          </label>
          <input
            id="hz-roles-search"
            className="hz-roles-filter-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rol adı veya kod"
          />
        </div>
        <button type="button" className="hz-btn hz-btn-secondary" disabled title="Rol atama API üzerinden yapılır">
          Rol ata (yetki gerekir)
        </button>
      </div>

      <div className="hz-roles-matrix-wrap" role="region" aria-label="Rol şablonları" aria-busy={loading}>
        {loading ? <p role="status">Rol şablonları yükleniyor…</p> : null}
        {!loading && filtered.length === 0 ? (
          <p role="status">Canlı veri bekleniyor veya şablon bulunamadı.</p>
        ) : null}
        {!loading
          ? filtered.map((preset) => (
              <article key={preset.id} className="hz-roles-matrix-card">
                <h3>
                  {preset.name}{" "}
                  <span className="hz-badge hz-badge-neutral">{preset.code}</span>
                </h3>
                <p>{preset.description}</p>
                <p className="hz-users-cell-muted">
                  Modül erişimi: {preset.moduleAccess.join(", ")} · Onay: {preset.approvalEnabled ? "Evet" : "Hayır"}
                </p>
                <button type="button" className="hz-btn hz-btn-secondary" disabled title="Detay API ile açılır">
                  İncele
                </button>
              </article>
            ))
          : null}
      </div>
    </div>
  );
}
