"use client";

import Link from "next/link";
import { useMemo } from "react";
import { IconDownload, IconFilter } from "../../dashboard/components/dashboard-inline-icons";
import { UI_SAFE_COPY } from "../../../lib/ui-safe-copy";
import { getProductRouteNode } from "../../../navigation/product-route-manifest";

function humanizeSlugSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

export function ReportDetailPage({ slugSegments }: { slugSegments: string[] }) {
  const path = useMemo(() => {
    const clean = slugSegments.map((s) => s.trim()).filter(Boolean);
    return clean.length ? `/raporlar/${clean.join("/")}` : "/raporlar";
  }, [slugSegments]);

  const node = getProductRouteNode(path);
  const title = node?.label ?? humanizeSlugSegment(slugSegments[slugSegments.length - 1] ?? "Rapor");
  const description =
    node?.description ?? "Bu rapor görünümü canlı veri bağlantısı hazır olduğunda doldurulacak.";

  return (
    <div className="hz-reports-page hz-reports-page--detail">
      <header className="hz-reports-detail-topbar">
        <div>
          <p className="hz-reports-detail-eyebrow">Raporlar</p>
          <h1 className="hz-reports-detail-title">{title}</h1>
          <p className="hz-reports-detail-desc">{description}</p>
        </div>
        <div className="hz-reports-detail-actions">
          <Link href="/raporlar" className="hz-reports-detail-back">
            Rapor merkezine dön
          </Link>
          <button type="button" className="hz-reports-detail-export" disabled title={UI_SAFE_COPY.exportWhenLive}>
            <IconDownload size={14} aria-hidden />
            Dışa aktar
          </button>
        </div>
      </header>

      <p className="hz-reports-live-band" role="status">
        <strong>{UI_SAFE_COPY.liveReportWaiting}</strong>
        <span>Filtre ve tablo alanları canlı API yanıtı geldiğinde etkinleşir.</span>
      </p>

      <section className="hz-reports-detail-filters" aria-label="Rapor filtreleri">
        <div className="hz-reports-detail-filters-head">
          <IconFilter size={16} aria-hidden />
          <span>Filtreler</span>
        </div>
        <div className="hz-reports-detail-filters-grid">
          <label>
            Tarih aralığı
            <input type="text" disabled placeholder="Canlı veri bekleniyor" aria-disabled="true" />
          </label>
          <label>
            Cari / kanal
            <input type="text" disabled placeholder="Canlı veri bekleniyor" aria-disabled="true" />
          </label>
          <label>
            Metrik
            <select disabled aria-disabled="true" defaultValue="">
              <option value="">Canlı veri bekleniyor</option>
            </select>
          </label>
        </div>
      </section>

      <div className="hz-reports-detail-body">
        <section className="hz-reports-detail-kpis" aria-label="Özet göstergeler">
          {["Dönem özeti", "Hedef", "Sapma"].map((label) => (
            <article key={label} className="hz-reports-detail-kpi-card">
              <span className="hz-reports-detail-kpi-label">{label}</span>
              <span className="hz-reports-kpi-value hz-reports-kpi-value--pending">—</span>
              <span className="hz-reports-detail-kpi-note">{UI_SAFE_COPY.liveDataWaiting}</span>
            </article>
          ))}
        </section>

        <section className="hz-reports-detail-chart" aria-label="Grafik alanı">
          <div className="hz-reports-chart-empty">
            <div>
              <span className="hz-reports-chart-empty-title">{UI_SAFE_COPY.liveReportWaiting}</span>
              <span className="hz-reports-chart-empty-text">{UI_SAFE_COPY.fieldWhenLive}</span>
            </div>
          </div>
        </section>

        <section className="hz-reports-detail-table" aria-label="Tablo alanı">
          <div className="hz-reports-chart-empty hz-reports-chart-empty--table">
            <div>
              <span className="hz-reports-chart-empty-title">Tablo verisi henüz yok</span>
              <span className="hz-reports-chart-empty-text">{UI_SAFE_COPY.previewInsufficient}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

