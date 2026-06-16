"use client";

import { EmptyState } from "@hallederiz/ui";
import Link from "next/link";
import { useCustomerDetailReferenceState } from "../hooks/use-customer-detail-reference-state";
import {
  IconCdmBack,
  IconCdmBtn,
  IconCdmChevronDown,
  IconCdmContact,
  IconCdmPerf
} from "./customer-detail-reference-icons";
import { CustomerReferenceCommandCenterFrame, CustomerReferenceLoadingState, CustomerReferenceNotFoundState } from "./customer-reference-shared";
import { CUSTOMER_DETAIL_ROOT_LABEL, customerLayerHref } from "../utils/customer-layer-nav";
import type { CustomerDetailReferenceView } from "../utils/map-customer-detail-to-reference";

type Props = {
  customerId: string;
};

function DetailPanels({ view }: { view: CustomerDetailReferenceView }) {
  return (
    <div className="cdm-grid">
      <section className="cdm-panel cdm-panel--summary" aria-labelledby="cdm-summary-title">
        <h2 id="cdm-summary-title">{view.summary.title}</h2>
        <dl className="cdm-fields cdm-fields--2">
          {view.summary.fields.map((field) => (
            <div key={field.label} className="cdm-field">
              <dt>{field.label}</dt>
              <dd>
                {field.badge ? <span className="cdm-status cdm-status--inline">{field.value}</span> : field.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="cdm-address">
          <span className="cdm-address-pin" aria-hidden>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <div>
            <p className="cdm-address-label">Adres</p>
            <p className="cdm-address-text">{view.summary.address}</p>
            <div className="cdm-tags">
              <span className="cdm-tags-label">Etiketler</span>
              {view.summary.tags.map((tag) => (
                <span key={tag.label} className={`cdm-tag cdm-tag--${tag.tone}`}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cdm-panel cdm-panel--commercial" aria-labelledby="cdm-commercial-title">
        <h2 id="cdm-commercial-title">{view.commercial.title}</h2>
        <dl className="cdm-fields cdm-fields--2">
          {view.commercial.fields.map((field) => (
            <div key={field.label} className="cdm-field">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
        <div className="cdm-rep">
          <p className="cdm-subhead">Satış Temsilcisi</p>
          {view.commercial.rep ? (
            <span className="cdm-person">
              <span className="cdm-person-avatar">{view.commercial.rep.initials}</span>
              {view.commercial.rep.name}
            </span>
          ) : (
            <span className="cdm-person cdm-person--empty">Atanmadı</span>
          )}
        </div>
        {view.commercial.contacts.length > 0 ? (
          <div className="cdm-contacts">
            <p className="cdm-subhead">İletişim Bilgileri</p>
            <ul>
              {view.commercial.contacts.map((contact) => (
                <li key={`${contact.id}-${contact.value}`}>
                  <IconCdmContact id={contact.id} />
                  <span>{contact.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {view.commercial.note ? (
          <div className="cdm-note">
            <p className="cdm-subhead">Not</p>
            <p>{view.commercial.note}</p>
          </div>
        ) : null}
      </section>

      <section className="cdm-panel cdm-panel--perf" aria-labelledby="cdm-perf-title">
        <h2 id="cdm-perf-title">{view.performance.title}</h2>
        <ul className="cdm-perf-list">
          {view.performance.rows.map((row) => (
            <li key={row.label}>
              <span className="cdm-perf-icon">
                <IconCdmPerf icon={row.icon} />
              </span>
              <div>
                <p className="cdm-perf-label">{row.label}</p>
                <p className="cdm-perf-value">{row.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="cdm-panel cdm-panel--risk" aria-labelledby="cdm-risk-title">
        <h2 id="cdm-risk-title">{view.risk.title}</h2>
        <dl className="cdm-fields cdm-fields--1">
          {view.risk.fields.map((field) => (
            <div key={field.label} className="cdm-field">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
        {view.risk.usageFill !== null ? (
          <div className="cdm-usage">
            <div className="cdm-usage-head">
              <span>{view.risk.usageLabel}</span>
              <strong>{view.risk.usagePct}</strong>
            </div>
            <div
              className="cdm-usage-bar"
              role="progressbar"
              aria-valuenow={view.risk.usageFill}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="cdm-usage-fill" style={{ width: `${view.risk.usageFill}%` }} />
            </div>
          </div>
        ) : (
          <p className="cdm-note">Limit kullanım oranı hesap özeti bağlandığında gösterilir.</p>
        )}
      </section>

      <section className="cdm-panel cdm-panel--context" aria-labelledby="cdm-context-title">
        <h2 id="cdm-context-title">{view.context.title}</h2>
        <dl className="cdm-fields cdm-fields--1">
          {view.context.rows.map((row) => (
            <div key={row.label} className="cdm-field">
              <dt>{row.label}</dt>
              <dd>
                {row.live ? (
                  <span className="cdm-live">
                    <span className="cdm-live-dot" aria-hidden />
                    {row.value}
                  </span>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {view.warnings ? (
        <section className="cdm-panel cdm-panel--warn" aria-labelledby="cdm-warn-title">
          <h2 id="cdm-warn-title">{view.warnings.title}</h2>
          <ul className="cdm-warn-list">
            {view.warnings.items.map((item) => (
              <li key={item.title}>
                <span className="cdm-warn-icon" aria-hidden>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                    <path d="M12 3 2 20h20L12 3z" />
                    <path d="M12 10v4" />
                  </svg>
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="cdm-panel cdm-panel--steps" aria-labelledby="cdm-steps-title">
        <h2 id="cdm-steps-title">{view.nextSteps.title}</h2>
        {view.nextSteps.items.length > 0 ? (
          <ul className="cdm-steps-list">
            {view.nextSteps.items.map((item) => (
              <li key={`${item.label}-${item.date}`}>
                <span className="cdm-step-check" aria-hidden>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                </span>
                <div>
                  <p>{item.label}</p>
                  <span className="cdm-step-date">{item.date}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cdm-steps-empty">{view.nextSteps.emptyMessage}</p>
        )}
        <button type="button" className="cdm-steps-cta" disabled title="Canlı aksiyon planı bağlandığında etkinleşir">
          {view.nextSteps.cta}
        </button>
      </section>

      <section className="cdm-panel cdm-panel--quick" aria-labelledby="cdm-quick-title">
        <h2 id="cdm-quick-title">Hızlı İşlemler</h2>
        <ul className="cdm-quick-list">
          {view.quickActions.map((action) => (
            <li key={action.href}>
              <Link href={action.href}>{action.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function CustomerDetailReferenceLayout({ customerId }: Props) {
  const desk = useCustomerDetailReferenceState(customerId);

  if (desk.isDemoPreview) {
    return (
      <CustomerReferenceCommandCenterFrame>
        <div className="cdm-home cdm-home--embedded" data-page="customer-detail-reference">
          <EmptyState
            title="Önizleme kaydı"
            message="Bu kayıt portföy önizlemesidir; gerçek cari detayı açılmaz. Listeden gerçek bir cari seçin."
            actions={
              <Link href="/cariler" className="cdm-btn cdm-btn--outline">
                Cari listesine dön
              </Link>
            }
          />
        </div>
      </CustomerReferenceCommandCenterFrame>
    );
  }

  if (desk.loading) {
    return (
      <CustomerReferenceCommandCenterFrame>
        <CustomerReferenceLoadingState variant="cdm" />
      </CustomerReferenceCommandCenterFrame>
    );
  }

  if (!desk.view) {
    return (
      <CustomerReferenceCommandCenterFrame>
        <CustomerReferenceNotFoundState variant="cdm" />
      </CustomerReferenceCommandCenterFrame>
    );
  }

  const view = desk.view;

  return (
    <CustomerReferenceCommandCenterFrame>
      <div className="cdm-home cdm-home--embedded" data-page="customer-detail-reference">
      <header className="cdm-hero" aria-label="Cari üst bilgi">
        <Link href="/cariler" className="cdm-back" aria-label="Cariler listesine dön">
          <IconCdmBack />
        </Link>
        <span className="cdm-avatar">{view.hero.initials}</span>
        <div className="cdm-hero-main">
          <div className="cdm-hero-title-row">
            <h1>{view.hero.title}</h1>
            <span className="cdm-status">{view.hero.status}</span>
          </div>
          <p className="cdm-hero-meta">
            {view.hero.meta.map((item, index) => (
              <span key={item.label}>
                {index > 0 ? <span className="cdm-meta-sep">·</span> : null}
                <span className="cdm-meta-label">{item.label}:</span> {item.value}
              </span>
            ))}
          </p>
        </div>
        <div className="cdm-hero-actions">
          <Link href={`/hizli-islem/satis-masasi?tab=order&customer=${customerId}`} className="cdm-btn cdm-btn--primary">
            <IconCdmBtn kind="plus" />
            Yeni İşlem
            <IconCdmChevronDown className="cdm-btn-chevron" />
          </Link>
          <button type="button" className="cdm-btn cdm-btn--outline" disabled title="Canlı düzenleme bağlandığında etkinleşir">
            <IconCdmBtn kind="edit" />
            Düzenle
          </button>
          <button type="button" className="cdm-btn cdm-btn--outline" disabled title="Ek işlemler canlı bağlantı sonrası etkinleşir">
            <IconCdmBtn kind="more" />
            Diğer
          </button>
        </div>
      </header>

      <nav className="cdm-tabs" aria-label="Cari detay ve katmanları" role="tablist">
        <Link
          href={customerLayerHref(customerId)}
          role="tab"
          aria-selected
          aria-current="page"
          className="cdm-tab cdm-tab--active"
        >
          {CUSTOMER_DETAIL_ROOT_LABEL}
        </Link>
        {view.tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={false}
            className="cdm-tab"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="cdm-grid-scroll">
        <DetailPanels view={view} />
      </div>
      </div>
    </CustomerReferenceCommandCenterFrame>
  );
}
