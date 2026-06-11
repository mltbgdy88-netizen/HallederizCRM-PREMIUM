"use client";

import Link from "next/link";
import { useToast } from "../../../providers/toast-provider";
import { useRolesDeskState } from "../hooks/use-roles-desk-state";

export function RolesMatrixReferenceLayout() {
  const { pushToast } = useToast();
  const desk = useRolesDeskState();

  return (
    <div className="admf-home" data-page="roles-matrix-reference" aria-live="polite">
      <header className="admf-head">
        <div className="admf-head-text">
          <h1>Roller ve Yetkiler</h1>
          <p>Rol matrisi mevcut yetki modeline göre görüntülenir; atama API üzerinden yapılır.</p>
        </div>
        <div className="admf-head-actions">
          <Link href="/kullanicilar" className="admf-btn admf-btn--outline">
            Kullanıcı listesi
          </Link>
          <button
            type="button"
            className="admf-btn admf-btn--primary"
            disabled
            title="Rol atama API üzerinden yapılır"
          >
            Rol ata (yetki gerekir)
          </button>
        </div>
      </header>

      {desk.usingDemoData ? (
        <p className="admf-demo-band" role="status">
          Demo veri: API boş veya erişilemez durumda varsayılan rol şablonları gösterilir.
        </p>
      ) : (
        <p className="admf-demo-band" role="status" style={{ borderColor: "#bbf7d0", background: "#ecfdf5", color: "#065f46" }}>
          Yetki değişiklikleri canlı politika ve onay akışıyla yönetilir; sahte rol üretilmez.
        </p>
      )}

      <section className="admf-kpi-row" aria-label="Rol özeti">
        <article className="admf-kpi">
          <span className="admf-kpi-label">Şablon</span>
          <span className="admf-kpi-value">{desk.loading ? "—" : desk.kpis.total}</span>
        </article>
        <article className="admf-kpi">
          <span className="admf-kpi-label">Onaylı rol</span>
          <span className="admf-kpi-value">{desk.loading ? "—" : desk.kpis.approvalEnabled}</span>
        </article>
        <article className="admf-kpi">
          <span className="admf-kpi-label">Filtrede</span>
          <span className="admf-kpi-value">{desk.loading ? "—" : desk.kpis.shown}</span>
        </article>
        <article className="admf-kpi">
          <span className="admf-kpi-label">Durum</span>
          <span className="admf-kpi-value">{desk.loading ? "Yükleniyor" : "Canlı model"}</span>
        </article>
      </section>

      <div className="admf-workspace">
        <section className="admf-main" aria-label="Rol matrisi">
          <div className="admf-filter-row">
            <div className="admf-filter-field">
              <label className="admf-filter-label" htmlFor="admf-roles-search">
                Ara
              </label>
              <input
                id="admf-roles-search"
                className="admf-filter-input"
                value={desk.search}
                onChange={(e) => desk.setSearch(e.target.value)}
                placeholder="Rol adı veya kod"
              />
            </div>
          </div>

          <div className="admf-list-header admf-roles-grid" role="row">
            <div role="columnheader">Rol</div>
            <div role="columnheader">Kod</div>
            <div role="columnheader">Modül erişimi</div>
            <div role="columnheader">Onay</div>
            <div role="columnheader">Aksiyon</div>
          </div>

          <div className="admf-list-body" aria-busy={desk.loading}>
            {desk.loading ? <p className="admf-state" role="status">Rol şablonları yükleniyor…</p> : null}
            {!desk.loading && desk.filtered.length === 0 ? (
              <p className="admf-state" role="status">Canlı veri bekleniyor veya şablon bulunamadı.</p>
            ) : null}
            {!desk.loading
              ? desk.filtered.map((preset) => (
                  <div
                    key={preset.id}
                    role="row"
                    className={`admf-list-row admf-roles-grid${desk.selectedId === preset.id ? " admf-list-row--selected" : ""}`}
                    onClick={() => desk.setSelectedId(preset.id)}
                  >
                    <div className="admf-cell-strong" role="cell">
                      {preset.name}
                    </div>
                    <div role="cell">
                      <span className="admf-badge admf-badge--neutral">{preset.code}</span>
                    </div>
                    <div className="admf-cell-muted" role="cell">
                      {preset.moduleAccess.slice(0, 4).join(", ")}
                      {preset.moduleAccess.length > 4 ? "…" : ""}
                    </div>
                    <div role="cell">
                      <span className={preset.approvalEnabled ? "admf-badge admf-badge--success" : "admf-badge admf-badge--neutral"}>
                        {preset.approvalEnabled ? "Evet" : "Hayır"}
                      </span>
                    </div>
                    <div role="cell">
                      <button
                        type="button"
                        className="admf-btn admf-btn--outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          pushToast("Demo: rol detayı sonraki fazda bağlanacak.");
                        }}
                      >
                        İncele
                      </button>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </section>

        <aside className="admf-side" aria-label="Seçili rol">
          {desk.selected ? (
            <div className="admf-side-card">
              <h2>
                {desk.selected.name}{" "}
                <span className="admf-badge admf-badge--neutral">{desk.selected.code}</span>
              </h2>
              <p>{desk.selected.description}</p>
              <ul className="admf-side-list">
                <li>
                  <span>Onay zorunlu</span>
                  <span>{desk.selected.approvalEnabled ? "Evet" : "Hayır"}</span>
                </li>
                <li>
                  <span>Modül sayısı</span>
                  <span>{desk.selected.moduleAccess.length}</span>
                </li>
              </ul>
              <p className="admf-cell-muted" style={{ marginTop: 8 }}>
                Modüller: {desk.selected.moduleAccess.join(", ")}
              </p>
              <div className="admf-side-actions">
                <button
                  type="button"
                  className="admf-btn admf-btn--outline"
                  disabled
                  onClick={() => pushToast("Demo: yetki matrisi düzenleme sonraki fazda bağlanacak.")}
                >
                  Matrisi incele
                </button>
              </div>
            </div>
          ) : (
            <div className="admf-side-card">
              <p className="admf-state">Listeden bir rol seçin.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
