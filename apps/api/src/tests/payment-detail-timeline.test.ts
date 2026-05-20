import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pagePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../web/src/features/payments/components/PaymentDetailPage.tsx"
);
const timelinePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../web/src/features/shared/components/EntityTimelinePanel.tsx"
);
const pageSource = readFileSync(pagePath, "utf8");
const timelineSource = readFileSync(timelinePath, "utf8");

test("payment detail page includes entity timeline panel", () => {
  assert.match(pageSource, /EntityTimelinePanel/);
  assert.match(pageSource, /entityType="payment"/);
  assert.match(timelineSource, /İşlem geçmişi şu anda alınamıyor/);
  assert.match(timelineSource, /Bu kayıt için işlem geçmişi bulunmuyor/);
});
