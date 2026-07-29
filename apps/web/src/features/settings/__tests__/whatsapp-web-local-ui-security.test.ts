import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const SETTINGS_ROOT = resolve("src", "features", "settings");
const COMPONENT_PATH = resolve(
  SETTINGS_ROOT,
  "components",
  "WhatsAppConnectionMethodsSection.tsx"
);
const CLIENT_SOURCE_PATHS = [
  COMPONENT_PATH,
  resolve(SETTINGS_ROOT, "services", "whatsapp-web-local-control.ts"),
  resolve(SETTINGS_ROOT, "hooks", "use-whatsapp-web-local-control.ts"),
  resolve(SETTINGS_ROOT, "utils", "whatsapp-web-local-view.ts")
];

function read(path: string): string {
  return readFileSync(path, "utf8");
}

test("the existing Meta Cloud card contract remains present", () => {
  const component = read(COMPONENT_PATH);
  const metaStart = component.indexOf(">Meta Cloud API<");
  const embeddedStart = component.indexOf(">Embedded Signup<");
  assert.ok(metaStart >= 0);
  assert.ok(embeddedStart > metaStart);
  const metaCard = component.slice(metaStart, embeddedStart);

  assert.match(metaCard, /Resmi ve önerilen production bağlantı yolu/);
  assert.match(metaCard, /Önerilen/);
  assert.match(metaCard, /Secret manager: verify token, app secret, API token, phone number id/);
  assert.match(metaCard, /Webhook imza doğrulaması fail-closed kalır/);
  assert.match(metaCard, /Staging kontrol/);
  assert.match(metaCard, /Operasyon masası/);
});

test("the local card shows beta, production, gate, and outbound boundaries", () => {
  const component = read(COMPONENT_PATH);

  for (const expected of [
    "WhatsApp Web Yerel Beta",
    "Yerel eşleştirme denemesi — production yolu değil",
    "Beta / yerel",
    "Bu özellik Beta / Yerel",
    "Production go-live sağlamaz.",
    "GATE-P0-WA durumunu değiştirmez.",
    "Resmi production yolu Meta WhatsApp Cloud API",
    "Mesaj gönderimi kapalıdır.",
    "Gerçek QR, sağlayıcı, session saklama ve canlı mesaj gönderimi bu kapsamda yoktur."
  ]) {
    assert.ok(component.includes(expected), expected);
  }
});

test("the local card wires manual actions and inline session recovery", () => {
  const component = read(COMPONENT_PATH);

  for (const actionLabel of [
    "Yerel betayı başlat",
    "Durumu yenile",
    "Eşleştirmeyi yenile",
    "Bağlantıyı kes",
    "Yerel oturumdan çık"
  ]) {
    assert.ok(component.includes(actionLabel), actionLabel);
  }
  assert.match(component, /<SettingsSessionRecoveryPanel/);
  assert.match(component, /layout="inline"/);
  assert.match(component, /role="status"/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /role="alert"/);
  assert.equal(component.includes("window.confirm"), false);
});

test("the card never renders raw control fields or fake QR material", () => {
  const component = read(COMPONENT_PATH);

  assert.equal(component.includes(".reasonCode"), false);
  assert.equal(component.includes(".generation"), false);
  assert.equal(component.includes(".providerCallExecuted"), false);
  assert.doesNotMatch(component, /data:image|<img|QRCode|canvas/i);
  assert.match(component, /qrPlaceholderText/);
});

test("client implementation contains no loopback, token, bearer, or public secret path", () => {
  const combinedSource = CLIENT_SOURCE_PATHS.map(read).join("\n");
  const controlTokenName = ["LOCAL", "AGENT", "CONTROL", "TOKEN"].join("_");
  const loopback = ["127", "0", "0", "1"].join(".");
  const authorizationHeader = ["Author", "ization"].join("");
  const bearerScheme = ["Bear", "er"].join("");

  assert.equal(combinedSource.includes(controlTokenName), false);
  assert.equal(combinedSource.includes(loopback), false);
  assert.equal(combinedSource.includes(authorizationHeader), false);
  assert.equal(combinedSource.includes(bearerScheme), false);
  assert.equal(combinedSource.includes("NEXT_PUBLIC_"), false);
  assert.equal(combinedSource.includes("setInterval"), false);
  assert.equal(combinedSource.includes("localStorage"), false);
  assert.equal(combinedSource.includes("sessionStorage"), false);
});
