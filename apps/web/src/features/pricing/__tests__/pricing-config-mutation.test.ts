import assert from "node:assert/strict";
import test from "node:test";
import type { PriceSlotConfig } from "@hallederiz/types";
import { updatePricingConfig } from "../mutations/update-pricing-config";

const sampleSlots: PriceSlotConfig[] = [
  {
    slotNumber: 1,
    slotName: "Perakende",
    currency: "TRY",
    amount: 100,
    active: true
  }
];

test("pricing config returns failure for empty slots", async () => {
  const result = await updatePricingConfig({ slots: [] });
  assert.equal(result.success, false);
  assert.equal(result.updatedCount, 0);
});

test("pricing config successful patch", async () => {
  const result = await updatePricingConfig(
    { slots: sampleSlots },
    {
      client: {
        stock: {
          patchPriceSlots: async () => ({ items: sampleSlots })
        }
      } as never
    }
  );
  assert.equal(result.success, true);
  assert.equal(result.updatedCount, 1);
});

test("pricing config API fail", async () => {
  const result = await updatePricingConfig(
    { slots: sampleSlots },
    {
      client: {
        stock: {
          patchPriceSlots: async () => {
            throw Object.assign(new Error("offline"), { status: 503 });
          }
        }
      } as never
    }
  );
  assert.equal(result.success, false);
  assert.match(result.message ?? "", /güncellenemiyor/i);
});
