"use client";

import type { User } from "@hallederiz/types";
import { EntityListPageTemplate, LoadingState } from "@hallederiz/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { listUsersApi } from "../../../services/api";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  invited: "Davetli",
  suspended: "Askıda"
};

function formatStatus(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void listUsersApi()
      .then((items) => {
        if (!active) return;
        setUsers(items);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setUsers([]);
        setError("Kullanıcı listesi şu an yüklenemedi. Bağlantı tamamlandığında kayıtlar burada görünecek.");
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
    return users.filter((user) => {
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${user.fullName} ${user.email} ${user.title ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search, statusFilter]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((u) => u.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(() => filtered.find((u) => u.id === selectedId) ?? null, [filtered, selectedId]);

  const kpi = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      invited: users.filter((u) => u.status === "invited").length,
      shown: filtered.length
    }),
    [users, filtered.length]
  );

  return (
    <EntityListPageTemplate
      className="hz-users-page"
      header={
        <>
          <header className="hz-users-topbar">
            <div>
              <h1 className="hz-users-topbar-title">Kullanıcılar</h1>
              <p className="hz-users-topbar-sub">Hesaplar ve erişim kapsamları mevcut yetki modeline göre listelenir.</p>
            </div>
            <div className="hz-inline-actions">
              <button type="button" className="hz-btn hz-btn-secondary" disabled title="Davet işlemi API üzerinden yapılır">
                Davet (yetki gerekir)
              </button>
              <Link className="hz-btn hz-btn-secondary" href="/kullanicilar/roller">
                Rol matrisi
              </Link>
            </div>
          </header>
          <p className="hz-users-preview-band" role="status">
            Kullanıcı yönetimi canlı veriyle gösterilir; sahte kullanıcı veya başarı mesajı üretilmez.
          </p>
        </>
      }
      summary={
        <section className="hz-users-kpi-strip" aria-label="Özet">
          <div className="hz-users-kpi">
            <span className="hz-users-kpi-label">Toplam</span>
            <span className="hz-users-kpi-value">{loading ? "—" : String(kpi.total)}</span>
          </div>
          <div className="hz-users-kpi">
            <span className="hz-users-kpi-label">Aktif</span>
            <span className="hz-users-kpi-value">{loading ? "—" : String(kpi.active)}</span>
          </div>
          <div className="hz-users-kpi">
            <span className="hz-users-kpi-label">Davetli</span>
            <span className="hz-users-kpi-value">{loading ? "—" : String(kpi.invited)}</span>
          </div>
          <div className="hz-users-kpi">
            <span className="hz-users-kpi-label">Listede</span>
            <span className="hz-users-kpi-value">{loading ? "—" : String(kpi.shown)}</span>
          </div>
        </section>
      }
      filters={
        <div className="hz-users-filter-row">
          <div className="hz-users-filter-field">
            <label className="hz-users-filter-label" htmlFor="hz-users-search">
              Ara
            </label>
            <input
              id="hz-users-search"
              className="hz-users-filter-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad, e-posta veya unvan"
            />
          </div>
          <div className="hz-users-filter-field">
            <label className="hz-users-filter-label" htmlFor="hz-users-status">
              Durum
            </label>
            <select
              id="hz-users-status"
              className="hz-users-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="invited">Davetli</option>
              <option value="inactive">Pasif</option>
              <option value="suspended">Askıda</option>
            </select>
          </div>
        </div>
      }
      isLoading={loading}
      pageState={
        loading ? (
          <LoadingState title="Kullanıcılar yükleniyor…" />
        ) : error ? (
          <p role="alert">{error}</p>
        ) : undefined
      }
      list={
        !loading && !error ? (
          <>
            <div className="hz-users-list-header" role="row">
              <div role="columnheader">Kullanıcı</div>
              <div role="columnheader">E-posta</div>
              <div role="columnheader">Durum</div>
              <div role="columnheader">Unvan</div>
              <div role="columnheader">Son giriş</div>
              <div role="columnheader">Aksiyon</div>
            </div>
            <div className="hz-users-list-body">
              {filtered.length === 0 ? (
                <p className="hz-users-cell-muted" style={{ padding: "16px 10px" }} role="status">
                  Canlı veri bekleniyor veya filtreye uygun kayıt yok.
                </p>
              ) : (
                filtered.map((user) => (
                  <div
                    key={user.id}
                    role="row"
                    className={`hz-users-row${selectedId === user.id ? " hz-users-row--selected" : ""}`}
                    onClick={() => setSelectedId(user.id)}
                    onDoubleClick={() => router.push(`/kullanicilar?focus=${encodeURIComponent(user.id)}`)}
                  >
                    <div className="hz-users-cell-strong" role="cell">
                      {user.fullName}
                    </div>
                    <div className="hz-users-cell-muted" role="cell">
                      {user.email}
                    </div>
                    <div role="cell">{formatStatus(user.status)}</div>
                    <div className="hz-users-cell-muted" role="cell">
                      {user.title ?? "—"}
                    </div>
                    <div className="hz-users-cell-muted" role="cell">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "—"}
                    </div>
                    <div role="cell">
                      <button
                        type="button"
                        className="hz-btn hz-btn-secondary hz-toolbar-btn"
                        disabled
                        title="Düzenleme API ve yetki ile yapılır"
                        onClick={(e) => e.stopPropagation()}
                      >
                        İncele
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null
      }
      preview={
        selected ? (
          <aside className="hz-users-preview-card" aria-label="Kullanıcı önizleme">
            <h2 className="hz-users-preview-title">{selected.fullName}</h2>
            <ul className="hz-users-preview-list">
              <li>
                <span>E-posta</span>
                <strong>{selected.email}</strong>
              </li>
              <li>
                <span>Durum</span>
                <strong>{formatStatus(selected.status)}</strong>
              </li>
              <li>
                <span>Unvan</span>
                <strong>{selected.title ?? "—"}</strong>
              </li>
              <li>
                <span>Son giriş</span>
                <strong>
                  {selected.lastLoginAt ? new Date(selected.lastLoginAt).toLocaleString("tr-TR") : "—"}
                </strong>
              </li>
            </ul>
            <p className="hz-users-cell-muted">Güncelleme ve davet işlemleri mevcut API ve yetki akışıyla yürütülür.</p>
          </aside>
        ) : (
          <aside className="hz-users-preview-card" aria-label="Kullanıcı önizleme">
            <p className="hz-users-cell-muted">Listeden bir kullanıcı seçin.</p>
          </aside>
        )
      }
    />
  );
}
