"use client";

import { CustomerLayerReferenceLayout } from "./CustomerLayerReferenceLayout";

type Props = {
  customerId: string;
};

/** @deprecated Use CustomerLayerReferenceLayout with layer="finans". Kept for route import stability. */
export function CustomerFinanceLayerReferenceLayout({ customerId }: Props) {
  return <CustomerLayerReferenceLayout customerId={customerId} layer="finans" />;
}
