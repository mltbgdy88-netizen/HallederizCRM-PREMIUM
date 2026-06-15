"use client";

import type { ReactNode } from "react";
import { DetailLoadingState, DetailNotFoundState } from "../../shared/detail-shell";
import type { CustomerLayerKey } from "../../ui-inventory/utils/cariler-subroute-command-center-data";

type CustomerReferenceStateShellProps = {
  children: ReactNode;
  variant: "cdm" | "cul";
  layer?: CustomerLayerKey;
};

function CustomerReferenceStateShell({ children, variant, layer }: CustomerReferenceStateShellProps) {
  if (variant === "cdm") {
    return (
      <div className="cdm-home cdm-home--embedded" data-page="customer-detail-reference">
        {children}
      </div>
    );
  }

  const className = layer ? `cul-page cul-page--embedded cul-page--${layer}` : "cul-page cul-page--embedded";

  return (
    <div className={className} data-page="customer-layer-unified">
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
