"use client";

import Link from "next/link";
import { useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";

const LIMIT_ROWS = [
  { id: "l1", action: "create_payment", role: "Finans", limit: "₺250.000", window: "Günlük", active: true },
  { id: "l2", action: "create_order", role: "Satış", limit: "₺500.000", window: "İşlem", active: true },
  { id: "l3", action: "create_invoice", role: "Finans", limit: "₺100.000", window: "Günlük", active: true },
  { id: "l4", action: "ai_plan_approval", role: "Yönetici", limit: "Tümü", window: "—", active: true },
  { id: "l5", action: "send_document_whatsapp", role: "Operasyon", limit: "10 belge", window: "Saatlik", active: false }
];

export function ApprovalLimitsPage() {
  const { pushToast } = useToast();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  function handleSave(id: string) {
    if (savedIds.includes(id)) return;
    setSavedIds((prev) => [...prev, id]);
    pushToast("Demo modda limit kaydı toast-only alındı. Canlı policy motoru bağlı değildir.");
  }

  return (
    <section className="apvf-page hz-approvals-limits-page">
      <div className="apvf-shell">
        <header className="apvf-header">
          <div className="apvf-header__main">
            <p className="apvf-header__eyebrow">Onaylar</p>
            <h1>Limit ve Eşik Matrisi</h1>
            <p className="apvf-header__meta">Rol bazlı limit, eşik ve onay gerektiren aksiyon matrisi.</p>
          </div>
          <Link href="/onaylar" className="apvf-header__back">
            ← Onay masası
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="apvf-demo-band" role="status">
            Örnek veri modu: limit kaydetme toast-only; gerçek policy mutation bağlı değildir.
          </p>
        ) : null}

        <main className="apvf-main">
          <div className="apvf-table-wrap" role="region" aria-label="Limit matrisi tablosu">
            <table className="apvf-table">
              <thead>
                <tr>
                  <th>Aksiyon</th>
                  <th>Rol</th>
                  <th>Limit</th>
                  <th>Pencere</th>
                  <th>Durum</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {LIMIT_ROWS.map((row) => (
                  <tr key={row.id}>
                    <td>{row.action}</td>
                    <td>{row.role}</td>
                    <td>{row.limit}</td>
                    <td>{row.window}</td>
                    <td>{row.active ? "Aktif" : "Pasif"}</td>
                    <td>
                      <button type="button" className="apvf-btn" onClick={() => handleSave(row.id)} disabled={savedIds.includes(row.id)}>
                        {savedIds.includes(row.id) ? "Kaydedildi" : "Kaydet"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="apvf-note">
            Kurallar ekranı için <Link href="/onaylar/kurallar">onay kuralları matrisi</Link> kullanılabilir.
          </p>
        </main>
      </div>
    </section>
  );
}
