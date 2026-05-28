import assert from "node:assert/strict";
import test from "node:test";
import { defaultPlatformSettings, type PlatformSettings } from "@hallederiz/types";
import { buildPilotReadiness } from "../platform-core/pilot-readiness";

test("pilot readiness derives completion and blockers from settings", () => {
  const settings: PlatformSettings = {
    ...defaultPlatformSettings,
    company: {
      ...defaultPlatformSettings.company,
      companyName: "",
      legalName: ""
    },
    warehouses: defaultPlatformSettings.warehouses.map((warehouse, index) =>
      index === 0 ? { ...warehouse, active: false } : warehouse
    )
  };

  const summary = buildPilotReadiness("tenant_1", settings);
  assert.equal(summary.total > 0, true);
  assert.equal(summary.blockers.length > 0, true);
  assert.equal(summary.items.some((item) => item.id === "company-profile" && item.status === "eksik"), true);
});
