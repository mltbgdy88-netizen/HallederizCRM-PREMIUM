import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "@hallederiz/sdk";
import {
  buildSettingsLoginHref,
  isSettingsSessionError,
  resolveSettingsLoadError
} from "../utils/resolve-settings-load-error";

test("401 ApiError maps to session recovery", () => {
  const error = new ApiError("Bu endpoint icin oturum gerekli.", 401);
  assert.equal(isSettingsSessionError(error), true);
  const resolved = resolveSettingsLoadError(error, "Ayarlar yüklenemedi.");
  assert.equal(resolved.kind, "session");
  assert.match(resolved.message, /tekrar giriş yapın/i);
  assert.doesNotMatch(resolved.message, /endpoint/i);
});

test("session message without status still maps to session recovery", () => {
  const error = new Error("Bu endpoint icin oturum gerekli.");
  assert.equal(isSettingsSessionError(error), true);
  assert.equal(resolveSettingsLoadError(error, "fallback").kind, "session");
});

test("403 permission error stays generic", () => {
  const error = new ApiError("Islem yetkisi yok.", 403);
  assert.equal(isSettingsSessionError(error), false);
  const resolved = resolveSettingsLoadError(error, "fallback");
  assert.equal(resolved.kind, "generic");
  assert.equal(resolved.message, "Islem yetkisi yok.");
});

test("buildSettingsLoginHref preserves safe return path", () => {
  assert.equal(
    buildSettingsLoginHref("/ayarlar/genel?bolum=whatsapp"),
    "/login?next=%2Fayarlar%2Fgenel%3Fbolum%3Dwhatsapp"
  );
  assert.equal(buildSettingsLoginHref("//evil.example"), "/login?next=%2Fdashboard");
});
