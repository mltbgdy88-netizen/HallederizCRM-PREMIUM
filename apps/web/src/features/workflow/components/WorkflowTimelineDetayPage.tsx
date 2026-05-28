"use client";

import { useWorkflowReferenceData } from "@/features/workflow/hooks/use-workflow-reference-data";

function statusClass(status: string): string {
  if (status === "Onaylandı" || status === "Onay") return "wft-badge wft-badge--ok";
  if (status === "Beklemede") return "wft-badge wft-badge--wait";
  if (status === "Sistem") return "wft-badge wft-badge--sys";
  return "wft-badge wft-badge--upd";
}

export function WorkflowTimelineDetayPage() {
  const {
    data: { page: WFT_PAGE, events: WFT_EVENTS, context: WFT_CONTEXT }
  } = useWorkflowReferenceData();

  return (
    <div className="wft-home">
      <p className="wft-crumb">{WFT_PAGE.breadcrumb}</p>

      <header className="wft-product">
        <span className="wft-thumb" aria-hidden />
        <div>
          <span className="wft-status">{WFT_PAGE.status}</span>
          <h1>
            {WFT_PAGE.productCode} {WFT_PAGE.productName}
          </h1>
          <div className="wft-meta">
            <span>Barkod: {WFT_PAGE.barcode}</span>
            <span>Marka: {WFT_PAGE.brand}</span>
            <span>Kategori: {WFT_PAGE.category}</span>
            <span>Fiyat: {WFT_PAGE.price}</span>
            <span>Birim: {WFT_PAGE.unit}</span>
          </div>
        </div>
      </header>

      <div className="wft-body">
        <section className="wft-timeline-panel">
          <header>
            <div>
              <h2>{WFT_PAGE.timelineTitle}</h2>
              <p>{WFT_PAGE.timelineSubtitle}</p>
            </div>
            <div className="wft-actions">
              <button type="button">Filtrele</button>
              <button type="button" aria-label="Yenile">
                ↻
              </button>
            </div>
          </header>

          <ol className="wft-timeline">
            {WFT_EVENTS.map((ev) => (
              <li key={ev.id}>
                <time>{ev.time}</time>
                <div className="wft-event">
                  <div className="wft-event-head">
                    <strong>{ev.title}</strong>
                    <span className={statusClass(ev.status)}>{ev.status}</span>
                  </div>
                  <p>{ev.desc}</p>
                  <footer>
                    <span>{ev.user}</span>
                    <button type="button">Detay</button>
                  </footer>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="wft-more">
            Daha Fazla Göster
          </button>
        </section>

        <aside className="wft-side">
          <section>
            <h3>Bağlam Özeti</h3>
            <dl>
              <div>
                <dt>Kayıt Tipi</dt>
                <dd>{WFT_CONTEXT.recordType}</dd>
              </div>
              <div>
                <dt>Kayıt ID</dt>
                <dd>{WFT_CONTEXT.recordId}</dd>
              </div>
              <div>
                <dt>Oluşturulma</dt>
                <dd>{WFT_CONTEXT.created}</dd>
              </div>
              <div>
                <dt>Son Güncelleme</dt>
                <dd>{WFT_CONTEXT.updated}</dd>
              </div>
            </dl>
            <span className="wft-active">{WFT_CONTEXT.status}</span>
          </section>
          <section>
            <h3>Hızlı Bilgiler</h3>
            <p>Merkez Stok: {WFT_CONTEXT.centerStock}</p>
            <p>Fabrika Stok: {WFT_CONTEXT.factoryStock}</p>
            <p>Raf: {WFT_CONTEXT.shelf}</p>
            <p>{WFT_CONTEXT.capacity}</p>
            <p className="wft-last">{WFT_CONTEXT.lastActivity}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
