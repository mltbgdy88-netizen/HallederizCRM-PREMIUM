import assert from "node:assert/strict";
import test from "node:test";
import type { WhatsAppWebLocalConnectionState } from "@hallederiz/types";
import type { WhatsAppWebLocalControlSnapshot } from "../services/whatsapp-web-local-control";
import {
  formatWhatsAppWebLocalCheckedAt,
  resolveWhatsAppWebLocalView
} from "../utils/whatsapp-web-local-view";

const STATES: readonly WhatsAppWebLocalConnectionState[] = [
  "disabled",
  "starting",
  "qr_ready",
  "connecting",
  "connected",
  "reconnecting",
  "logged_out",
  "expired",
  "error"
];

function snapshot(
  state: WhatsAppWebLocalConnectionState,
  reasonCode = "whatsapp_web_local_state_updated"
): WhatsAppWebLocalControlSnapshot {
  return {
    state,
    reasonCode,
    generation: 1,
    providerCallExecuted: false,
    checkedAt: "2026-07-29T10:00:00.000Z"
  };
}

test("all connection states have honest Turkish view mappings", () => {
  for (const state of STATES) {
    const view = resolveWhatsAppWebLocalView(snapshot(state));
    assert.ok(view.badgeLabel.length > 0, state);
    assert.ok(view.statusText.length > 0, state);
    assert.ok(view.description.length > 0, state);
    assert.ok(view.qrPlaceholderText.length > 0, state);
    assert.ok(view.actionHint.length > 0, state);
    assert.equal(view.productionHardDeny, false, state);
    assert.equal(view.actions.status.visible, true, state);
  }
});

test("state actions follow the manual control policy", () => {
  const disabled = resolveWhatsAppWebLocalView(snapshot("disabled"));
  assert.equal(disabled.badgeLabel, "Devre dışı");
  assert.equal(disabled.actions.start.visible, false);
  assert.equal(disabled.actions.disconnect.visible, false);
  assert.equal(disabled.actions.logout.visible, false);

  const loggedOut = resolveWhatsAppWebLocalView(snapshot("logged_out"));
  assert.equal(loggedOut.badgeLabel, "Bağlı değil");
  assert.equal(loggedOut.actions.start.enabled, true);

  for (const lockedState of ["starting", "connecting"] as const) {
    const view = resolveWhatsAppWebLocalView(snapshot(lockedState));
    assert.equal(view.actions.status.enabled, true);
    assert.equal(view.actions.start.visible, false);
    assert.equal(view.actions.disconnect.visible, false);
    assert.equal(view.actions.logout.visible, false);
  }

  const connected = resolveWhatsAppWebLocalView(snapshot("connected"));
  assert.equal(connected.actions.disconnect.enabled, true);
  assert.equal(connected.actions.logout.enabled, true);

  const reconnecting = resolveWhatsAppWebLocalView(snapshot("reconnecting"));
  assert.equal(reconnecting.actions.status.enabled, true);
  assert.equal(reconnecting.actions.disconnect.enabled, true);

  for (const restartableState of ["expired", "error"] as const) {
    const view = resolveWhatsAppWebLocalView(snapshot(restartableState));
    assert.equal(view.actions.start.enabled, true);
    assert.equal(view.actions.logout.enabled, true);
  }
});

test("production hard-deny disables every mutation and points to Meta Cloud API", () => {
  const view = resolveWhatsAppWebLocalView(
    snapshot("disabled", "whatsapp_web_local_production_hard_deny")
  );

  assert.equal(view.productionHardDeny, true);
  assert.equal(view.statusText, "Production ortamında yerel bağlantı kapalı");
  assert.match(view.description, /Meta WhatsApp Cloud API/);
  assert.equal(view.actions.status.enabled, true);
  assert.equal(view.actions.start.visible, false);
  assert.equal(view.actions.refresh_pairing.visible, false);
  assert.equal(view.actions.disconnect.visible, false);
  assert.equal(view.actions.logout.visible, false);
});

test("connected is not presented as production-ready", () => {
  const view = resolveWhatsAppWebLocalView(snapshot("connected"));

  assert.equal(view.badgeLabel, "Yerel bağlantı aktif");
  assert.match(view.description, /production onayı değildir/);
  assert.match(view.description, /mesaj gönderimi kapalıdır/);
});

test("qr_ready never claims that a real QR exists", () => {
  const view = resolveWhatsAppWebLocalView(snapshot("qr_ready"));

  assert.equal(view.badgeLabel, "Eşleştirme bekleniyor");
  assert.match(view.description, /Gerçek QR sağlayıcısı henüz bağlı değil/);
  assert.match(view.qrPlaceholderText, /yalnız güvenli durum bilgisini gösterir/);
  assert.doesNotMatch(view.qrPlaceholderText, /tarayın|telefonunuzla okutun/i);
  assert.equal(view.actions.refresh_pairing.enabled, true);
});

test("checkedAt formatting rejects invalid values and formats valid dates", () => {
  assert.equal(formatWhatsAppWebLocalCheckedAt(undefined), null);
  assert.equal(formatWhatsAppWebLocalCheckedAt("invalid"), null);
  const formatted = formatWhatsAppWebLocalCheckedAt("2026-07-29T10:00:00.000Z");
  assert.ok(formatted);
  assert.match(formatted, /29\.07\.2026|29\.07\.26/);
});
