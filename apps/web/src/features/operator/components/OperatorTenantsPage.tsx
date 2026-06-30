"use client";

import { useEffect, useState } from "react";
import { listOperatorTenants, type OperatorTenantSummary } from "../queries/announcement-videos-operator";

export function OperatorTenantsPage() {
  const [tenants, setTenants] = useState<OperatorTenantSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listOperatorTenants()
      .then(setTenants)
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="hz-operator-page" data-page="operator-tenants">
      <header className="hz-operator-page-head">
        <h2>Kiracılar</h2>
        <p>Tüm SaaS müşterilerinin durum, plan ve modül özetini bu listeden izleyin.</p>
      </header>

      <section className="hz-operator-panel">
        {loading ? (
          <p className="hz-operator-empty" role="status">
            Kiracı listesi yükleniyor…
          </p>
        ) : (
          <div className="hz-operator-table-wrap">
            <table className="hz-operator-table">
              <thead>
                <tr>
                  <th>Kiracı</th>
                  <th>Slug</th>
                  <th>Plan</th>
                  <th>Durum</th>
                  <th>Modüller</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <strong>{tenant.name}</strong>
                      <span className="hz-operator-table-sub">{tenant.id}</span>
                    </td>
                    <td>{tenant.slug}</td>
                    <td>{tenant.planCode}</td>
                    <td>{tenant.status}</td>
                    <td>{tenant.modules.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="hz-operator-note">
        Kiracı oluşturma, askıya alma ve plan atama akışları bir sonraki platform operatör sprintinde DB destekli
        olacaktır.
      </p>
    </div>
  );
}
