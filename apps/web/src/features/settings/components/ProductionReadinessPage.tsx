"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { MetricCard, PageHeader } from "@hallederiz/ui";

import {

  formatProductionOverallStatus,

  formatUserFacingEnvironment,

  formatUserFacingMode,

  formatYesNo

} from "../../../lib/user-facing-labels";

import type { ProductionReadinessSummary } from "../../../services/api";

import { getProductionReadinessData } from "../queries";

import { SettingsAreaShell } from "./SettingsAreaShell";



function statusBadgeClass(status: ProductionReadinessSummary["overallStatus"]) {

  if (status === "ready") return "hz-badge hz-badge-success";

  if (status === "degraded") return "hz-badge hz-badge-warning";

  return "hz-badge hz-badge-danger";

}



export function ProductionReadinessPage() {

  const [data, setData] = useState<ProductionReadinessSummary | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);



  const load = async () => {

    setLoading(true);

    setError(null);

    try {

      setData(await getProductionReadinessData());

    } catch (loadError) {

      setError(loadError instanceof Error ? loadError.message : "Canlıya hazırlık bilgisi alınamadı.");

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    void load();

  }, []);



  return (

    <SettingsAreaShell>

      <div className="hz-page-stack">

        <PageHeader

          title="Canlı Kullanım Hazırlığı"

          description="Demo/örnek veri/temel mod davranışlarının canlı ortamda gerçek başarı gibi görünmesini engelleyen canlıya hazırlık kontrol paneli."

          actions={

            <div className="hz-inline-actions">

              <button type="button" className="hz-btn hz-btn-primary" onClick={() => void load()} disabled={loading}>

                {loading ? "Yükleniyor…" : "Yenile"}

              </button>

              <Link href="/ayarlar" className="hz-btn hz-btn-secondary">

                Ayarlara dön

              </Link>

            </div>

          }

        />



        {error ? (

          <section className="hz-content-card">

            <p className="muted">{error}</p>

          </section>

        ) : null}



        <section className="hz-metric-grid">

          <MetricCard

            title="Genel Durum"

            value={data ? formatProductionOverallStatus(data.overallStatus) : "—"}

            detail="Hazır / Eksik / Bloklu"

            tone={data?.overallStatus === "ready" ? "success" : data?.overallStatus === "degraded" ? "warning" : "danger"}

          />

          <MetricCard

            title="Blokaj"

            value={String(data?.blockers.length ?? 0)}

            detail="Canlı açılışı durduran kritikler"

            tone={(data?.blockers.length ?? 0) > 0 ? "danger" : "success"}

          />

          <MetricCard

            title="Uyarı"

            value={String(data?.warnings.length ?? 0)}

            detail="Açılış öncesi giderilmesi önerilenler"

            tone={(data?.warnings.length ?? 0) > 0 ? "warning" : "success"}

          />

          <MetricCard

            title="Eksik ortam değişkeni"

            value={String(data?.missingEnv.length ?? 0)}

            detail="Çalışma zamanı zorunlu değişken eksikleri"

            tone={(data?.missingEnv.length ?? 0) > 0 ? "danger" : "success"}

          />

        </section>



        {data ? (

          <>

            <section className="hz-content-card">

              <div className="hz-inline-actions" style={{ justifyContent: "space-between" }}>

                <h3>Durum özeti</h3>

                <span className={statusBadgeClass(data.overallStatus)}>

                  {formatProductionOverallStatus(data.overallStatus)}

                </span>

              </div>

              <div className="detail-list">

                <span>Ortam</span>

                <strong>{formatUserFacingEnvironment(data.environment.nodeEnv)}</strong>

                <span>Kalıcılık</span>

                <strong>{formatUserFacingMode(data.persistence.mode)}</strong>

                <span>Veritabanı yapılandırması</span>

                <strong>{formatYesNo(data.database.configured)}</strong>

                <span>Onay çalıştırma</span>

                <strong>{formatUserFacingMode(data.approvalExecution.mode)}</strong>

                <span>Çalışan servis modu</span>

                <strong>{formatUserFacingMode(data.workerOutbox.workerMode)}</strong>

              </div>

            </section>



            <section className="hz-content-card">

              <h3>Gerçek çalışır mı?</h3>

              <ul className="hz-side-list">

                <li>Onay çalıştırma: {formatYesNo(data.approvalExecution.ready)}</li>

                <li>Çalışan servis kalıcı kuyruk: {formatYesNo(data.workerOutbox.ready)}</li>

                <li>Kiracı kullanımı veritabanı destekli: {formatYesNo(data.tenantUsage.ready)}</li>

                <li>Çok kanallı veritabanı destekli: {formatYesNo(data.omnichannel.ready)}</li>

                <li>WhatsApp canlı ortam değişkenleri: {formatYesNo(data.whatsapp.liveEnvConfigured)}</li>

                <li>Yerel yapay zekâ yapılandırması: {formatYesNo(data.localAi.configured)}</li>

                <li>Yerel aracı yapılandırması: {formatYesNo(data.localAgent.configured)}</li>

              </ul>

            </section>



            <section className="hz-content-card">

              <h3>Eksik ve riskler</h3>

              <div className="hz-compact-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>

                <article className="hz-side-panel">

                  <h4>Bloklayıcılar</h4>

                  <ul className="hz-side-list">

                    {data.blockers.length === 0 ? (

                      <li>Kritik bloklayıcı yok.</li>

                    ) : (

                      data.blockers.map((item) => <li key={item}>{item}</li>)

                    )}

                  </ul>

                </article>

                <article className="hz-side-panel">

                  <h4>Uyarılar</h4>

                  <ul className="hz-side-list">

                    {data.warnings.length === 0 ? (

                      <li>Uyarı yok.</li>

                    ) : (

                      data.warnings.map((item) => <li key={item}>{item}</li>)

                    )}

                  </ul>

                </article>

                <article className="hz-side-panel">

                  <h4>Eksik ortam değişkenleri</h4>

                  <ul className="hz-side-list">

                    {data.missingEnv.length === 0 ? (

                      <li>Eksik ortam değişkeni yok.</li>

                    ) : (

                      data.missingEnv.map((item) => <li key={item}>{item}</li>)

                    )}

                  </ul>

                </article>

                <article className="hz-side-panel">

                  <h4>Güvensiz yedek görünüm</h4>

                  <ul className="hz-side-list">

                    {data.unsafeFallbacks.length === 0 ? (

                      <li>Güvensiz yedek görünüm yok.</li>

                    ) : (

                      data.unsafeFallbacks.map((item) => <li key={item}>{item}</li>)

                    )}

                  </ul>

                </article>

              </div>

            </section>



            <section className="hz-content-card">

              <h3>Sağlayıcı durumu</h3>

              <div className="table-wrap hz-table-wrap">

                <table className="table hz-table">

                  <thead>

                    <tr>

                      <th>Kanal</th>

                      <th>Mod</th>

                      <th>Hazır</th>

                    </tr>

                  </thead>

                  <tbody>

                    {data.omnichannel.providerModes.map((provider) => (

                      <tr key={provider.kind}>

                        <td>{provider.kind}</td>

                        <td>{formatUserFacingMode(provider.mode)}</td>

                        <td>{formatYesNo(provider.ok)}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

          </>

        ) : null}

      </div>

    </SettingsAreaShell>

  );

}


