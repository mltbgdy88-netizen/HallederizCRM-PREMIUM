import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildSettingsLoginHref,
  isSettingsSessionError,
  resolveSettingsLoadError,
  SETTINGS_SESSION_RECOVERY_COPY
} from "../utils/resolve-settings-load-error";

function apiError(message: string, status: number): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

test("401 ApiError maps to session recovery", () => {
  const error = apiError("Bu endpoint icin oturum gerekli.", 401);
  assert.equal(isSettingsSessionError(error), true);
  const resolved = resolveSettingsLoadError(error, "Ayarlar yüklenemedi.");
  assert.equal(resolved.kind, "session");
  assert.equal(resolved.message, SETTINGS_SESSION_RECOVERY_COPY.message);
  assert.doesNotMatch(resolved.message, /endpoint/i);
});

test("session message without status still maps to session recovery", () => {
  const error = new Error("Bu endpoint icin oturum gerekli.");
  assert.equal(isSettingsSessionError(error), true);
  assert.equal(resolveSettingsLoadError(error, "fallback").kind, "session");
});

test("403 permission error stays generic", () => {
  const error = apiError("Islem yetkisi yok.", 403);
  assert.equal(isSettingsSessionError(error), false);
  const resolved = resolveSettingsLoadError(error, "fallback");
  assert.equal(resolved.kind, "generic");
  assert.equal(resolved.message, "Islem yetkisi yok.");
});

test("generic unauthorized text without 401 stays generic", () => {
  const error = new Error("Unauthorized upstream gateway failed");
  assert.equal(isSettingsSessionError(error), false);
  const resolved = resolveSettingsLoadError(error, "fallback");
  assert.equal(resolved.kind, "generic");
  assert.equal(resolved.message, "Unauthorized upstream gateway failed");
});

test("generic unauthorized ApiError without session-required text stays generic", () => {
  const error = apiError("Unauthorized upstream gateway failed", 500);
  assert.equal(isSettingsSessionError(error), false);
  const resolved = resolveSettingsLoadError(error, "fallback");
  assert.equal(resolved.kind, "generic");
  assert.equal(resolved.message, "Unauthorized upstream gateway failed");
});

test("buildSettingsLoginHref preserves safe return path", () => {
  assert.equal(
    buildSettingsLoginHref("/ayarlar/genel?bolum=whatsapp"),
    "/login?next=%2Fayarlar%2Fgenel%3Fbolum%3Dwhatsapp"
  );
  assert.equal(buildSettingsLoginHref("//evil.example"), "/login?next=%2Fdashboard");
});

test("session recovery copy exposes required recovery actions", () => {
  assert.equal(SETTINGS_SESSION_RECOVERY_COPY.title, "Oturum doğrulanamadı");
  assert.equal(SETTINGS_SESSION_RECOVERY_COPY.loginAction, "Tekrar giriş yap");
  assert.equal(SETTINGS_SESSION_RECOVERY_COPY.retryAction, "Tekrar dene");
});

test("general settings reference layout uses recovery view instead of raw load error", () => {
  const source = readFileSync(new URL("../components/SettingsGeneralReferenceLayout.tsx", import.meta.url), "utf8");
  assert.match(source, /SettingsLoadErrorView/);
  assert.doesNotMatch(source, /<div className="setf-state" role="alert">\s*\{form\.loadError\}/);
});
