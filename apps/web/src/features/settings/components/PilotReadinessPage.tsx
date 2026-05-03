"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MetricCard, PageHeader, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import type { PilotReadinessItem, PilotReadinessSummary } from "../../../services/api";
import { getPilotReadinessData } from "../queries";

const GROUP_LABELS: Record<PilotReadinessItem["group"], string> = {
  company_tenant: "Sirket ve Tenant",
  pricing_category_currency: "Fiyat / Kategori / Doviz",
  warehouses_stock: "Depolar ve Stok",
  users_roles: "Kullanicilar ve Roller",
  data_import: "Veri Yukleme",
  documents_print: "Belge / Yazdirma",
  integrations: "Entegrasyonlar",
  ai_operations: "AI ve Operasyon"
};

function priorityBadgeClass(priority: PilotReadinessItem["priority"]) {
  if (priority === "critical") return "hz-badge hz-badge-danger";
  if (priority === "warning") return "hz-badge hz-badge-warning";
  if (priority === "ready") return "hz-badge hz-badge-success";
  return "hz-badge hz-badge-info";
}

function priorityLabel(priority: PilotReadinessItem["priority"]) {
  if (priority === "critical") return "Kritik";
  if (priority === "warning") return "Uyari";
  if (priority === "ready") return "Hazir";
  return "Bilgi";
}

function statusBadgeClass(status: PilotReadinessItem["status"]) {
  if (status === "tamam") return "hz-badge hz-badge-success";
  if (status === "uyari") return "hz-badge hz-badge-warning";
  return "hz-badge hz-badge-danger";
}

function statusLabel(status: PilotReadinessItem["status"]) {
  if (status === "tamam") return "Tamam";
  if (status === "uyari") return "Uyari";
  return "Eksik";
}

function readinessStateLabel(state: PilotReadinessItem["readinessState"]) {
  if (state === "go_live_blocker") return "Go-Live Bloklayici";
  if (state === "demo_gap") return "Ornek Veri Boslugu";
  if (state === "warning") return "Uyari";
  return "Hazir";
}

const QUICK_ACTIONS = [
  { label: "Sirket ayarlarini tamamla", href: "/ayarlar" },
  { label: "Fiyat slotlarini kontrol et", href: "/ayarlar" },
  { label: "Kategori alanlarini kontrol et", href: "/ayarlar" },
  { label: "Depolari kontrol et", href: "/ayarlar" },
  { label: "Kullanici ekle", href: "/kullanicilar" },
  { label: "Veri yukleme merkezine git", href: "/kurulum/veri-yukleme" },
  { label: "Hazırlık kontrolünü aç", href: "/ayarlar/staging-kontrol" },
  { label: "Belge sablonlarini ac", href: "/belgeler" },
  { label: "Yerel arac bağlantısını doğrula", href: "/ayarlar/staging-kontrol" }
] as const;

type TaskTone = "kritik" | "oneri" | "hazir";

interface RoleTaskDefinition {
  title: string;
  href: string;
  relatedItemIds?: string[];
}

const ONBOARDING_TASKS: Record<"yonetici" | "satis" | "muhasebe" | "depo" | "pazarlama", RoleTaskDefinition[]> = {
  yonetici: [
    { title: "Kullanim blokajlarini kontrol et", href: "/ayarlar/kullanim-hazirligi", relatedItemIds: ["company-profile", "import-customers", "import-products"] },
    { title: "Onay bekleyen islemleri ac", href: "/onaylar", relatedItemIds: ["service-ai"] },
    { title: "Entegrasyon sağlığını doğrula (hazırlık)", href: "/ayarlar/staging-kontrol", relatedItemIds: ["service-erp", "service-whatsapp", "service-factory", "service-local-agent"] }
  ],
  satis: [
    { title: "Fiyat slotlarini kontrol et", href: "/ayarlar", relatedItemIds: ["price-slots"] },
    { title: "Carilerde fiyat gruplarini gozden gecir", href: "/cariler", relatedItemIds: ["import-customers", "import-pricing"] },
    { title: "Teklif olusturma akisini test et", href: "/teklifler", relatedItemIds: ["import-products", "import-pricing"] }
  ],
  muhasebe: [
    { title: "Tahsilat ekranini kontrol et", href: "/tahsilatlar", relatedItemIds: ["import-customers"] },
    { title: "Ekstre ve belge akisini gozden gecir", href: "/belgeler", relatedItemIds: ["document-templates"] },
    { title: "Ödeme hatırlatma ve servis hazırlığını kontrol et", href: "/ayarlar/staging-kontrol", relatedItemIds: ["service-whatsapp", "service-ai"] }
  ],
  depo: [
    { title: "Depo tanimlarini dogrula", href: "/ayarlar", relatedItemIds: ["warehouses"] },
    { title: "Raf/lokasyon verisini kontrol et", href: "/stok", relatedItemIds: ["import-stock"] },
    { title: "Depo gorevleri ekranini ac", href: "/depo", relatedItemIds: ["service-local-agent"] }
  ],
  pazarlama: [
    { title: "WhatsApp sablonlarini kontrol et", href: "/whatsapp", relatedItemIds: ["service-whatsapp"] },
    { title: "Belge sablonlarina goz at", href: "/belgeler", relatedItemIds: ["document-templates"] },
    { title: "Raporlar ekranini ac", href: "/raporlar", relatedItemIds: ["service-ai"] }
  ]
};

function taskToneClass(tone: TaskTone) {
  if (tone === "kritik") return "hz-badge hz-badge-danger";
  if (tone === "oneri") return "hz-badge hz-badge-warning";
  return "hz-badge hz-badge-success";
}

export function PilotReadinessPage() {
  const [data, setData] = useState<PilotReadinessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getPilotReadinessData();
      setData(next);
    } catch (readinessError) {
      setError(readinessError instanceof Error ? readinessError.message : "Kullanim hazirligi bilgisi alinamadi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const criticalItems = useMemo(() => (data?.items ?? []).filter((item) => item.readinessState === "go_live_blocker"), [data]);
  const warningItems = useMemo(() => (data?.items ?? []).filter((item) => item.priority === "warning"), [data]);
  const readyItems = useMemo(() => (data?.items ?? []).filter((item) => item.priority === "ready"), [data]);
  const groupedItems = useMemo(() => {
    const buckets = new Map<PilotReadinessItem["group"], PilotReadinessItem[]>();
    for (const item of data?.items ?? []) {
      const list = buckets.get(item.group) ?? [];
      list.push(item);
      buckets.set(item.group, list);
    }
    return buckets;
  }, [data]);

  const itemById = useMemo(() => {
    const map = new Map<string, PilotReadinessItem>();
    for (const item of data?.items ?? []) {
      map.set(item.id, item);
    }
    return map;
  }, [data]);

  const getTaskTone = (relatedItemIds?: string[]): TaskTone => {
    if (!relatedItemIds || relatedItemIds.length === 0) return "hazir";
    const related = relatedItemIds.map((id) => itemById.get(id)).filter((item): item is PilotReadinessItem => Boolean(item));
    if (related.some((item) => item.blocking || item.priority === "critical")) return "kritik";
    if (related.some((item) => item.status !== "tamam")) return "oneri";
    return "hazir";
  };

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Kullanim Hazirligi Merkezi"
        description="Kritik eksikler, onboarding adimlari ve servis saglik durumlariyla canli kullanim kararini tek panelden verin."
        actions={
          <div className="hz-inline-actions">
            <Link href="/ayarlar" className="hz-btn hz-btn-secondary">
              Ayarlara Don
            </Link>
            <Link href="/ayarlar/staging-kontrol" className="hz-btn hz-btn-secondary">
              Servis Sagligi
            </Link>
          </div>
        }
      />

      <section className="hz-metric-grid">
        <MetricCard title="Tamamlanma" value={`${data?.completionRate ?? 0}%`} detail="Genel pilot readiness" tone={(data?.completionRate ?? 0) >= 80 ? "success" : "warning"} />
        <MetricCard title="Kritik Eksik" value={String(criticalItems.length)} detail="Bloklayici kalem" tone={criticalItems.length > 0 ? "danger" : "success"} />
        <MetricCard title="Uyari Sayisi" value={String(warningItems.length)} detail="Takip edilmesi gereken" tone="warning" />
        <MetricCard title="Hazir Kalem" value={String(readyItems.length)} detail="Tamamlanmis adim" tone="success" />
        <MetricCard title="Entegrasyon Sagligi" value={data?.integrationHealth.status ?? "-"} detail={`Live ${data?.integrationHealth.liveCount ?? 0} / Fallback ${data?.integrationHealth.fallbackCount ?? 0}`} tone={data?.integrationHealth.status === "healthy" ? "success" : "warning"} />
        <MetricCard title="Veri Tutarlilik Uyarisi" value={String(data?.consistencyWarnings.length ?? 0)} detail="Kritik veri kontrolu" tone={(data?.consistencyWarnings.length ?? 0) > 0 ? "warning" : "success"} />
      </section>

      <PrimaryActionToolbar>
        <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button" onClick={() => void reload()} disabled={loading}>
          {loading ? "Yukleniyor..." : "Hazirlik Durumunu Yenile"}
        </button>
      </PrimaryActionToolbar>

      {error ? (
        <section className="hz-content-card">
          <p className="muted">{error}</p>
        </section>
      ) : null}

      <section className="hz-content-card">
        <h3>Bloklayicilar</h3>
        {criticalItems.length === 0 ? (
          <p className="muted">Canli kullanimi engelleyen kritik eksik yok. Uyari seviyesindeki maddeleri tamamlayarak guvenli acilisa gecebilirsiniz.</p>
        ) : (
          <div className="hz-page-stack">
            {criticalItems.map((item) => (
              <article key={`critical-${item.id}`} className="hz-side-panel" style={{ borderLeft: "4px solid rgba(220, 38, 38, 0.55)" }}>
                <div className="hz-inline-actions" style={{ justifyContent: "space-between" }}>
                  <strong>{item.title}</strong>
                  <span className={priorityBadgeClass("critical")}>Kritik</span>
                </div>
                <p className="muted">{item.reason}</p>
                <p className="muted">Sonraki adim: {item.recommendedNextStep}</p>
                <div className="hz-inline-actions">
                  <Link href={item.actionHref} className="hz-btn hz-btn-primary">
                    {item.actionLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <SplitContentLayout
        main={
          <div className="hz-page-stack">
            {Array.from(groupedItems.entries()).map(([group, items]) => (
              <section className="hz-content-card" key={`group-${group}`}>
                <h3>{GROUP_LABELS[group]}</h3>
                <div className="table-wrap hz-table-wrap">
                  <table className="table hz-table">
                    <thead>
                      <tr>
                        <th>Madde</th>
                        <th>Oncelik</th>
                        <th>Durum</th>
                        <th>Neden</th>
                        <th>Sonraki Adim</th>
                        <th>Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ display: "grid", gap: "4px" }}>
                              <strong>{item.title}</strong>
                              <span className="muted">{item.description}</span>
                            </div>
                          </td>
                          <td>
                            <span className={priorityBadgeClass(item.priority)}>{priorityLabel(item.priority)}</span>
                          </td>
                          <td>
                            <span className={statusBadgeClass(item.status)}>{statusLabel(item.status)}</span>
                            <div className="muted" style={{ marginTop: "4px" }}>{readinessStateLabel(item.readinessState)}</div>
                          </td>
                          <td>{item.reason}</td>
                          <td>{item.recommendedNextStep}</td>
                          <td>
                            <Link href={item.actionHref} className="hz-btn hz-btn-secondary">
                              {item.actionLabel}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            <section className="hz-content-card">
              <h3>Rol Bazli Onboarding</h3>
              <div className="hz-compact-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {(data?.onboardingCards ?? []).map((card) => (
                  <article key={card.roleCode} className="hz-side-panel">
                    <h4>{card.roleName}</h4>
                    <p className="muted">{card.summary}</p>
                    <div className="hz-page-stack" style={{ gap: "8px" }}>
                      <strong>Bugun yapilacak 3 adim</strong>
                      {(ONBOARDING_TASKS[card.roleCode] ?? []).slice(0, 3).map((task, index) => {
                        const tone = getTaskTone(task.relatedItemIds);
                        return (
                          <div key={`${card.roleCode}-task-${index}`} className="hz-inline-actions" style={{ justifyContent: "space-between" }}>
                            <span>{task.title}</span>
                            <div className="hz-inline-actions">
                              <span className={taskToneClass(tone)}>{tone === "kritik" ? "Kritik" : tone === "oneri" ? "Oneri" : "Hazir"}</span>
                              <Link href={task.href} className="hz-btn hz-btn-secondary">
                                Ac
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        }
        side={
          <div className="hz-page-stack">
            <aside className="hz-side-panel">
              <h3>Hizli Aksiyonlar</h3>
              <div className="hz-page-stack" style={{ gap: "8px" }}>
                {QUICK_ACTIONS.map((action) => (
                  <Link key={action.href + action.label} href={action.href} className="hz-btn hz-btn-secondary" style={{ justifyContent: "flex-start" }}>
                    {action.label}
                  </Link>
                ))}
              </div>
            </aside>

            <aside className="hz-side-panel">
              <h3>Health Ozet</h3>
              <div className="detail-list">
                <span>Genel Durum</span>
                <strong>{data?.integrationHealth.status ?? "-"}</strong>
                <span>Configured</span>
                <strong>{data?.integrationHealth.configuredCount ?? 0}</strong>
                <span>Canli</span>
                <strong>{data?.integrationHealth.liveCount ?? 0}</strong>
                <span>Fallback</span>
                <strong>{data?.integrationHealth.fallbackCount ?? 0}</strong>
                <span>Disabled</span>
                <strong>{data?.integrationHealth.disabledCount ?? 0}</strong>
              </div>
            </aside>

            <aside className="hz-side-panel">
              <h3>Veri Tutarlilik Uyarilari</h3>
              <ul className="hz-side-list">
                {(data?.consistencyWarnings ?? []).length === 0 ? (
                  <li>Kritik veri tutarlilik sorunu tespit edilmedi.</li>
                ) : (
                  (data?.consistencyWarnings ?? []).map((warning, index) => <li key={`warn-${index}`}>{warning}</li>)
                )}
              </ul>
            </aside>
          </div>
        }
      />
    </div>
  );
}
