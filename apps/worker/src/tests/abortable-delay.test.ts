import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import test from "node:test";
import { abortableDelay } from "../abortable-delay.js";

test("shutdown interrupts idle polling and settles the pending promise", async () => {
  const controller = new AbortController();
  const pending = abortableDelay(60_000, controller.signal);
  controller.abort();
  await pending;
  assert.equal(getEventListeners(controller.signal, "abort").length, 0);
});

test("normal polling removes abort listeners on every tick", async () => {
  const controller = new AbortController();
  for (let i = 0; i < 20; i++) await abortableDelay(1, controller.signal);
  assert.equal(getEventListeners(controller.signal, "abort").length, 0);
  controller.abort();
  await abortableDelay(60_000, controller.signal);
});
