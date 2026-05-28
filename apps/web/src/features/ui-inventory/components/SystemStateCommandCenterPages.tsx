"use client";

import Link from "next/link";
import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import {
  DEMO_MODE_CONFIG,
  LIVE_EMPTY_CONFIG,
  MOBILE_DRAWER_CONFIG,
  OFFLINE_API_CONFIG,
  PRINT_EXPORT_CONFIG
} from "../utils/system-state-command-center-data";

export function OfflineApiCommandCenterPage() {
  const p = OFFLINE_API_CONFIG.prefix;
  return (
    <InventoryCommandCenterPage
      config={OFFLINE_API_CONFIG}
      mainActions={
        <>
          <button type="button" className={`${p}__button-primary`} onClick={() => window.location.reload()}>
            Yeniden dene
          </button>
          <Link href="/dashboard" className={`${p}__button-secondary`}>
            Gösterge paneline dön
          </Link>
        </>
      }
    />
  );
}

export function DemoModeCommandCenterPage() {
  return <InventoryCommandCenterPage config={DEMO_MODE_CONFIG} />;
}

export function LiveEmptyCommandCenterPage() {
  const p = LIVE_EMPTY_CONFIG.prefix;
  return (
    <InventoryCommandCenterPage
      config={LIVE_EMPTY_CONFIG}
      mainActions={
        <>
          <Link href="/cariler" className={`${p}__button-primary`}>
            Cariler
          </Link>
          <Link href="/archive" className={`${p}__button-secondary`}>
            Arşiv
          </Link>
        </>
      }
    />
  );
}

export function MobileDrawerCommandCenterPage() {
  return <InventoryCommandCenterPage config={MOBILE_DRAWER_CONFIG} />;
}

export function PrintExportCommandCenterPage() {
  return <InventoryCommandCenterPage config={PRINT_EXPORT_CONFIG} />;
}

/** Platform layout: print readiness host (görünmez, @media print) */
export function PrintExportCommandCenterLayer() {
  return (
    <div className="hz-print-export-center-layer" aria-hidden="true">
      <p>Print/export readiness — fake dosya üretilmez.</p>
    </div>
  );
}

