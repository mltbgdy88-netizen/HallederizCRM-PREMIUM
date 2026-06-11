"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { canInboxApprove, canInboxReject } from "../utils/approval-action-feedback";
import {
  approvalSourceFromRecord,
  approvalWhyRequiredText,
  type ApprovalSourceFilter
} from "../utils/approval-command-desk-present";
import { useApprovalCommandDeskState } from "../hooks/use-approval-command-desk-state";
import {
  mapRecordToActionMeta,
  mapRecordToPendingCard,
  mapRecordToReferenceDetail,
  mapRowsToReferenceKpis,
  type OkmReferencePendingCard
} from "../utils/map-inbox-to-reference-desk";
import { IconChevronDown, IconInfo, OkmKpiIconSvg, OkmPendingIconSvg } from "./approvals-reference-icons";

const SOURCE_FILTERS: { id: ApprovalSourceFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "ai", label: "AI" },
  { id: "automation", label: "Otomasyon" },
  { id: "message", label: "Mesaj" },
  { id: "high_risk", label: "Yüksek Risk" }
];

const PAGE_COPY = {
  title: "Onaylar Komut Masası",
  subtitle: "Sistem genelindeki tüm bekleyen onay taleplerini yönetin.",
  historyBtn: "Onay Geçmişi",
  historyHref: "/onaylar/tamamlananlar",
  actionsTitle: "Onay İşlemleri",
  metaTitle: "Onay Bilgileri",
  commentLabel: "Açıklama (Opsiyonel)",
  commentPlaceholder: "Onay veya red gerekçenizi yazın…",
  notifyLabel: "E-posta ile bilgilendir"
} as const;

function PendingCard({
  item,
  selected,
  onSelect
}: {
  item: OkmReferencePendingCard;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={selected ? "okm-pending-card okm-pending-card--selected" : "okm-pending-card"}
      onClick={onSelect}
    >
      <span className="okm-pending-icon" aria-hidden>
        <OkmPendingIconSvg icon={item.icon} />
      </span>
      <span className="okm-pending-body">
        <strong>{item.title}</strong>
        <span className="okm-pending-ref">{item.ref}</span>
        <span className="okm-pending-meta">{item.requester}</span>
        <span className="okm-pending-time">{item.dateTime}</span>
      </span>
      <span className="okm-badge okm-badge--pending">{item.status}</span>
    </button>
  );
}

export function ApprovalsReferenceLayout() {
  const router = useRouter();
  const [historyOpen, setHistoryOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [comment, setComment] = useState("");

  const desk = useApprovalCommandDeskState();

  const kpis = useMemo(() => mapRowsToReferenceKpis(desk.rows), [desk.rows]);
  const pendingCards = useMemo(() => desk.filteredRows.map(mapRecordToPendingCard), [desk.filteredRows]);
  const detail = useMemo(
    () => (desk.selectedRecord ? mapRecordToReferenceDetail(desk.selectedRecord) : null),
    [desk.selectedRecord]
  );
  const actionMeta = useMemo(
    () => (desk.selectedRecord ? mapRecordToActionMeta(desk.selectedRecord) : []),
    [desk.selectedRecord]
  );

  const sourceKind = desk.selectedRecord ? approvalSourceFromRecord(desk.selectedRecord) : "unknown";
  const approveDisabled =
    desk.actionPending !== null ||
    !desk.selectedRecord ||
    !canInboxApprove(desk.selectedRecord.raw);
  const rejectDisabled =
    desk.actionPending !== null ||
    !desk.selectedRecord ||
    !canInboxReject(desk.selectedRecord.raw);

  return (
    <div className="okm-home okm-home--embedded" data-page="approvals-reference-desk" aria-live="polite">
      <header className="okm-top">
        <div className="okm-head">
          <h1>{PAGE_COPY.title}</h1>
          <p>{PAGE_COPY.subtitle}</p>
        </div>
        <Link href={PAGE_COPY.historyHref} className="okm-btn okm-btn--ghost">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {PAGE_COPY.historyBtn}
        </Link>
      </header>

      <section className="okm-kpi-row" aria-label="Onay özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`okm-kpi-card okm-kpi-card--${kpi.tone}`}>
            <div className={`okm-kpi-icon okm-kpi-icon--${kpi.tone}`}>
              <OkmKpiIconSvg icon={kpi.icon} className="okm-kpi-icon-svg" />
            </div>
            <div className="okm-kpi-body">
              <span className="okm-kpi-value">{kpi.value}</span>
              <span className="okm-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="okm-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="okm-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      {desk.listPhase === "loading" ? (
        <section className="okm-state okm-state--loading" role="status">
          Onay masası yükleniyor…
        </section>
      ) : null}

      {desk.listPhase === "error" ? (
        <section className="okm-state okm-state--error" role="alert">
          <p>{desk.errorMessage ?? "Onay listesi şu an alınamıyor."}</p>
          <button type="button" className="okm-btn okm-btn--ghost" onClick={() => void desk.bootstrap()}>
            Yeniden dene
          </button>
        </section>
      ) : null}

      {desk.listPhase === "empty" ? (
        <section className="okm-state okm-state--empty" role="status">
          <p>{desk.emptyTitle}</p>
          {desk.emptyDescription ? <span>{desk.emptyDescription}</span> : null}
        </section>
      ) : null}

      {desk.listPhase === "ready" ? (
        <section className="okm-body" aria-label="Onay listesi ve detay">
          <aside className="okm-list-panel" aria-label="Bekleyen onaylar">
            <header className="okm-list-head">
              <h2>Bekleyen Onaylar ({pendingCards.length})</h2>
              <button
                type="button"
                className="okm-btn okm-btn--filter"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((open) => !open)}
              >
                Filtrele
                <IconChevronDown className="okm-filter-chevron" />
              </button>
            </header>

            {filterOpen ? (
              <div className="okm-filter-band">
                <input
                  type="search"
                  className="okm-filter-search"
                  placeholder="Onay, cari veya kayıt ara…"
                  value={desk.searchQuery}
                  onChange={(event) => desk.setSearchQuery(event.target.value)}
                  aria-label="Onay ara"
                />
                <div className="okm-filter-chips" role="toolbar" aria-label="Kaynak filtreleri">
                  {SOURCE_FILTERS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className={`okm-filter-chip${desk.sourceFilter === chip.id ? " okm-filter-chip--active" : ""}`}
                      onClick={() => desk.setSourceFilter(chip.id)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="okm-list-scroll">
              {pendingCards.map((item) => (
                <PendingCard
                  key={item.id}
                  item={item}
                  selected={item.id === desk.selectedId}
                  onSelect={() => desk.setSelectedId(item.id)}
                />
              ))}
            </div>

            <footer className="okm-list-foot">
              <span>Toplam {pendingCards.length} kayıt</span>
              <div className="okm-list-foot-right">
                <span className="okm-page-size">10</span>
                <nav className="okm-pager" aria-label="Sayfalama">
                  <button type="button" className="okm-pager-num okm-pager-num--active">
                    1
                  </button>
                </nav>
              </div>
            </footer>
          </aside>

          <article className="okm-detail-panel" aria-label="Onay detayı">
            {!detail ? (
              <div className="okm-detail-empty">Listeden bir kayıt seçin.</div>
            ) : (
              <>
                <header className="okm-detail-head">
                  <div className="okm-detail-title-row">
                    <span className="okm-detail-icon" aria-hidden>
                      <OkmPendingIconSvg icon={pendingCards.find((c) => c.id === desk.selectedId)?.icon ?? "stock"} />
                    </span>
                    <div>
                      <h2>{detail.title}</h2>
                      <div className="okm-detail-sub">
                        <span>{detail.ref}</span>
                        <span className="okm-detail-dot" aria-hidden>
                          ·
                        </span>
                        <span>{detail.dateTime}</span>
                      </div>
                    </div>
                  </div>
                  <span className="okm-priority">{detail.priority}</span>
                </header>

                <div className="okm-detail-scroll">
                  {desk.detailLoading ? <p className="okm-detail-hint">Detay güncelleniyor…</p> : null}
                  {desk.detailError ? <p className="okm-detail-hint okm-detail-hint--error">{desk.detailError}</p> : null}

                  <div className="okm-info-grid okm-info-grid--2">
                    <div>
                      <span className="okm-field-label">{detail.requesterLabel}</span>
                      <strong>{detail.requester}</strong>
                      <span className="okm-field-sub">{detail.requesterRole}</span>
                    </div>
                    <div>
                      <span className="okm-field-label">{detail.departmentLabel}</span>
                      <strong>{detail.department}</strong>
                    </div>
                  </div>

                  <p className="okm-description">{detail.description}</p>

                  <section className="okm-block">
                    <h3>{detail.productTitle}</h3>
                    <div className="okm-fields-grid">
                      {detail.productFields.map((field) => (
                        <div key={field.label} className="okm-field">
                          <span className="okm-field-label">{field.label}</span>
                          <strong>{field.value}</strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="okm-block">
                    <h3>{detail.extraTitle}</h3>
                    <div className="okm-fields-grid">
                      {detail.extraFields.map((field) => (
                        <div key={`${field.label}-${field.value}`} className="okm-field">
                          <span className="okm-field-label">{field.label}</span>
                          <strong>{field.value}</strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="okm-block okm-block--history">
                    <button
                      type="button"
                      className="okm-history-toggle"
                      onClick={() => setHistoryOpen((open) => !open)}
                      aria-expanded={historyOpen}
                    >
                      <h3>{detail.historyTitle}</h3>
                      <IconChevronDown className={historyOpen ? "okm-chevron okm-chevron--open" : "okm-chevron"} />
                    </button>
                    {historyOpen ? (
                      <ul className="okm-history">
                        {detail.history.map((item) => (
                          <li key={item.id}>
                            <span className="okm-history-dot" aria-hidden />
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.detail}</p>
                              <span className="okm-history-time">{item.time}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                </div>
              </>
            )}
          </article>

          <aside className="okm-actions-panel" aria-label="Onay işlemleri">
            <section className="okm-actions-block">
              <h2>{PAGE_COPY.actionsTitle}</h2>
              <p className="okm-actions-info">{approvalWhyRequiredText(sourceKind)}</p>
              <div className="okm-action-btns">
                <button
                  type="button"
                  className="okm-action-btn okm-action-btn--approve"
                  disabled={approveDisabled}
                  onClick={() => void desk.runAction("approve")}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {desk.actionPending === "approve" ? "Onaylanıyor…" : "Onayla"}
                </button>
                <button
                  type="button"
                  className="okm-action-btn okm-action-btn--reject"
                  disabled={rejectDisabled}
                  onClick={() => void desk.runAction("reject")}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                  {desk.actionPending === "reject" ? "Reddediliyor…" : "Reddet"}
                </button>
                <button
                  type="button"
                  className="okm-action-btn okm-action-btn--review"
                  disabled={!desk.selectedRecord}
                  onClick={() => {
                    if (!desk.selectedRecord) return;
                    router.push(`/onaylar/${desk.selectedRecord.id}`);
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  İncele
                </button>
              </div>
            </section>

            <section className="okm-meta-block">
              <h2>{PAGE_COPY.metaTitle}</h2>
              <dl className="okm-meta-list">
                {actionMeta.map((row) => (
                  <div key={row.label} className="okm-meta-row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
              <label className="okm-comment">
                <span>{PAGE_COPY.commentLabel}</span>
                <textarea
                  rows={3}
                  placeholder={PAGE_COPY.commentPlaceholder}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </label>
              <label className="okm-notify">
                <input type="checkbox" defaultChecked readOnly />
                <span>{PAGE_COPY.notifyLabel}</span>
              </label>
            </section>
          </aside>
        </section>
      ) : null}
    </div>
  );
}
