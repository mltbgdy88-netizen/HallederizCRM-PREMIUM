import assert from "node:assert/strict";
import test from "node:test";
import { assertRuntimeEnv, readRuntimeEnv, validateRuntimeEnv } from "@hallederiz/config";

test("production demo auth flags are invalid", () => {
  const env = readRuntimeEnv({
    NODE_ENV: "production",
    DEMO_AUTH_ENABLED: "true"
  } as NodeJS.ProcessEnv);
  const result = validateRuntimeEnv(env, { strictProduction: true });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === "demo_auth_forbidden"));
});

test("production NEXT_PUBLIC_USE_DEMO_DATA is invalid", () => {
  const env = readRuntimeEnv({
    NODE_ENV: "production",
    NEXT_PUBLIC_USE_DEMO_DATA: "true"
  } as NodeJS.ProcessEnv);
  const result = validateRuntimeEnv(env, { strictProduction: true });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === "demo_data_forbidden"));
});

test("postgres mode without DB URL is invalid", () => {
  const env = readRuntimeEnv({
    PERSISTENCE_MODE: "postgres"
  } as NodeJS.ProcessEnv);
  const result = validateRuntimeEnv(env);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === "postgres_url_missing"));
});

test("postgres mode with POSTGRES_URL is valid", () => {
  const env = readRuntimeEnv({
    NODE_ENV: "development",
    PERSISTENCE_MODE: "postgres",
    POSTGRES_URL: "postgres://localhost:5432/hallederiz"
  } as NodeJS.ProcessEnv);
  const result = validateRuntimeEnv(env);
  assert.equal(result.ok, true);
});

test("development demo mode is valid", () => {
  const env = readRuntimeEnv({
    NODE_ENV: "development",
    PERSISTENCE_MODE: "demo",
    DEMO_AUTH_ENABLED: "true",
    NEXT_PUBLIC_USE_DEMO_DATA: "true"
  } as NodeJS.ProcessEnv);
  const result = validateRuntimeEnv(env, { strictProduction: false });
  assert.equal(result.ok, true);
});

test("WHATSAPP live provider missing secret is invalid", () => {
  const env = readRuntimeEnv({
    WHATSAPP_PROVIDER: "live"
  } as NodeJS.ProcessEnv);
  const result = validateRuntimeEnv(env);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code.startsWith("whatsapp_")));
});

test("production TENANT_ENCRYPTION_KEY missing is invalid", () => {
  const env = readRuntimeEnv({
    NODE_ENV: "production",
    PERSISTENCE_MODE: "postgres",
    POSTGRES_URL: "postgres://localhost:5432/hallederiz"
  } as NodeJS.ProcessEnv);
  assert.throws(() => assertRuntimeEnv(env, { strictProduction: true }));
});
