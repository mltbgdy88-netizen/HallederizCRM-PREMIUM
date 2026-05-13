import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  PRODUCT_MODULE_ROOT_HREFS,
  PRODUCT_ROUTE_FOREST,
  flattenProductRoutes,
  resetProductRouteManifestCache
} from "../product-route-manifest";

describe("product-route-manifest", () => {
  beforeEach(() => {
    resetProductRouteManifestCache();
  });

  it("exports unique hrefs and labels for every flattened node", () => {
    const map = flattenProductRoutes();
    const hrefs = [...map.keys()];
    const unique = new Set(hrefs);
    assert.equal(unique.size, hrefs.length, "duplicate href in manifest");

    for (const node of map.values()) {
      assert.ok(node.label.trim().length > 0, `missing label for ${node.href}`);
    }
  });

  it("includes every module root landing href", () => {
    const roots = PRODUCT_ROUTE_FOREST.map((m) => m.href).sort();
    const expected = [...PRODUCT_MODULE_ROOT_HREFS].sort();
    assert.deepEqual(roots, expected);
  });

  it("marks known implemented anchors", () => {
    const map = flattenProductRoutes();
    assert.equal(map.get("/onaylar")?.status, "implemented");
    assert.equal(map.get("/gelen-kutu/whatsapp")?.existingFeature, "whatsapp-page");
    assert.equal(map.get("/yardimci/icgoruler")?.existingFeature, "ai-insights-page");
  });
});
