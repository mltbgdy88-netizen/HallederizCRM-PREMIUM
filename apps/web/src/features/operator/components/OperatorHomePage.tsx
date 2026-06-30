"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listOperatorTenants, type OperatorTenantSummary } from "../queries/announcement-videos-operator";

const QUICK_LINKS = [
  {
    href: "/operator/kiracilar",
    title: "Kiracılar",
    description: "Tüm SaaS müşterilerini, durumlarını ve plan atamalarını görüntüleyin."
  },
  {
    href: "/operator/paketler",
    title: "Paketler",
    description: "Core, premium ve enterprise paket modüllerini yönetin."
  },
  {
    href: "/operator/duyuru-videolari",
    title: "Duyuru Videoları",
    description: "Dashboard video yayınlarını hedef kiracı veya paketlere göre yayınlayın."
  }
] as const;

export function OperatorHomePage() {
  const [tenants, setTenants] = useState<OperatorTenantSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listOperatorTenants()
      .then(setTenants)
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="hz-operator-page" data-page="operator-home">
      <header className="hz-operator-page-head">
        <h2>Operasyon özeti</h2>
        <p>Kiracı portföyü, paket yönetimi ve platform geneli duyuru yayınları bu konsoldan yönetilir.</p>
      </header>

      <section className="hz-operator-kpi-strip" aria-label="Kiracı özeti">
        <article className="hz-operator-kpi">
          <span>Toplam kiracı</span>
          <strong>{loading ? "—" : tenants.length}</strong>
        </article>
        <article className="hz-operator-kpi">
          <span>Aktif</span>
          <strong>{loading ? "—" : tenants.filter((tenant) => tenant.status === "active").length}</strong>
        </article>
        <article className="hz-operator-kpi">
          <span>Deneme</span>
          <strong>{loading ? "—" : tenants.filter((tenant) => tenant.status === "trial").length}</strong>
        </article>
      </section>

      <section className="hz-operator-card-grid">
        {QUICK_LINKS.map((card) => (
          <Link key={card.href} href={card.href} className="hz-operator-card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <span className="hz-operator-card-link">Aç</span>
          </Link>
        ))}
      </section>

      <p className="hz-operator-note">
        Kiracı CRM ayarları (<code>/ayarlar</code>) müşteri içi yapılandırma içindir; platform yayınları yalnızca bu
        konsoldan yönetilir.
      </p>
    </div>
  );
}
