import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const routesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../commercial-operations/routes.ts");
const routesSource = readFileSync(routesPath, "utf8");

test("commercial line read routes are registered", () => {
  assert.match(routesSource, /\/deliveries\/:id\/lines/);
  assert.match(routesSource, /\/invoices\/:id\/lines/);
  assert.match(routesSource, /\/returns\/:id\/lines/);
  assert.match(routesSource, /\/payments\/:id\/reversals/);
  assert.match(routesSource, /\/documents\/:id\/deliveries/);
});

test("payment reversal create route uses mutation policy", () => {
  assert.match(routesSource, /platform\.payments\.reverse/);
  assert.match(routesSource, /withMutationPolicy/);
});
