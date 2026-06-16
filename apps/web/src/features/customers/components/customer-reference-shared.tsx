"use client";

import type { ReactNode } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  DetailDemoBand,
  DetailKpiStrip,
  DetailLoadingState,
  DetailNotFoundState,
  DetailSideCard
} from "../../shared/detail-shell";
import type { CustomerLayerKey } from "../../ui-inventory/utils/cariler-subroute-command-center-data";
import { CarilerCustomeridCommandCenterShell } from "../../ui-inventory/components/CarilerShellWrappers";
import { CustomerEntityLayerNav } from "../../ui-inventory/components/EntityLayerNav";

type CustomerReferenceStateShellProps = {
  children: ReactNode;
  variant: "cdm" | "cul";
  layer?: CustomerLayerKey;
};

export function CustomerReferenceCommandCenterFrame({
  children,
  className,
  customerId
}: {
  children: ReactNode;
  className?: string;
  customerId?: string;
}) {
  const inner = className ? <div className={className}>{children}</div> : children;

  return (
    <CarilerCustomeridCommandCenterShell>
      {customerId ? <CustomerEntityLayerNav customerId={customerId} /> : null}
      {inner}
    </CarilerCustomeridCommandCenterShell>
  );
}

export function CustomerReferenceLayerShell({
  children,
  layer
}: {
  children: ReactNode;
  layer: CustomerLayerKey;
}) {
  return (
    <div className={`cul-page cul-page--embedded cul-page--${layer}`} data-page="customer-layer-unified">
      {children}
    </div>
  );
}

export function CustomerReferenceLayerHeader({ children }: { children: ReactNode }) {
  return <header className="cul-hero">{children}</header>;
}

export function CustomerReferenceSummaryScroll({ children }: { children: ReactNode }) {
  return <div className="cul-shell__scroll">{children}</div>;
}

export function CustomerReferenceDemoBand() {
  if (!dataSourceConfig.useDemoData) {
    return null;
  }

  return (
    <DetailDemoBand className="cul-demo-band">
      Demo veri modu: bu cari katmanı örnek kayıtlarla gösterilir; canlı mutation aksiyonları bağlı değildir.
    </DetailDemoBand>
  );
}

export function CustomerReferenceKpiStrip({
  children,
  className
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <DetailKpiStrip className={className} stickyClassName="cul-sticky-summary" ariaLabel="Katman KPI kartları">
      {children}
    </DetailKpiStrip>
  );
}

export function CustomerReferenceWorkspace({
  children,
  timeline = false
}: {
  children: ReactNode;
  timeline?: boolean;
}) {
  return (
    <div className={timeline ? "cul-workspace cul-workspace--timeline" : "cul-workspace"}>{children}</div>
  );
}

export function CustomerReferenceSideCard({
  title,
  children,
  ariaLabel
}: {
  title: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <DetailSideCard
      title={title}
      className="cul-side-card"
      headClassName="cul-side-card__head"
      ariaLabel={ariaLabel}
    >
      {children}
    </DetailSideCard>
  );
}

function CustomerReferenceStateShell({ children, variant, layer }: CustomerReferenceStateShellProps) {
  if (variant === "cdm") {
    return (
      <div className="cdm-home cdm-home--embedded" data-page="customer-detail-reference">
        {children}
      </div>
    );
  }

  if (layer) {
    return <CustomerReferenceLayerShell layer={layer}>{children}</CustomerReferenceLayerShell>;
  }

  return (
    <div className="cul-page cul-page--embedded" data-page="customer-layer-unified">
      {children}
    </div>
  );
}

export function CustomerReferenceLoadingState({ variant, layer }: { variant: "cdm" | "cul"; layer?: CustomerLayerKey }) {
  const stateClassName = variant === "cdm" ? "cdm-state" : "cul-state";
  const content = (
    <DetailLoadingState
      title={variant === "cdm" ? "Cari yükleniyor" : "Cari katmanı yükleniyor"}
      message={
        variant === "cdm"
          ? "Cari kartı ve bağlı kayıtlar hazırlanıyor."
          : "Cari kartı ve katman verileri hazırlanıyor."
      }
      stateClassName={stateClassName}
      spinnerClassName={`${stateClassName}__spinner`}
    />
  );

  if (variant === "cul") {
    return (
      <CustomerReferenceStateShell variant={variant} layer={layer}>
        {content}
      </CustomerReferenceStateShell>
    );
  }

  return content;
}

export function CustomerReferenceNotFoundState({ variant, layer }: { variant: "cdm" | "cul"; layer?: CustomerLayerKey }) {
  const stateClassName = variant === "cdm" ? "cdm-state" : "cul-state";
  const linkClassName = variant === "cdm" ? "cdm-state__link" : "cul-state__link";

  const content = (
    <DetailNotFoundState
      title="Cari bulunamadı"
      message="Seçilen cari kaydı bulunamadı, silinmiş olabilir veya erişim kapsamınız dışında olabilir."
      backHref="/cariler"
      backLabel="Cari listesine dön"
      stateClassName={stateClassName}
      linkClassName={linkClassName}
    />
  );

  return (
    <CustomerReferenceStateShell variant={variant} layer={layer}>
      {content}
    </CustomerReferenceStateShell>
  );
}
