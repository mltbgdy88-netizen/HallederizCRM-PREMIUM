"use client";



import { MetricCard, PageHeader } from "@hallederiz/ui";

import { dataSourceConfig } from "../../../lib/data-source";

import type { PilotWeeklyStatus } from "../data/operational-observability-mock";

import { OPS_TRACE_PREVIEW_ROWS, PILOT_WEEKLY_PREVIEW_ROWS } from "../data/operational-observability-mock";

import { SettingsAreaShell } from "./SettingsAreaShell";



function pilotWeeklyBadgeClass(status: PilotWeeklyStatus): string {

  if (status === "pozitif") return "hz-badge hz-badge-success";

  if (status === "risk") return "hz-badge hz-badge-danger";

  return "hz-badge hz-badge-warning";

}



function pilotWeeklyBadgeLabel(status: PilotWeeklyStatus): string {

  if (status === "pozitif") return "Pozitif";

  if (status === "risk") return "Risk";

  return "Beklemede";

}



export function OperationalObservabilityPage() {

  return (

    <SettingsAreaShell>

      <div className="hz-page-stack hz-ops-obs-page">

        <PageHeader

          title="Operasyon ve gözlem"

          description="İstek zincirinde kiracı bağlamı ile iz/span korelasyonu; metrik ve log hattı için temel operasyon gözlemi görünümü."

        />



        {dataSourceConfig.useDemoData ? (

          <div className="hz-ops-obs-preview-band" role="status">

            Örnek veri: aşağıdaki izleme satırları örnek; canlı ortamda OpenTelemetry / log hattı tenant_id + trace_id

            (kiracı kimliği + izleme kimliği) taşır.

          </div>

        ) : null}



        <section className="hz-metric-grid hz-ops-obs-metrics">

          <MetricCard title="Örnek iz" value={String(OPS_TRACE_PREVIEW_ROWS.length)} detail="Son istekler (örnek)" tone="info" />

          <MetricCard title="Kiracı kapsamı" value="Zorunlu" detail="API koruması + bağlam" tone="success" />

          <MetricCard title="Örnek p99 gecikme" value="118 ms" detail="Çalışan servis dağıtımı" tone="warning" />

          <MetricCard title="Korelasyon" value="trace_id" detail="W3C + kiracı kimliği" tone="neutral" />

        </section>



        <section className="hz-content-card hz-ops-obs-card">

          <h3>Kiracı korelasyonu (salt okunur)</h3>

          <p className="muted hz-ops-obs-lead">

            Her HTTP isteğinde <strong>tenant_id</strong> (kiracı kimliği) oturum / koruma katmanından gelir; log ve

            metriklerde <strong>trace_id</strong> (izleme kimliği) ile birlikte tutulursa destek ve denetim tek satırda

            birleştirilebilir. Ham onay anahtarı veya hassas kişisel veri loglanmamalıdır.

          </p>

          <div className="table-wrap hz-table-wrap hz-ops-obs-table-wrap">

            <table className="table hz-table">

              <thead>

                <tr>

                  <th>trace_id (ön ek)</th>

                  <th>span_id</th>

                  <th>tenant_id</th>

                  <th>Kullanıcı</th>

                  <th>Rota</th>

                  <th>HTTP</th>

                  <th>Gecikme (ms)</th>

                  <th>Zaman</th>

                </tr>

              </thead>

              <tbody>

                {OPS_TRACE_PREVIEW_ROWS.map((row) => (

                  <tr key={row.id}>

                    <td className="hz-ops-obs-mono">{row.traceId.slice(0, 12)}…</td>

                    <td className="hz-ops-obs-mono">{row.spanId.slice(0, 12)}…</td>

                    <td>{row.tenantId}</td>

                    <td>{row.principal}</td>

                    <td className="hz-ops-obs-route">{row.route}</td>

                    <td>{row.httpStatus}</td>

                    <td>{row.latencyMs}</td>

                    <td>{new Date(row.occurredAt).toLocaleString("tr-TR")}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>



        <section className="hz-content-card hz-ops-obs-card">

          <h3>Yayın ve pilot kabul</h3>

          <p className="muted">

            Tam kontrol listeleri repoda: <code className="hz-ops-obs-code">docs/development/RELEASE_CHECKLIST.md</code>,{" "}

            <code className="hz-ops-obs-code">docs/implementation/016-pilot-acceptance-checklist.md</code>.

          </p>

          <ul className="hz-ops-obs-checklist">

            <li>CI: typecheck, lint, test ve smoke komutları yeşil.</li>

            <li>Canlı ortam: demo/örnek veri auth kapalı; kiracı izolasyonu ve yetki kontrolü regresyonu yok.</li>

            <li>WhatsApp: imza ve secret fail-closed; ham onay anahtarı loglanmıyor.</li>

            <li>Yapay zekâ: yalnızca öneri; onaysız yürütme yok; denetim izi/zaman akışı yazımı biliniyor.</li>

            <li>Entegrasyon: canlı yoksa kontrollü hata; sessiz başarı yok.</li>

            <li>Operasyon: geri alma planı; pilot durum dokümanları güncel.</li>

          </ul>

          <p className="muted hz-ops-obs-foot">Aşağıda haftalık pilot geri bildirimi şablonu ve örnek özet satırları yer alır.</p>

        </section>



        <section className="hz-content-card hz-ops-obs-card hz-ops-obs-pilot-block">

          <h3>Haftalık pilot geri bildirimi (şablon)</h3>

          <p className="muted hz-ops-obs-lead">

            Operasyon ekibi her hafta aynı başlıkları doldurur; kalıcı kayıt için harici araç (Notion, e-posta, bilet)

            önerilir. Bu tablo yalnızca örnek görünüm ve eğitim amaçlıdır.

          </p>

          <p className="muted hz-ops-obs-pilot-micro" role="status">

            Şablon verisi: aşağıdaki hafta satırları CRM veritabanına yazılmaz; canlı pilot notları ayrı tutulmalıdır.

          </p>

          <ul className="hz-ops-obs-checklist hz-ops-obs-pilot-checklist">

            <li>Kritik akışlar: Hızlı İşlem, Onaylar, WhatsApp — bloklayıcı hata var mı?</li>

            <li>Performans: yavaş ekran, zaman aşımı, API hata oranı gözlemi.</li>

            <li>Veri doğruluğu: stok, tahsilat, belge teslimi tutarlılığı (pilot notu).</li>

            <li>Eğitim / UX: kullanıcının takıldığı adımlar ve dokümantasyon ihtiyacı.</li>

            <li>Sonraki hafta odağı: en fazla üç maddelik kısa liste.</li>

          </ul>

          <div className="table-wrap hz-table-wrap hz-ops-obs-table-wrap">

            <table className="table hz-table hz-ops-obs-pilot-table">

              <thead>

                <tr>

                  <th>Hafta bitişi</th>

                  <th>Pilot kiracı</th>

                  <th>Durum</th>

                  <th>Özet</th>

                </tr>

              </thead>

              <tbody>

                {PILOT_WEEKLY_PREVIEW_ROWS.map((row) => (

                  <tr key={row.id}>

                    <td>{new Date(row.weekEnding).toLocaleDateString("tr-TR")}</td>

                    <td>{row.tenantLabel}</td>

                    <td>

                      <span className={pilotWeeklyBadgeClass(row.status)}>{pilotWeeklyBadgeLabel(row.status)}</span>

                    </td>

                    <td className="hz-ops-obs-pilot-summary">{row.summary}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </SettingsAreaShell>

  );

}


