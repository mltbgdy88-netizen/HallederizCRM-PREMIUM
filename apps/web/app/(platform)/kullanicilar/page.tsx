"use client";

import { useEffect, useState } from "react";
import type { User } from "@hallederiz/types";
import { PageHeader } from "@hallederiz/ui";
import { listUsersApi } from "../../../src/services/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    void listUsersApi().then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Kullanıcılar"
        description="Pilot personel listesi, mobil erişim ve onay yetkilerini yönetin."
      />

      <section className="hz-content-card">
        <div className="table-wrap hz-table-wrap">
          <table className="table hz-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>E-Posta</th>
                <th>Durum</th>
                <th>Unvan</th>
                <th>Son Giriş</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td className="table-empty" colSpan={5}>Kayit bulunamadi.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.status}</td>
                    <td>{user.title ?? "-"}</td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

