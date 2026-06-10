"use client";

import { StokOperasyonPage } from "@/features/stok/components/StokOperasyonPage";

export function SistemStateBackdrop() {
  return (
    <div className="sys-backdrop" aria-hidden>
      <StokOperasyonPage />
    </div>
  );
}
