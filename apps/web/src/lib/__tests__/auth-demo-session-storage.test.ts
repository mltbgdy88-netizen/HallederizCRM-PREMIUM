import assert from "node:assert/strict";
import test from "node:test";
import { createMockSession } from "@hallederiz/domain";
import { adminRole, defaultTenant, defaultUser } from "../platform-mocks";
import {
  clearPersistedDemoAuth,
  readPersistedDemoAuth,
  writePersistedDemoAuth
} from "../auth-demo-session-storage";

const storage = new Map<string, string>();

test("demo session storage round-trip when demo auth env enabled", () => {
  process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH = "true";

  (globalThis as { window?: { sessionStorage: Storage } }).window = {
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      length: storage.size,
      clear: () => storage.clear(),
      key: (index: number) => Array.from(storage.keys())[index] ?? null
    } as Storage
  };

  storage.clear();

  const session = createMockSession({ tenant: defaultTenant, user: defaultUser, roles: [adminRole] });
  writePersistedDemoAuth(session, "demo_access");
  const restored = readPersistedDemoAuth();
  assert.ok(restored);
  assert.equal(restored?.session.id, session.id);
  assert.equal(restored?.accessToken, "demo_access");

  clearPersistedDemoAuth();
  assert.equal(readPersistedDemoAuth(), null);
});
