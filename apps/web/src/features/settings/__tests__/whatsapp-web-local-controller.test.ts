import assert from "node:assert/strict";
import test from "node:test";
import {
  WhatsAppWebLocalControlError,
  type WhatsAppWebLocalControlClient,
  type WhatsAppWebLocalControlSnapshot
} from "../services/whatsapp-web-local-control";
import { createWhatsAppWebLocalControlController } from "../hooks/use-whatsapp-web-local-control";

function snapshot(
  state: WhatsAppWebLocalControlSnapshot["state"],
  generation: number
): WhatsAppWebLocalControlSnapshot {
  const reasonCode =
    state === "logged_out"
      ? "whatsapp_web_local_enabled_non_production"
      : state === "starting"
        ? "whatsapp_web_local_pairing_stub_started"
        : state === "connected"
          ? "whatsapp_web_local_state_updated"
          : "whatsapp_web_local_logged_out";
  return {
    state,
    reasonCode,
    generation,
    providerCallExecuted: false,
    checkedAt: "2026-07-29T10:00:00.000Z"
  };
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createClient(
  overrides: Partial<WhatsAppWebLocalControlClient> = {}
): WhatsAppWebLocalControlClient {
  return {
    getStatus: async () => snapshot("logged_out", 0),
    start: async () => snapshot("starting", 1),
    refreshPairing: async () => snapshot("starting", 1),
    disconnect: async () => snapshot("logged_out", 1),
    logout: async () => snapshot("logged_out", 1),
    ...overrides
  };
}

test("mount runs exactly one GET status and no automatic mutation", async () => {
  const calls = {
    status: 0,
    start: 0,
    refreshPairing: 0,
    disconnect: 0,
    logout: 0
  };
  const client = createClient({
    getStatus: async () => {
      calls.status += 1;
      return snapshot("logged_out", 0);
    },
    start: async () => {
      calls.start += 1;
      return snapshot("starting", 1);
    },
    refreshPairing: async () => {
      calls.refreshPairing += 1;
      return snapshot("starting", 1);
    },
    disconnect: async () => {
      calls.disconnect += 1;
      return snapshot("logged_out", 1);
    },
    logout: async () => {
      calls.logout += 1;
      return snapshot("logged_out", 1);
    }
  });
  const controller = createWhatsAppWebLocalControlController(client);

  await controller.mount();
  await controller.mount();

  assert.deepEqual(calls, {
    status: 1,
    start: 0,
    refreshPairing: 0,
    disconnect: 0,
    logout: 0
  });
  assert.equal(controller.getState().snapshot?.state, "logged_out");
});

test("immediate effect cleanup and replay still produce one mount GET", async () => {
  let statusCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => {
        statusCalls += 1;
        return snapshot("logged_out", 0);
      }
    })
  );

  const firstEffect = controller.mount();
  controller.dispose();
  const replayedEffect = controller.mount();
  await Promise.all([firstEffect, replayedEffect]);

  assert.equal(statusCalls, 1);
  assert.equal(controller.getState().snapshot?.state, "logged_out");
});

test("only one mutation can run at a time", async () => {
  const pendingStart = deferred<WhatsAppWebLocalControlSnapshot>();
  let startCalls = 0;
  let logoutCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      start: () => {
        startCalls += 1;
        return pendingStart.promise;
      },
      logout: async () => {
        logoutCalls += 1;
        return snapshot("logged_out", 1);
      }
    })
  );
  await controller.mount();

  const startRequest = controller.startPairing();
  const blockedLogout = controller.logout();

  assert.equal(controller.getState().mutating, true);
  assert.equal(controller.getState().activeAction, "start");
  assert.equal(startCalls, 1);
  assert.equal(logoutCalls, 0);
  pendingStart.resolve(snapshot("starting", 1));
  await Promise.all([startRequest, blockedLogout]);
  assert.equal(controller.getState().mutating, false);
});

test("a stale response cannot overwrite a newer remounted snapshot", async () => {
  const first = deferred<WhatsAppWebLocalControlSnapshot>();
  const second = deferred<WhatsAppWebLocalControlSnapshot>();
  const signals: AbortSignal[] = [];
  let statusCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: (signal) => {
        statusCalls += 1;
        if (signal) signals.push(signal);
        return statusCalls === 1 ? first.promise : second.promise;
      }
    })
  );

  const firstMount = controller.mount();
  await Promise.resolve();
  controller.dispose();
  const secondMount = controller.mount();
  second.resolve(snapshot("connected", 2));
  await secondMount;
  first.resolve(snapshot("logged_out", 1));
  await firstMount;

  assert.equal(signals.length, 2);
  assert.equal(signals[0]?.aborted, true);
  assert.equal(controller.getState().snapshot?.state, "connected");
  assert.equal(controller.getState().snapshot?.generation, 2);
});

test("a current status accepts generation reset after a local-agent restart", async () => {
  let statusCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => {
        statusCalls += 1;
        return statusCalls === 1
          ? snapshot("connected", 8)
          : snapshot("logged_out", 0);
      }
    })
  );
  await controller.mount();

  await controller.refreshStatus();

  assert.equal(controller.getState().snapshot?.state, "logged_out");
  assert.equal(controller.getState().snapshot?.generation, 0);
});

test("a current response with the same generation applies its newer state", async () => {
  let statusCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => {
        statusCalls += 1;
        return statusCalls === 1
          ? snapshot("starting", 3)
          : snapshot("connected", 3);
      }
    })
  );
  await controller.mount();

  await controller.refreshStatus();

  assert.equal(controller.getState().snapshot?.state, "connected");
  assert.equal(controller.getState().snapshot?.generation, 3);
});

test("a stale higher-generation success cannot overwrite the current reset snapshot", async () => {
  const stale = deferred<WhatsAppWebLocalControlSnapshot>();
  let statusCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: () => {
        statusCalls += 1;
        return statusCalls === 1
          ? stale.promise
          : Promise.resolve(snapshot("logged_out", 0));
      }
    })
  );

  const staleMount = controller.mount();
  await Promise.resolve();
  controller.dispose();
  await controller.mount();
  stale.resolve(snapshot("connected", 8));
  await staleMount;

  assert.equal(controller.getState().snapshot?.state, "logged_out");
  assert.equal(controller.getState().snapshot?.generation, 0);
});

test("a stale request error cannot overwrite a current success", async () => {
  const stale = deferred<WhatsAppWebLocalControlSnapshot>();
  let statusCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: () => {
        statusCalls += 1;
        return statusCalls === 1
          ? stale.promise
          : Promise.resolve(snapshot("connected", 0));
      }
    })
  );

  const staleMount = controller.mount();
  await Promise.resolve();
  controller.dispose();
  await controller.mount();
  stale.reject(new Error("stale sensitive failure"));
  await staleMount;

  assert.equal(controller.getState().snapshot?.state, "connected");
  assert.equal(controller.getState().errorMessage, null);
  assert.equal(controller.getState().sessionError, false);
});

test("a stale success cannot overwrite a current session error", async () => {
  const stale = deferred<WhatsAppWebLocalControlSnapshot>();
  let statusCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: () => {
        statusCalls += 1;
        if (statusCalls === 1) {
          return stale.promise;
        }
        return Promise.reject(
          new WhatsAppWebLocalControlError(
            401,
            "session_required",
            "Oturum doğrulanamadı."
          )
        );
      }
    })
  );

  const staleMount = controller.mount();
  await Promise.resolve();
  controller.dispose();
  await controller.mount();
  stale.resolve(snapshot("connected", 8));
  await staleMount;

  assert.equal(controller.getState().snapshot, null);
  assert.equal(controller.getState().sessionError, true);
  assert.equal(controller.getState().errorMessage, "Oturum doğrulanamadı.");
});

test("dispose aborts the active request", async () => {
  const pendingStatus = deferred<WhatsAppWebLocalControlSnapshot>();
  let capturedSignal: AbortSignal | undefined;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: (signal) => {
        capturedSignal = signal;
        return pendingStatus.promise;
      }
    })
  );

  const mountRequest = controller.mount();
  await Promise.resolve();
  controller.dispose();

  assert.equal(capturedSignal?.aborted, true);
  pendingStatus.resolve(snapshot("logged_out", 0));
  await mountRequest;
  assert.equal(controller.getState().snapshot, null);
});

test("dispose ignores both a late success and a late error", async () => {
  for (const outcome of ["success", "error"] as const) {
    const pendingStatus = deferred<WhatsAppWebLocalControlSnapshot>();
    const controller = createWhatsAppWebLocalControlController(
      createClient({ getStatus: () => pendingStatus.promise })
    );
    const mountRequest = controller.mount();
    await Promise.resolve();
    controller.dispose();

    if (outcome === "success") {
      pendingStatus.resolve(snapshot("connected", 9));
    } else {
      pendingStatus.reject(new Error("late sensitive failure"));
    }
    await mountRequest;

    assert.equal(controller.getState().snapshot, null);
    assert.equal(controller.getState().errorMessage, null);
    assert.equal(controller.getState().sessionError, false);
  }
});

test("a running status request blocks mutations", async () => {
  const pendingStatus = deferred<WhatsAppWebLocalControlSnapshot>();
  let startCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: () => pendingStatus.promise,
      start: async () => {
        startCalls += 1;
        return snapshot("starting", 1);
      }
    })
  );

  const mountRequest = controller.mount();
  await Promise.resolve();
  await controller.startPairing();

  assert.equal(startCalls, 0);
  assert.equal(controller.getState().activeAction, "status");
  pendingStatus.resolve(snapshot("logged_out", 0));
  await mountRequest;
});

test("a running mutation blocks status refresh and rapid duplicate mutations", async () => {
  const pendingStart = deferred<WhatsAppWebLocalControlSnapshot>();
  let statusCalls = 0;
  let startCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => {
        statusCalls += 1;
        return snapshot("logged_out", 0);
      },
      start: () => {
        startCalls += 1;
        return pendingStart.promise;
      }
    })
  );
  await controller.mount();

  const firstStart = controller.startPairing();
  const secondStart = controller.startPairing();
  const blockedStatus = controller.refreshStatus();

  assert.equal(startCalls, 1);
  assert.equal(statusCalls, 1);
  pendingStart.resolve(snapshot("starting", 1));
  await Promise.all([firstStart, secondStart, blockedStatus]);
});

test("AbortError is suppressed instead of becoming a generic user error", async () => {
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      start: async () => {
        throw new DOMException("request cancelled", "AbortError");
      }
    })
  );
  await controller.mount();

  await controller.startPairing();

  assert.equal(controller.getState().errorMessage, null);
  assert.equal(controller.getState().sessionError, false);
  assert.equal(controller.getState().mutating, false);
});

test("a failed mutation preserves the previous safe snapshot", async () => {
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => snapshot("connected", 4),
      disconnect: async () => {
        throw new Error("sensitive mutation failure");
      }
    })
  );
  await controller.mount();

  await controller.disconnect();

  assert.equal(controller.getState().snapshot?.state, "connected");
  assert.equal(controller.getState().snapshot?.generation, 4);
  assert.equal(
    controller.getState().errorMessage?.includes("sensitive mutation failure"),
    false
  );
});

test("successful mutation applies its response without a second status GET", async () => {
  let statusCalls = 0;
  let startCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => {
        statusCalls += 1;
        return snapshot("logged_out", 0);
      },
      start: async () => {
        startCalls += 1;
        return snapshot("starting", 1);
      }
    })
  );
  await controller.mount();

  await controller.startPairing();

  assert.equal(statusCalls, 1);
  assert.equal(startCalls, 1);
  assert.equal(controller.getState().snapshot?.state, "starting");
});

test("401 is separated as a session recovery error", async () => {
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => {
        throw new WhatsAppWebLocalControlError(
          401,
          "session_required",
          "Oturum doğrulanamadı."
        );
      }
    })
  );

  await controller.mount();

  assert.equal(controller.getState().sessionError, true);
  assert.equal(controller.getState().errorMessage, "Oturum doğrulanamadı.");
});

test("generic recovery retries only GET status and never repeats a mutation", async () => {
  let statusCalls = 0;
  let startCalls = 0;
  const controller = createWhatsAppWebLocalControlController(
    createClient({
      getStatus: async () => {
        statusCalls += 1;
        return snapshot("logged_out", 0);
      },
      start: async () => {
        startCalls += 1;
        throw new Error("sensitive upstream detail");
      }
    })
  );
  await controller.mount();
  await controller.startPairing();

  assert.equal(controller.getState().errorMessage?.includes("sensitive upstream detail"), false);
  await controller.refreshStatus();

  assert.equal(startCalls, 1);
  assert.equal(statusCalls, 2);
  assert.equal(controller.getState().errorMessage, null);
});
