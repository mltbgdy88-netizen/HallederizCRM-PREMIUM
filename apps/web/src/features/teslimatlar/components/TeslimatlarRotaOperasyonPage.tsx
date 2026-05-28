"use client";

import { useEffect, useState } from "react";
import { IconRefresh } from "@/components/reference/icons";
import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import type { TsrmRouteStatus } from "@/features/teslimatlar/data/teslimatlar-rota-mock";
import { useTeslimatlarRotaReferenceData } from "@/features/teslimatlar/hooks/use-teslimatlar-rota-reference-data";

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconExport({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />
    </svg>
  );
}

function routeStatusClass(status: TsrmRouteStatus): string {
  switch (status) {
    case "Yolda":
      return " tsrm-badge--onway";
    case "Planlandı":
      return " tsrm-badge--planned";
    default:
      return " tsrm-badge--hold";
  }
}

function driverStatusClass(status: string): string {
  if (status === "Yolda") return " tsrm-badge--onway";
  if (status === "Planlandı") return " tsrm-badge--planned";
  return " tsrm-badge--hold";
}

export function TeslimatlarRotaOperasyonPage() {
  const demoAction = useCarilerDemoAction();
  const { title, subtitle, kpis, drivers, tableRows, tableTotal, pageNumbers, getContext, getStops } =
    useTeslimatlarRotaReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const context = getContext(selectedId);
  const stops = getStops(selectedId);

  useEffect(() => {
    if (!tableRows.some((row) => row.id === selectedId)) {
      setSelectedId(tableRows[0]?.id ?? "1");
    }
  }, [tableRows, selectedId]);

  return (
    <div className="tsrm-home">
      <header className="tsrm-head">
        <div className="tsrm-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="tsrm-head-actions">
          <button type="button" className="tsrm-btn tsrm-btn--primary" onClick={(e) => demoAction("Yeni Rota", e)}>
            <IconPlus />
            Yeni Rota
          </button>
          <button type="button" className="tsrm-btn tsrm-btn--outline" onClick={(e) => demoAction("Rotaları Yenile", e)}>
            <IconRefresh />
            Rotaları Yenile
          </button>
          <button type="button" className="tsrm-btn tsrm-btn--outline" onClick={(e) => demoAction("Dışa Aktar", e)}>
            <IconExport />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="tsrm-map" aria-label="Rota haritası">
        <div className="tsrm-map-track">
          <span>1</span>
          <div className="tsrm-map-line" />
          <span>2</span>
          <div className="tsrm-map-line" />
          <span>3</span>
          <div className="tsrm-map-line" />
          <span>4</span>
          <div className="tsrm-map-line" />
          <span>6</span>
        </div>
      </section>

      <section className="tsrm-kpi-row" aria-label="Rota özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className="tsrm-kpi-card">
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </article>
        ))}
      </section>

      <section className="tsrm-drivers" aria-label="�?oför kartları">
        {drivers.map((driver) => (
          <article key={driver.id} className="tsrm-driver-card">
            <strong>{driver.name}</strong>
            <span>{driver.plate}</span>
            <span className={`tsrm-badge${driverStatusClass(driver.status)}`}>{driver.status}</span>
            <span>{driver.stops}</span>
          </article>
        ))}
      </section>

      <div className="tsrm-workspace">
        <section className="tsrm-main" aria-label="Rota listesi">
          <div className="tsrm-table-wrap">
            <table className="tsrm-table">
              <thead>
                <tr>
                  <th>Rota No</th>
                  <th>�?oför</th>
                  <th>Durum</th>
                  <th>Durak</th>
                  <th>Mesafe</th>
                  <th>Tahmini Süre</th>
                  <th>Başlangıç / Bitiş</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedId === row.id ? "tsrm-row tsrm-row--selected" : "tsrm-row"}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td>{row.routeNo}</td>
                    <td>{row.driver}</td>
                    <td>
                      <span className={`tsrm-badge${routeStatusClass(row.status)}`}>{row.status}</span>
                    </td>
                    <td>{row.stops}</td>
                    <td>{row.distance}</td>
                    <td>{row.eta}</td>
                    <td>{row.window}</td>
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          demoAction("Harita");
                        }}
                      >
                        Harita
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="tsrm-table-foot">
            <span>{tableTotal}</span>
            <div className="tsrm-pagination">
              <label>
                <select defaultValue="10" aria-label="Sayfa boyutu">
                  <option value="10">10 satır</option>
                </select>
              </label>
              <div>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={page === "1" ? "tsrm-page-btn tsrm-page-btn--active" : "tsrm-page-btn"}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </footer>
        </section>

        <aside className="tsrm-context" aria-label="Rota bağlamı">
          <header className="tsrm-context-head">
            <h2>Rota Bağlamı</h2>
          </header>
          <div className="tsrm-context-hero">
            <strong>{context.routeNo}</strong>
            <span className={`tsrm-badge${routeStatusClass(context.status)}`}>{context.status}</span>
          </div>
          <dl className="tsrm-context-dl">
            <div>
              <dt>�?oför</dt>
              <dd>{context.driver}</dd>
            </div>
            <div>
              <dt>Plaka</dt>
              <dd>{context.plate}</dd>
            </div>
            <div>
              <dt>Başlangıç</dt>
              <dd>{context.start}</dd>
            </div>
            <div>
              <dt>Bitiş</dt>
              <dd>{context.end}</dd>
            </div>
            <div>
              <dt>Toplam Durak</dt>
              <dd>{context.stops}</dd>
            </div>
            <div>
              <dt>Toplam Mesafe</dt>
              <dd>{context.distance}</dd>
            </div>
            <div>
              <dt>Tahmini Süre</dt>
              <dd>{context.eta}</dd>
            </div>
          </dl>
          <button type="button" className="tsrm-btn tsrm-btn--outline tsrm-btn--block" onClick={(e) => demoAction("Rota Detayını Görüntüle", e)}>
            Rota Detayını Görüntüle
          </button>
          <h3 className="tsrm-stops-title">Durak Listesi</h3>
          <ol className="tsrm-stops">
            {stops.map((stop) => (
              <li key={stop.id}>
                <span
                  className={`tsrm-stop-dot${
                    stop.state === "done"
                      ? " tsrm-stop-dot--done"
                      : stop.state === "current"
                        ? " tsrm-stop-dot--current"
                        : ""
                  }`}
                  aria-hidden
                />
                <div>
                  <strong>{stop.name}</strong>
                  <span>{stop.address}</span>
                </div>
                <span>{stop.time}</span>
              </li>
            ))}
          </ol>
          <button type="button" className="tsrm-btn tsrm-btn--primary tsrm-btn--block" onClick={(e) => demoAction("Rota İşlemleri", e)}>
            Rota İşlemleri
          </button>
        </aside>
      </div>
    </div>
  );
}

