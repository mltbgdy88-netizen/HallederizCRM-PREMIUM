"use client";

import Link from "next/link";
import type { CkmHeaderView } from "../../utils/map-customer-layer-to-reference";
import { CkmBadge } from "./CkmBadge";

type Props = {
  header: CkmHeaderView;
};

export function CustomerLayerHero({ header }: Props) {
  return (
    <header className="ckm-hero" aria-label="Cari üst bilgi">
      <nav className="ckm-breadcrumb" aria-label="Breadcrumb">
        {header.breadcrumb.map((part, index) => (
          <span key={`${part}-${index}`}>
            {index > 0 ? <span className="ckm-breadcrumb-sep">›</span> : null}
            {index === 0 ? <Link href="/cariler">{part}</Link> : part}
          </span>
        ))}
      </nav>
      <div className="ckm-hero-body">
        <span className="ckm-logo">{header.initials}</span>
        <div className="ckm-hero-main">
          <div className="ckm-hero-title-row">
            <h1>{header.title}</h1>
            <CkmBadge>{header.status}</CkmBadge>
          </div>
          <div className="ckm-hero-grid">
            <dl className="ckm-hero-meta">
              {header.meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <dl className="ckm-hero-meta">
              {header.contact.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="ckm-hero-actions">
          <button type="button" className="ckm-btn ckm-btn--outline" disabled title="Canlı düzenleme bağlandığında etkinleşir">
            Düzenle
          </button>
          <button type="button" className="ckm-btn ckm-btn--outline" disabled aria-label="Diğer işlemler">
            ⋮
          </button>
        </div>
      </div>
    </header>
  );
}
