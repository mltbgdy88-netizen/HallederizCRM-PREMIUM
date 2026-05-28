"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  buildCustomerEntityNav,
  buildOfferEntityNav,
  buildOrderEntityNav,
  resolveActiveEntityNav,
  type EntityLayerNavItem
} from "../utils/entity-layer-nav";

type EntityLayerNavProps = {
  items: EntityLayerNavItem[];
  activeHref?: string;
  listHref: string;
  listLabel: string;
};

export function EntityLayerNav({ items, activeHref, listHref, listLabel }: EntityLayerNavProps) {
  const pathname = usePathname();
  const active = activeHref ?? resolveActiveEntityNav(pathname, items);

  return (
    <nav className="hz-entity-layer-nav" aria-label="Katman gezinme">
      <Link href={listHref} className="hz-entity-layer-nav__back">
        {listLabel}
      </Link>
      <div className="hz-entity-layer-nav__tabs" role="tablist">
        {items.map((item) => {
          const isActive = item.href === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              className={`hz-entity-layer-nav__tab${isActive ? " hz-entity-layer-nav__tab--active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function CustomerEntityLayerNav({ customerId }: { customerId: string }) {
  return (
    <EntityLayerNav
      items={buildCustomerEntityNav(customerId)}
      listHref="/cariler"
      listLabel="← Cari listesi"
    />
  );
}

export function OrderEntityLayerNav({ orderId }: { orderId: string }) {
  return (
    <EntityLayerNav
      items={buildOrderEntityNav(orderId)}
      listHref="/siparisler"
      listLabel="← Sipariş listesi"
    />
  );
}

export function OfferEntityLayerNav({ offerId }: { offerId: string }) {
  return (
    <EntityLayerNav
      items={buildOfferEntityNav(offerId)}
      listHref="/teklifler"
      listLabel="← Teklif listesi"
    />
  );
}

