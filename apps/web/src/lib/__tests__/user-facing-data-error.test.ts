import assert from "node:assert/strict";
import test from "node:test";
import {
  containsTechnicalUserText,
  isOfflineLikeError,
  mapUserFacingDataError,
  mapUserFacingLoginError,
  MSG_DATA_UNAVAILABLE,
  MSG_LOGIN_UNAVAILABLE
} from "../user-facing-data-error";

test("isOfflineLikeError detects fetch failures", () => {
  assert.equal(isOfflineLikeError(new TypeError("fetch failed")), true);
  assert.equal(isOfflineLikeError(new Error("ECONNREFUSED")), true);
});

test("mapUserFacingDataError sanitizes technical messages", () => {
  assert.equal(mapUserFacingDataError(new Error("fetch failed")), MSG_DATA_UNAVAILABLE);
  assert.equal(mapUserFacingDataError(new Error("worker outbox dispatcher")), MSG_DATA_UNAVAILABLE);
});

test("mapUserFacingLoginError hides network details", () => {
  assert.equal(mapUserFacingLoginError({ networkError: true }), MSG_LOGIN_UNAVAILABLE);
  assert.equal(
    mapUserFacingLoginError({
      networkError: false,
      serverMessage: "API'ye ulaşılamadı (http://localhost:4999)"
    }),
    MSG_LOGIN_UNAVAILABLE
  );
});

test("containsTechnicalUserText flags internal terms", () => {
  assert.equal(containsTechnicalUserText("mock fallback"), true);
  assert.equal(containsTechnicalUserText("Cari listesi güncellenemedi"), false);
});

