"use client";

import Link from "next/link";
import type { CustomerLayerReferenceView } from "../../utils/map-customer-layer-to-reference";

type Props = {
  view: CustomerLayerReferenceView;
};

export function CustomerLayerTabs({ view }: Props) {
  return (
    <nav className="ckm-tabs" aria-label="Cari katman sekmeleri">
      {view.tabs.map((tab) => {
        const active = tab.id === view.layer;
        return (
          <Link
            key={`${tab.id}-${tab.href}`}
            href={tab.href}
            className={active ? "ckm-tab ckm-tab--active" : "ckm-tab"}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
