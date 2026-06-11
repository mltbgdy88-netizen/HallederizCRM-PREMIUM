"use client";

import { EmptyState, LoadingState } from "@hallederiz/ui";
import Link from "next/link";
import type { CustomerLayerKey } from "../../../ui-inventory/utils/cariler-subroute-command-center-data";
import type { CustomerLayerReferenceView } from "../../utils/map-customer-layer-to-reference";
import { CustomerLayerHero } from "./CustomerLayerHero";
import { CustomerLayerMainSurface } from "./CustomerLayerMainSurface";
import { CustomerLayerTabs } from "./CustomerLayerTabs";

type Props = {
  layer: CustomerLayerKey;
  loading: boolean;
  isDemoPreview: boolean;
  view: CustomerLayerReferenceView | null;
  main: React.ReactNode;
  side: React.ReactNode;
  timelineFilters?: React.ReactNode;
};

function frameHomeClass(layer: CustomerLayerKey): string {
  const modifiers: string[] = ["ckm-home", "ckm-home--embedded"];
  if (layer === "finans") modifiers.push("ckm-home--finans-emerald");
  if (layer === "ozet") modifiers.push("ckm-home--ozet-desk");
  if (layer === "timeline") modifiers.push("ckm-home--timeline");
  return modifiers.join(" ");
}

export function CustomerLayerReferenceFrame({
  layer,
  loading,
  isDemoPreview,
  view,
  main,
  side,
  timelineFilters
}: Props) {
  const homeClass = frameHomeClass(layer);

  if (isDemoPreview) {
    return (
      <div className={homeClass} data-page="customer-layer-reference">
        <EmptyState
          title="Önizleme kaydı"
          message="Bu kayıt portföy önizlemesidir; gerçek cari katmanı açılmaz."
          actions={
            <Link href="/cariler" className="ckm-btn ckm-btn--outline">
              Cari listesine dön
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState title="Cari katmanı yükleniyor" message="Cari kartı ve katman verileri hazırlanıyor." />;
  }

  if (!view) {
    return (
      <div className={homeClass} data-page="customer-layer-reference">
        <EmptyState
          title="Cari bulunamadı"
          message="Seçilen cari kaydı bulunamadı veya erişim kapsamınız dışında olabilir."
          actions={
            <Link href="/cariler" className="ckm-btn ckm-btn--outline">
              Cari listesine dön
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className={homeClass} data-page="customer-layer-reference">
      <CustomerLayerHero header={view.header} />
      <CustomerLayerTabs view={view} />
      <CustomerLayerMainSurface layer={layer} main={main} side={side} timelineFilters={timelineFilters} />
    </div>
  );
}
