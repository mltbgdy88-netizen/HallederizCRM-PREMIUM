"use client";

import Link from "next/link";
import { SystemStateReferenceLayout } from "./SystemStateReferenceLayout";
import {
  DEMO_MODE_CONFIG,
  LIVE_EMPTY_CONFIG,
  MOBILE_DRAWER_CONFIG,
  OFFLINE_API_CONFIG,
  PRINT_EXPORT_CONFIG,
  UNAUTHORIZED_CONFIG
} from "../utils/system-state-command-center-data";

export function OfflineApiCommandCenterPage() {
  return (
    <SystemStateReferenceLayout
      config={OFFLINE_API_CONFIG}
      mainActions={
        <>
          <button type="button" className="sysf-btn-primary" onClick={() => window.location.reload()}>
            Yeniden dene
          </button>
          <Link href="/dashboard" className="sysf-btn-secondary">
            Gösterge paneline dön
          </Link>
        </>
      }
    />
  );
}

export function DemoModeCommandCenterPage() {
  return <SystemStateReferenceLayout config={DEMO_MODE_CONFIG} />;
}

export function LiveEmptyCommandCenterPage() {
  return (
    <SystemStateReferenceLayout
      config={LIVE_EMPTY_CONFIG}
      mainActions={
        <>
          <Link href="/cariler" className="sysf-btn-primary">
            Cariler
          </Link>
          <Link href="/archive" className="sysf-btn-secondary">
            Arşiv
          </Link>
        </>
      }
    />
  );
}

export function MobileDrawerCommandCenterPage() {
  return <SystemStateReferenceLayout config={MOBILE_DRAWER_CONFIG} />;
}

export function PrintExportCommandCenterPage() {
  return <SystemStateReferenceLayout config={PRINT_EXPORT_CONFIG} />;
}

export function UnauthorizedReferenceLayout() {
  return (
    <SystemStateReferenceLayout
      config={UNAUTHORIZED_CONFIG}
      mainActions={
        <>
          <Link href="/login" className="sysf-btn-primary">
            Giriş yap
          </Link>
          <Link href="/dashboard" className="sysf-btn-secondary">
            Ana Sayfa
          </Link>
        </>
      }
    />
  );
}

/** Platform layout: print readiness host (görünmez, @media print) */
export function PrintExportCommandCenterLayer() {
  return (
    <div className="hz-print-export-center-layer" aria-hidden="true">
      <p>Print/export readiness — fake dosya üretilmez.</p>
    </div>
  );
}
