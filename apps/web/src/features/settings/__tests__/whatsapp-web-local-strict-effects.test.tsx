import assert from "node:assert/strict";
import test from "node:test";
import {
  StrictMode,
  act,
  useEffect,
  type ReactNode
} from "react";
import type { Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import {
  useWhatsAppWebLocalControl,
  type UseWhatsAppWebLocalControlResult
} from "../hooks/use-whatsapp-web-local-control";
import {
  WhatsAppWebLocalControlError,
  type WhatsAppWebLocalControlClient,
  type WhatsAppWebLocalControlSnapshot
} from "../services/whatsapp-web-local-control";

const DOM_GLOBAL_NAMES = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "Node",
  "MutationObserver",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "IS_REACT_ACT_ENVIRONMENT"
] as const;

type Deferred<T> = {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
};

type DomHarness = {
  container: HTMLElement;
  root: Root;
  unmount(): Promise<void>;
};

type ConsoleCapture = {
  messages: string[];
  restore(): void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function snapshot(
  state: WhatsAppWebLocalControlSnapshot["state"],
  generation: number,
  reasonCode = "whatsapp_web_local_state_updated"
): WhatsAppWebLocalControlSnapshot {
  return {
    state,
    reasonCode,
    generation,
    providerCallExecuted: false,
    checkedAt: "2026-07-29T10:00:00.000Z"
  };
}

function captureConsole(): ConsoleCapture {
  const messages: string[] = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args: unknown[]) => {
    messages.push(args.map(String).join(" "));
  };
  console.warn = (...args: unknown[]) => {
    messages.push(args.map(String).join(" "));
  };
  return {
    messages,
    restore() {
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
}

async function flushReact(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function withDomHarness(
  run: (harness: DomHarness) => Promise<void>
): Promise<void> {
  const globalObject = globalThis as unknown as Record<string, unknown>;
  const previousDescriptors = new Map<string, PropertyDescriptor | undefined>();
  for (const name of DOM_GLOBAL_NAMES) {
    previousDescriptors.set(
      name,
      Object.getOwnPropertyDescriptor(globalThis, name)
    );
  }

  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
    url: "http://localhost/"
  });
  const defineGlobal = (name: string, value: unknown) => {
    Object.defineProperty(globalObject, name, {
      configurable: true,
      writable: true,
      value
    });
  };

  let root: Root | undefined;
  let rootMounted = false;
  try {
    defineGlobal("window", dom.window);
    defineGlobal("document", dom.window.document);
    defineGlobal("navigator", dom.window.navigator);
    defineGlobal("HTMLElement", dom.window.HTMLElement);
    defineGlobal("Node", dom.window.Node);
    defineGlobal("MutationObserver", dom.window.MutationObserver);
    if (typeof dom.window.requestAnimationFrame === "function") {
      defineGlobal(
        "requestAnimationFrame",
        dom.window.requestAnimationFrame.bind(dom.window)
      );
    }
    if (typeof dom.window.cancelAnimationFrame === "function") {
      defineGlobal(
        "cancelAnimationFrame",
        dom.window.cancelAnimationFrame.bind(dom.window)
      );
    }
    defineGlobal("IS_REACT_ACT_ENVIRONMENT", true);

    const { createRoot } = await import("react-dom/client");
    const container = dom.window.document.createElement("div");
    dom.window.document.body.append(container);
    root = createRoot(container);
    rootMounted = true;
    const unmount = async () => {
      if (!rootMounted || !root) {
        return;
      }
      rootMounted = false;
      await act(async () => {
        root?.unmount();
        await Promise.resolve();
      });
    };
    await run({ container, root, unmount });
  } finally {
    try {
      if (rootMounted && root) {
        rootMounted = false;
        await act(async () => {
          root?.unmount();
          await Promise.resolve();
        });
      }
    } finally {
      try {
        dom.window.close();
      } finally {
        for (const name of [...DOM_GLOBAL_NAMES].reverse()) {
          const descriptor = previousDescriptors.get(name);
          if (descriptor) {
            Object.defineProperty(globalObject, name, descriptor);
          } else {
            delete globalObject[name];
          }
        }
      }
    }
  }
}

function HookHarness({
  client,
  onRender
}: {
  client: WhatsAppWebLocalControlClient;
  onRender(control: UseWhatsAppWebLocalControlResult): void;
}) {
  const control = useWhatsAppWebLocalControl(client);
  onRender(control);
  return (
    <span data-testid="local-state">
      {control.snapshot?.state ?? "pending"}
    </span>
  );
}

function StrictEffectsProbe({
  onSetup,
  onCleanup
}: {
  onSetup(): void;
  onCleanup(): void;
}) {
  useEffect(() => {
    onSetup();
    return onCleanup;
  }, [onCleanup, onSetup]);
  return null;
}

function StrictTree({
  children,
  onSetup,
  onCleanup
}: {
  children: ReactNode;
  onSetup(): void;
  onCleanup(): void;
}) {
  return (
    <StrictMode>
      <StrictEffectsProbe onSetup={onSetup} onCleanup={onCleanup} />
      {children}
    </StrictMode>
  );
}

function createTrackedClient(
  getStatus: (
    signal?: AbortSignal
  ) => Promise<WhatsAppWebLocalControlSnapshot>
): {
  client: WhatsAppWebLocalControlClient;
  mutationCalls(): number;
} {
  let mutations = 0;
  const unexpectedMutation = async (): Promise<WhatsAppWebLocalControlSnapshot> => {
    mutations += 1;
    return snapshot("error", 0);
  };
  return {
    client: {
      getStatus,
      start: unexpectedMutation,
      refreshPairing: unexpectedMutation,
      disconnect: unexpectedMutation,
      logout: unexpectedMutation
    },
    mutationCalls: () => mutations
  };
}

test("React DOM Strict Effects replays setup-cleanup-setup without duplicate status or mutation", async () => {
  assert.equal(process.env.NODE_ENV, "development");
  const consoleCapture = captureConsole();
  let setups = 0;
  let cleanups = 0;
  let statusCalls = 0;
  let renderCount = 0;
  let latestControl: UseWhatsAppWebLocalControlResult | undefined;
  let lastRenderedState = "not-rendered";
  const statusSignals: AbortSignal[] = [];
  const pendingUnmountStatus = deferred<WhatsAppWebLocalControlSnapshot>();
  const tracked = createTrackedClient(async (signal) => {
    statusCalls += 1;
    if (signal) {
      statusSignals.push(signal);
    }
    if (statusCalls === 1) {
      return snapshot(
        "logged_out",
        0,
        "whatsapp_web_local_enabled_non_production"
      );
    }
    return pendingUnmountStatus.promise;
  });

  try {
    await withDomHarness(async ({ container, root, unmount }) => {
      await act(async () => {
        root.render(
          <StrictTree
            onSetup={() => {
              setups += 1;
            }}
            onCleanup={() => {
              cleanups += 1;
            }}
          >
            <HookHarness
              client={tracked.client}
              onRender={(control) => {
                renderCount += 1;
                latestControl = control;
                lastRenderedState = control.snapshot?.state ?? "pending";
              }}
            />
          </StrictTree>
        );
        await Promise.resolve();
        await Promise.resolve();
      });

      assert.equal(setups, 2);
      assert.equal(cleanups, 1);
      assert.equal(statusCalls, 1);
      assert.equal(statusSignals.length, 1);
      assert.equal(tracked.mutationCalls(), 0);
      assert.equal(container.textContent, "logged_out");
      assert.equal(lastRenderedState, "logged_out");

      assert.ok(latestControl);
      await act(async () => {
        void latestControl?.refresh();
        await Promise.resolve();
      });
      assert.equal(statusCalls, 2);
      assert.equal(statusSignals[1]?.aborted, false);
      const renderCountBeforeUnmount = renderCount;

      await unmount();
      assert.equal(cleanups, 2);
      assert.equal(statusSignals[1]?.aborted, true);

      pendingUnmountStatus.resolve(snapshot("connected", 99));
      await flushReact();
      assert.equal(renderCount, renderCountBeforeUnmount);
      assert.equal(lastRenderedState, "logged_out");
      assert.equal(tracked.mutationCalls(), 0);
    });
  } finally {
    consoleCapture.restore();
  }

  assert.deepEqual(consoleCapture.messages, []);
});

for (const staleOutcome of ["success", "session_error"] as const) {
  test(`client replacement aborts clientA and ignores its stale ${staleOutcome}`, async () => {
    const consoleCapture = captureConsole();
    const pendingClientA = deferred<WhatsAppWebLocalControlSnapshot>();
    let clientACalls = 0;
    let clientBCalls = 0;
    let renderCount = 0;
    let lastRenderedState = "not-rendered";
    let clientASignal: AbortSignal | undefined;
    const clientA = createTrackedClient((signal) => {
      clientACalls += 1;
      clientASignal = signal;
      return pendingClientA.promise;
    });
    const clientB = createTrackedClient(async () => {
      clientBCalls += 1;
      return snapshot("connected", 2);
    });

    try {
      await withDomHarness(async ({ container, root }) => {
        await act(async () => {
          root.render(
            <StrictMode>
              <HookHarness
                client={clientA.client}
                onRender={(control) => {
                  renderCount += 1;
                  lastRenderedState = control.snapshot?.state ?? "pending";
                }}
              />
            </StrictMode>
          );
          await Promise.resolve();
          await Promise.resolve();
        });
        assert.equal(clientACalls, 1);
        assert.equal(clientASignal?.aborted, false);

        await act(async () => {
          root.render(
            <StrictMode>
              <HookHarness
                client={clientB.client}
                onRender={(control) => {
                  renderCount += 1;
                  lastRenderedState = control.snapshot?.state ?? "pending";
                }}
              />
            </StrictMode>
          );
          await Promise.resolve();
          await Promise.resolve();
        });

        assert.equal(clientASignal?.aborted, true);
        assert.equal(clientBCalls, 1);
        assert.equal(container.textContent, "connected");
        assert.equal(lastRenderedState, "connected");
        assert.equal(clientA.mutationCalls(), 0);
        assert.equal(clientB.mutationCalls(), 0);
        const renderCountBeforeStaleCompletion = renderCount;

        await act(async () => {
          if (staleOutcome === "success") {
            pendingClientA.resolve(snapshot("reconnecting", 900));
          } else {
            pendingClientA.reject(
              new WhatsAppWebLocalControlError(
                401,
                "session_required",
                "STALE_SESSION_ERROR_MUST_NOT_RENDER"
              )
            );
          }
          await Promise.resolve();
          await Promise.resolve();
        });

        assert.equal(renderCount, renderCountBeforeStaleCompletion);
        assert.equal(container.textContent, "connected");
        assert.equal(lastRenderedState, "connected");
      });
    } finally {
      consoleCapture.restore();
    }

    assert.deepEqual(consoleCapture.messages, []);
  });
}

test("unmount aborts the active request owned by the replacement client", async () => {
  const consoleCapture = captureConsole();
  const pendingClientA = deferred<WhatsAppWebLocalControlSnapshot>();
  const pendingClientB = deferred<WhatsAppWebLocalControlSnapshot>();
  let clientACalls = 0;
  let clientBCalls = 0;
  let clientASignal: AbortSignal | undefined;
  let clientBSignal: AbortSignal | undefined;
  let renderCount = 0;
  const clientA = createTrackedClient((signal) => {
    clientACalls += 1;
    clientASignal = signal;
    return pendingClientA.promise;
  });
  const clientB = createTrackedClient((signal) => {
    clientBCalls += 1;
    clientBSignal = signal;
    return pendingClientB.promise;
  });

  try {
    await withDomHarness(async ({ root, unmount }) => {
      await act(async () => {
        root.render(
          <StrictMode>
            <HookHarness
              client={clientA.client}
              onRender={() => {
                renderCount += 1;
              }}
            />
          </StrictMode>
        );
        await Promise.resolve();
        await Promise.resolve();
      });
      await act(async () => {
        root.render(
          <StrictMode>
            <HookHarness
              client={clientB.client}
              onRender={() => {
                renderCount += 1;
              }}
            />
          </StrictMode>
        );
        await Promise.resolve();
        await Promise.resolve();
      });

      assert.equal(clientACalls, 1);
      assert.equal(clientBCalls, 1);
      assert.equal(clientASignal?.aborted, true);
      assert.equal(clientBSignal?.aborted, false);
      assert.equal(clientA.mutationCalls(), 0);
      assert.equal(clientB.mutationCalls(), 0);
      const renderCountBeforeUnmount = renderCount;

      await unmount();
      assert.equal(clientBSignal?.aborted, true);
      pendingClientA.resolve(snapshot("connected", 10));
      pendingClientB.resolve(snapshot("connected", 11));
      await flushReact();
      assert.equal(renderCount, renderCountBeforeUnmount);
    });
  } finally {
    consoleCapture.restore();
  }

  assert.deepEqual(consoleCapture.messages, []);
});
