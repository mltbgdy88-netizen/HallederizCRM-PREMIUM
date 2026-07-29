import assert from "node:assert/strict";
import test from "node:test";
import { StrictMode, type ReactNode } from "react";
import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer
} from "react-test-renderer";
import {
  PathnameContext,
  SearchParamsContext
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import type {
  WhatsAppWebLocalControlClient,
  WhatsAppWebLocalControlSnapshot
} from "../services/whatsapp-web-local-control";
import {
  WhatsAppWebLocalControlError
} from "../services/whatsapp-web-local-control";
import {
  useWhatsAppWebLocalControl,
  type UseWhatsAppWebLocalControlResult
} from "../hooks/use-whatsapp-web-local-control";
import { resolveWhatsAppWebLocalView } from "../utils/whatsapp-web-local-view";
import { WhatsAppWebLocalConnectionCard } from "../components/WhatsAppWebLocalConnectionCard";

Object.defineProperty(globalThis, "self", {
  value: globalThis,
  configurable: true
});

function snapshot(
  state: WhatsAppWebLocalControlSnapshot["state"],
  reasonCode = "whatsapp_web_local_state_updated",
  generation = 1
): WhatsAppWebLocalControlSnapshot {
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

type ActionCalls = {
  status: number;
  start: number;
  refreshPairing: number;
  disconnect: number;
  logout: number;
};

function emptyCalls(): ActionCalls {
  return {
    status: 0,
    start: 0,
    refreshPairing: 0,
    disconnect: 0,
    logout: 0
  };
}

function controlFor(
  state: WhatsAppWebLocalControlSnapshot["state"],
  calls: ActionCalls = emptyCalls(),
  overrides: Partial<UseWhatsAppWebLocalControlResult> = {},
  reasonCode = "whatsapp_web_local_state_updated"
): UseWhatsAppWebLocalControlResult {
  const currentSnapshot = snapshot(state, reasonCode);
  return {
    snapshot: currentSnapshot,
    view: resolveWhatsAppWebLocalView(currentSnapshot),
    loading: false,
    mutating: false,
    activeAction: null,
    sessionError: false,
    errorMessage: null,
    refresh: async () => {
      calls.status += 1;
    },
    start: async () => {
      calls.start += 1;
    },
    refreshPairing: async () => {
      calls.refreshPairing += 1;
    },
    disconnect: async () => {
      calls.disconnect += 1;
    },
    logout: async () => {
      calls.logout += 1;
    },
    ...overrides
  };
}

function createClient(
  overrides: Partial<WhatsAppWebLocalControlClient> = {}
): WhatsAppWebLocalControlClient {
  return {
    getStatus: async () => snapshot("logged_out", "whatsapp_web_local_enabled_non_production", 0),
    start: async () => snapshot("starting", "whatsapp_web_local_pairing_stub_started"),
    refreshPairing: async () =>
      snapshot("starting", "whatsapp_web_local_pairing_stub_refreshed"),
    disconnect: async () =>
      snapshot("logged_out", "whatsapp_web_local_disconnected"),
    logout: async () => snapshot("logged_out", "whatsapp_web_local_logged_out"),
    ...overrides
  };
}

function renderCard(
  control: UseWhatsAppWebLocalControlResult,
  layout: "settings" | "reference" = "settings",
  withNavigationContext = false
): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  const card = <WhatsAppWebLocalConnectionCard control={control} layout={layout} />;
  const element = withNavigationContext ? (
    <PathnameContext.Provider value="/ayarlar">
      <SearchParamsContext.Provider value={new URLSearchParams()}>
        {card}
      </SearchParamsContext.Provider>
    </PathnameContext.Provider>
  ) : (
    card
  );
  act(() => {
    renderer = create(element);
  });
  return renderer;
}

function textContent(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(textContent).join("");
  }
  if (value && typeof value === "object" && "children" in value) {
    return textContent((value as { children?: unknown }).children);
  }
  return "";
}

function renderedText(renderer: ReactTestRenderer): string {
  return textContent(renderer.toJSON());
}

function buttonByLabel(
  renderer: ReactTestRenderer,
  label: string
): ReactTestInstance {
  const button = renderer.root
    .findAllByType("button")
    .find((candidate) => textContent(candidate.props.children).includes(label));
  assert.ok(button, `button not found: ${label}`);
  return button;
}

function buttonLabels(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType("button")
    .map((button) => textContent(button.props.children));
}

function HookHarness({
  client,
  onRender,
  renderCardControl = false
}: {
  client: WhatsAppWebLocalControlClient;
  onRender(control: UseWhatsAppWebLocalControlResult): void;
  renderCardControl?: boolean;
}) {
  const control = useWhatsAppWebLocalControl(client);
  onRender(control);
  return renderCardControl ? (
    <WhatsAppWebLocalConnectionCard control={control} layout="settings" />
  ) : (
    <span>{control.snapshot?.state ?? "pending"}</span>
  );
}

test("StrictMode runs the real hook lifecycle with one status request and no mutation", async () => {
  const calls = emptyCalls();
  const renderedAfterStatusStarted: UseWhatsAppWebLocalControlResult[] = [];
  const client = createClient({
    getStatus: async () => {
      calls.status += 1;
      return snapshot(
        "logged_out",
        "whatsapp_web_local_enabled_non_production",
        0
      );
    },
    start: async () => {
      calls.start += 1;
      return snapshot("starting");
    },
    refreshPairing: async () => {
      calls.refreshPairing += 1;
      return snapshot("starting");
    },
    disconnect: async () => {
      calls.disconnect += 1;
      return snapshot("logged_out");
    },
    logout: async () => {
      calls.logout += 1;
      return snapshot("logged_out");
    }
  });
  let renderer!: ReactTestRenderer;

  await act(async () => {
    renderer = create(
      <StrictMode>
        <HookHarness
          client={client}
          onRender={(control) => {
            if (calls.status > 0) {
              renderedAfterStatusStarted.push(control);
            }
          }}
        />
      </StrictMode>
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  assert.deepEqual(calls, {
    status: 1,
    start: 0,
    refreshPairing: 0,
    disconnect: 0,
    logout: 0
  });
  assert.equal(renderedText(renderer), "logged_out");
  assert.ok(renderedAfterStatusStarted.length >= 1);
  assert.equal(
    new Set(renderedAfterStatusStarted.map((control) => control.refresh)).size,
    1
  );
  act(() => renderer.unmount());
});

test("real hook effect cleanup aborts the request and ignores post-unmount completion", async () => {
  const pendingStatus = deferred<WhatsAppWebLocalControlSnapshot>();
  let capturedSignal: AbortSignal | undefined;
  let lastRenderedState = "not-rendered";
  let renderer!: ReactTestRenderer;
  const warnings: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };

  try {
    await act(async () => {
      renderer = create(
        <StrictMode>
          <HookHarness
            client={createClient({
              getStatus: (signal) => {
                capturedSignal = signal;
                return pendingStatus.promise;
              }
            })}
            onRender={(control) => {
              lastRenderedState = control.snapshot?.state ?? "pending";
            }}
          />
        </StrictMode>
      );
      await Promise.resolve();
    });

    assert.equal(capturedSignal?.aborted, false);
    act(() => renderer.unmount());
    assert.equal(capturedSignal?.aborted, true);
    pendingStatus.resolve(snapshot("connected", "whatsapp_web_local_state_updated", 9));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  } finally {
    console.error = originalError;
  }

  assert.equal(lastRenderedState, "pending");
  assert.equal(
    warnings.some((warning) =>
      /state update on an unmounted component|not wrapped in act/i.test(warning)
    ),
    false
  );
});

test("the real local card renders beta and safety boundaries in both layouts", () => {
  for (const layout of ["settings", "reference"] as const) {
    const renderer = renderCard(controlFor("logged_out"), layout);
    const text = renderedText(renderer);

    for (const expected of [
      "WhatsApp Web Yerel Beta",
      "Beta / yerel",
      "production yolu değil",
      "Production go-live sağlamaz.",
      "GATE-P0-WA durumunu değiştirmez.",
      "Resmi production yolu Meta WhatsApp Cloud API",
      "Mesaj gönderimi kapalıdır."
    ]) {
      assert.ok(text.includes(expected), `${layout}: ${expected}`);
    }
    assert.equal(renderer.root.findAllByType("img").length, 0);
    assert.equal(renderer.root.findAllByType("canvas").length, 0);
    assert.equal(renderer.root.findAllByType("svg").length, 0);
    assert.equal(text.includes("data:image"), false);
    assert.equal(text.includes("reasonCode"), false);
    assert.equal(text.includes("generation"), false);
    assert.equal(text.includes("providerCallExecuted"), false);
    assert.ok(
      renderer.root.findAll(
        (node) =>
          typeof node.props.className === "string" &&
          node.props.className.startsWith(
            layout === "settings" ? "hz-settings-wa-conn" : "setf-wa-conn"
          )
      ).length > 0
    );
    act(() => renderer.unmount());
  }
});

test("real card action rendering follows every local state and production hard-deny", () => {
  const cases: Array<{
    state: WhatsAppWebLocalControlSnapshot["state"];
    present: string[];
    absent: string[];
  }> = [
    {
      state: "disabled",
      present: ["Durumu yenile"],
      absent: [
        "Yerel betayı başlat",
        "Eşleştirmeyi yenile",
        "Bağlantıyı kes",
        "Yerel oturumdan çık"
      ]
    },
    {
      state: "logged_out",
      present: ["Durumu yenile", "Yerel betayı başlat"],
      absent: ["Eşleştirmeyi yenile", "Bağlantıyı kes", "Yerel oturumdan çık"]
    },
    {
      state: "starting",
      present: ["Durumu yenile"],
      absent: [
        "Yerel betayı başlat",
        "Eşleştirmeyi yenile",
        "Bağlantıyı kes",
        "Yerel oturumdan çık"
      ]
    },
    {
      state: "connecting",
      present: ["Durumu yenile"],
      absent: [
        "Yerel betayı başlat",
        "Eşleştirmeyi yenile",
        "Bağlantıyı kes",
        "Yerel oturumdan çık"
      ]
    },
    {
      state: "qr_ready",
      present: ["Durumu yenile", "Eşleştirmeyi yenile", "Yerel oturumdan çık"],
      absent: ["Yerel betayı başlat", "Bağlantıyı kes"]
    },
    {
      state: "connected",
      present: ["Durumu yenile", "Bağlantıyı kes", "Yerel oturumdan çık"],
      absent: ["Yerel betayı başlat", "Eşleştirmeyi yenile"]
    },
    {
      state: "reconnecting",
      present: ["Durumu yenile", "Bağlantıyı kes"],
      absent: ["Yerel betayı başlat", "Eşleştirmeyi yenile", "Yerel oturumdan çık"]
    },
    {
      state: "expired",
      present: ["Durumu yenile", "Yerel betayı başlat", "Yerel oturumdan çık"],
      absent: ["Eşleştirmeyi yenile", "Bağlantıyı kes"]
    },
    {
      state: "error",
      present: ["Durumu yenile", "Yerel betayı başlat", "Yerel oturumdan çık"],
      absent: ["Eşleştirmeyi yenile", "Bağlantıyı kes"]
    }
  ];

  for (const current of cases) {
    const renderer = renderCard(controlFor(current.state));
    const labels = buttonLabels(renderer);
    for (const label of current.present) {
      assert.ok(labels.includes(label), `${current.state}: ${label}`);
    }
    for (const label of current.absent) {
      assert.equal(labels.includes(label), false, `${current.state}: ${label}`);
    }
    if (current.state === "qr_ready") {
      assert.match(renderedText(renderer), /Gerçek QR sağlayıcısı henüz bağlı değil/);
      assert.equal(renderer.root.findAllByType("img").length, 0);
      assert.equal(renderer.root.findAllByType("canvas").length, 0);
      assert.equal(renderer.root.findAllByType("svg").length, 0);
    }
    if (current.state === "connected") {
      assert.match(renderedText(renderer), /production onayı değildir/);
      assert.doesNotMatch(renderedText(renderer), /production-ready/i);
    }
    act(() => renderer.unmount());
  }

  const productionRenderer = renderCard(
    controlFor(
      "disabled",
      emptyCalls(),
      {},
      "whatsapp_web_local_production_hard_deny"
    )
  );
  const productionLabels = buttonLabels(productionRenderer);
  assert.deepEqual(productionLabels, ["Durumu yenile"]);
  assert.match(renderedText(productionRenderer), /Production ortamında yerel bağlantı kapalı/);
  assert.match(renderedText(productionRenderer), /Meta WhatsApp Cloud API/);
  act(() => productionRenderer.unmount());
});

test("each real button click calls only its single mapped callback", () => {
  const cases: Array<{
    state: WhatsAppWebLocalControlSnapshot["state"];
    label: string;
    expected: keyof ActionCalls;
  }> = [
    { state: "qr_ready", label: "Durumu yenile", expected: "status" },
    {
      state: "qr_ready",
      label: "Eşleştirmeyi yenile",
      expected: "refreshPairing"
    },
    { state: "logged_out", label: "Yerel betayı başlat", expected: "start" },
    { state: "connected", label: "Bağlantıyı kes", expected: "disconnect" },
    { state: "connected", label: "Yerel oturumdan çık", expected: "logout" }
  ];

  for (const current of cases) {
    const calls = emptyCalls();
    const renderer = renderCard(controlFor(current.state, calls));

    act(() => {
      buttonByLabel(renderer, current.label).props.onClick();
    });

    assert.equal(calls[current.expected], 1);
    assert.equal(
      Object.values(calls).reduce((total, count) => total + count, 0),
      1
    );
    act(() => renderer.unmount());
  }
});

test("a disabled rendered action refuses clicks before invoking a mutation callback", () => {
  const calls = emptyCalls();
  const renderer = renderCard(
    controlFor("logged_out", calls, {
      mutating: true,
      activeAction: "start"
    })
  );
  const startButton = buttonByLabel(renderer, "Başlatılıyor");

  assert.equal(startButton.props.disabled, true);
  act(() => {
    startButton.props.onClick();
  });
  assert.equal(calls.start, 0);
  act(() => renderer.unmount());
});

test("rapid real card clicks use the controller guard and create one mutation", async () => {
  const pendingStart = deferred<WhatsAppWebLocalControlSnapshot>();
  let startCalls = 0;
  let renderer!: ReactTestRenderer;

  await act(async () => {
    renderer = create(
      <HookHarness
        client={createClient({
          start: () => {
            startCalls += 1;
            return pendingStart.promise;
          }
        })}
        onRender={() => undefined}
        renderCardControl
      />
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  const startButton = buttonByLabel(renderer, "Yerel betayı başlat");
  act(() => {
    startButton.props.onClick();
    startButton.props.onClick();
  });
  assert.equal(startCalls, 1);

  pendingStart.resolve(
    snapshot("starting", "whatsapp_web_local_pairing_stub_started")
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => renderer.unmount());
});

test("session recovery is rendered inline and retries only status GET", async () => {
  let statusCalls = 0;
  let mutationCalls = 0;
  let renderer!: ReactTestRenderer;
  const client = createClient({
    getStatus: async () => {
      statusCalls += 1;
      if (statusCalls === 1) {
        throw new WhatsAppWebLocalControlError(
          401,
          "session_required",
          "Oturum doğrulanamadı."
        );
      }
      return snapshot(
        "logged_out",
        "whatsapp_web_local_enabled_non_production",
        0
      );
    },
    start: async () => {
      mutationCalls += 1;
      return snapshot("starting");
    }
  });

  await act(async () => {
    renderer = create(
      <PathnameContext.Provider value="/ayarlar">
        <SearchParamsContext.Provider value={new URLSearchParams()}>
          <HookHarness
            client={client}
            onRender={() => undefined}
            renderCardControl
          />
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  assert.match(renderedText(renderer), /Oturum doğrulanamadı/);
  assert.ok(
    renderer.root.findAll(
      (node) =>
        typeof node.props.className === "string" &&
        node.props.className.includes("hz-settings-session-recovery--inline")
    ).length > 0
  );
  await act(async () => {
    buttonByLabel(renderer, "Tekrar dene").props.onClick();
    await Promise.resolve();
    await Promise.resolve();
  });

  assert.equal(statusCalls, 2);
  assert.equal(mutationCalls, 0);
  assert.equal(renderedText(renderer).includes("Oturum doğrulanamadı"), false);
  act(() => renderer.unmount());
});

test("permission errors and production hard-deny keep distinct real render branches", () => {
  const permissionRenderer = renderCard(
    controlFor("logged_out", emptyCalls(), {
      sessionError: false,
      errorMessage: "Bu işlem için gerekli yetkiniz bulunmuyor."
    }),
    "settings",
    true
  );
  assert.match(renderedText(permissionRenderer), /gerekli yetkiniz bulunmuyor/);
  assert.equal(
    permissionRenderer.root.findAll(
      (node) =>
        typeof node.props.className === "string" &&
        node.props.className.includes("hz-settings-session-recovery--inline")
    ).length,
    0
  );
  act(() => permissionRenderer.unmount());

  const productionRenderer = renderCard(
    controlFor(
      "disabled",
      emptyCalls(),
      {},
      "whatsapp_web_local_production_hard_deny"
    )
  );
  assert.match(renderedText(productionRenderer), /Production ortamında yerel bağlantı kapalı/);
  assert.equal(
    productionRenderer.root.findAll(
      (node) => node.props.role === "alert"
    ).length,
    0
  );
  act(() => productionRenderer.unmount());
});
