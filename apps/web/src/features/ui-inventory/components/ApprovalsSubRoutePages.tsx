"use client";

import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import {
  BEKLEYENLER_CONFIG,
  INCELEME_CONFIG,
  LIMITLER_CONFIG,
  TAMAMLANANLAR_CONFIG
} from "../utils/approvals-subroute-command-center-data";

export function OnaylarBekleyenlerCommandCenterPage() {
  return <InventoryCommandCenterPage config={BEKLEYENLER_CONFIG} />;
}

export function OnaylarIncelemeCommandCenterPage() {
  return <InventoryCommandCenterPage config={INCELEME_CONFIG} />;
}

export function OnaylarTamamlananlarCommandCenterPage() {
  return <InventoryCommandCenterPage config={TAMAMLANANLAR_CONFIG} />;
}

export function OnaylarLimitlerCommandCenterPage() {
  return <InventoryCommandCenterPage config={LIMITLER_CONFIG} />;
}
