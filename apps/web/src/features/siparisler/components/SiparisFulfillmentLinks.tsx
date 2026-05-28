"use client";

import Link from "next/link";
import type { SiparisFulfillment } from "@/lib/siparis-fulfillment-links";
import {
  fulfillmentShowsDepoLink,
  fulfillmentShowsFabrikaLink,
  resolveDepoHazirlikHref,
  resolveFabrikaSiparisDetayHref,
  resolveFabrikaSiparisListeHref
} from "@/lib/siparis-fulfillment-links";

type SiparisFulfillmentLinksProps = {
  fulfillment: SiparisFulfillment;
  salesOrderId?: string;
  className?: string;
  compact?: boolean;
};

export function SiparisFulfillmentLinks({
  fulfillment,
  salesOrderId,
  className = "",
  compact = false
}: SiparisFulfillmentLinksProps) {
  const showFabrika = fulfillmentShowsFabrikaLink(fulfillment);
  const showDepo = fulfillmentShowsDepoLink(fulfillment);

  if (!showFabrika && !showDepo) {
    return null;
  }

  const fabrikaHref = fulfillment.factoryOrderId
    ? resolveFabrikaSiparisDetayHref(fulfillment.factoryOrderId)
    : resolveFabrikaSiparisListeHref(salesOrderId);

  return (
    <div className={`sip-fulfillment${className ? ` ${className}` : ""}`}>
      {!compact ? (
        <p className="sip-fulfillment-label">
          <span className="sip-fulfillment-tag">Kaynak</span>
          {fulfillment.label}
        </p>
      ) : null}
      <div className="sip-fulfillment-actions">
        {showFabrika ? (
          <Link href={fabrikaHref} className="sip-fulfillment-link sip-fulfillment-link--factory">
            Fabrika emri
          </Link>
        ) : null}
        {showDepo ? (
          <Link
            href={resolveDepoHazirlikHref(fulfillment.warehouseOrderId)}
            className="sip-fulfillment-link sip-fulfillment-link--warehouse"
          >
            Depo hazırlık
          </Link>
        ) : null}
        {showFabrika ? (
          <Link
            href={resolveFabrikaSiparisListeHref(salesOrderId)}
            className="sip-fulfillment-link sip-fulfillment-link--ghost"
          >
            Tüm fabrika siparişleri
          </Link>
        ) : null}
      </div>
    </div>
  );
}

