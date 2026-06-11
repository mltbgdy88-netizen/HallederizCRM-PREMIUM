"use client";

import Link from "next/link";
import { useToast } from "../../../providers/toast-provider";
import {
  formatUserStatus,
  useUsersDeskState,
  userStatusBadgeClass
} from "../hooks/use-users-desk-state";

export function UsersOperationDeskReferenceLayout() {
  const { pushToast } = useToast();
  const desk = useUsersDeskState();

  return (
    <div className="admf-home" data-page="users-operation-desk-reference" aria-live="polite">
      <header className="admf-head">
        <div className="admf-head-text">
          <h1>Kullanıcı Operasyon Masası</h1>
          <p>Hesaplar, roller ve erişim kapsamları mevcut yetki modeline göre listelenir.</p>
        </div>
        <div className="admf-head-actions">
          <button
            type="button"
            className="admf-btn admf-btn--outline"
            disabled
            title="Davet işlemi API üzerinden yapılır"
          >
            Davet (yetki gerekir)
          </button>
          <Link href="/kullanicilar/roller" className="admf-btn admf-btn--primary">
            Rol matrisi
          </Link>
        </div>
      </header>

      {desk.usingDemoData ? (
        <p className="admf-demo-band" role="status">
          Demo veri: API boş veya erişilemez durumda örnek kullanıcı satırları gösterilir.
        </p>
      ) : (
        <p className="admf-demo-band" role="status" style={{ borderColor: "#bbf7d0", background: "#ecfdf5", color: "#065f46" }}>
          Canlı kullanıcı listesi tenant scope ile yüklenir; mutation aksiyonları demo toast ile sınırlıdır.
        </p>
      )}

      <section className="admf-kpi-row" aria-label="Kullanıcı özeti">
        <article className="admf-kpi">
          <span className="admf-kpi-label">Toplam</span>
          <span className="admf-kpi-value">{desk.loading ? "—" : desk.kpis.total}</span>
        </article>
        <article className="admf-kpi">
          <span className="admf-kpi-label">Aktif</span>
          <span className="admf-kpi-value">{desk.loading ? "—" : desk.kpis.active}</span>
        </article>
        <article className="admf-kpi">
          <span className="admf-kpi-label">Davetli</span>
          <span className="admf-kpi-value">{desk.loading ? "—" : desk.kpis.invited}</span>
        </article>
        <article className="admf-kpi">
          <span className="admf-kpi-label">Listede</span>
          <span className="admf-kpi-value">{desk.loading ? "—" : desk.kpis.shown}</span>
        </article>
      </section>

      <div className="admf-workspace">
        <section className="admf-main" aria-label="Kullanıcı listesi">
          <div className="admf-filter-row">
            <div className="admf-filter-field">
              <label className="admf-filter-label" htmlFor="admf-users-search">
                Ara
              </label>
              <input
                id="admf-users-search"
                className="admf-filter-input"
                value={desk.search}
                onChange={(e) => desk.setSearch(e.target.value)}
                placeholder="Ad, e-posta veya unvan"
              />
            </div>
            <div className="admf-filter-field">
              <label className="admf-filter-label" htmlFor="admf-users-status">
                Durum
              </label>
              <select
                id="admf-users-status"
                className="admf-filter-select"
                value={desk.statusFilter}
                onChange={(e) => desk.setStatusFilter(e.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="invited">Davetli</option>
                <option value="disabled">Pasif</option>
              </select>
            </div>
          </div>

          <div className="admf-list-header admf-users-grid" role="row">
            <div role="columnheader">Kullanıcı</div>
            <div role="columnheader">E-posta</div>
            <div role="columnheader">Durum</div>
            <div role="columnheader">Unvan</div>
            <div role="columnheader">Son giriş</div>
            <div role="columnheader">Aksiyon</div>
          </div>

          <div className="admf-list-body" aria-busy={desk.loading}>
            {desk.loading ? <p className="admf-state" role="status">Kullanıcılar yükleniyor…</p> : null}
            {!desk.loading && desk.filtered.length === 0 ? (
              <p className="admf-state" role="status">
                Canlı veri bekleniyor veya filtreye uygun kayıt yok.
              </p>
            ) : null}
            {!desk.loading
              ? desk.filtered.map((user) => (
                  <div
                    key={user.id}
                    role="row"
                    className={`admf-list-row admf-users-grid${desk.selectedId === user.id ? " admf-list-row--selected" : ""}`}
                    onClick={() => desk.setSelectedId(user.id)}
                  >
                    <div className="admf-cell-strong" role="cell">
                      {user.fullName}
                    </div>
                    <div className="admf-cell-muted" role="cell">
                      {user.email}
                    </div>
                    <div role="cell">
                      <span className={userStatusBadgeClass(user.status)}>{formatUserStatus(user.status)}</span>
                    </div>
                    <div className="admf-cell-muted" role="cell">
                      {user.title ?? "—"}
                    </div>
                    <div className="admf-cell-muted" role="cell">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "—"}
                    </div>
                    <div role="cell">
                      <button
                        type="button"
                        className="admf-btn admf-btn--outline"
                        disabled
                        title="Düzenleme API ve yetki ile yapılır"
                        onClick={(e) => {
                          e.stopPropagation();
                          pushToast("Demo: kullanıcı düzenleme sonraki fazda bağlanacak.");
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

        <aside className="admf-side" aria-label="Seçili kullanıcı">
          {desk.selected ? (
            <div className="admf-side-card">
              <h2>{desk.selected.fullName}</h2>
              <ul className="admf-side-list">
                <li>
                  <span>E-posta</span>
                  <span>{desk.selected.email}</span>
                </li>
                <li>
                  <span>Durum</span>
                  <span>{formatUserStatus(desk.selected.status)}</span>
                </li>
                <li>
                  <span>Unvan</span>
                  <span>{desk.selected.title ?? "—"}</span>
                </li>
                <li>
                  <span>Son giriş</span>
                  <span>
                    {desk.selected.lastLoginAt
                      ? new Date(desk.selected.lastLoginAt).toLocaleString("tr-TR")
                      : "—"}
                  </span>
                </li>
              </ul>
              <div className="admf-side-actions">
                <button
                  type="button"
                  className="admf-btn admf-btn--outline"
                  disabled
                  onClick={() => pushToast("Demo: rol atama sonraki fazda bağlanacak.")}
                >
                  Rol ata
                </button>
                <button
                  type="button"
                  className="admf-btn admf-btn--outline"
                  disabled
                  onClick={() => pushToast("Demo: hesap askıya alma sonraki fazda bağlanacak.")}
                >
                  Askıya al
                </button>
              </div>
            </div>
          ) : (
            <div className="admf-side-card">
              <p className="admf-state">Listeden bir kullanıcı seçin.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
