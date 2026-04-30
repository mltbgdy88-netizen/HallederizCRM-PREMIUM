import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerAuthRoutes } from "../platform-core/routes/auth-routes";
import type { DatabaseAuthResult } from "../shared/database-auth";
import { buildRequestContext } from "../shared/request-context";
import { createSession } from "../shared/session-store";
import { withDemoAuth, withEnv } from "./test-env";

async function buildAuthServer(authenticateDatabaseLogin?: (input: { tenantSlug: string; email: string; password: string }) => Promise<DatabaseAuthResult>) {
  const server = Fastify();
  await registerAuthRoutes(server, authenticateDatabaseLogin ? { authenticateDatabaseLogin } : {});
  return server;
}

test("demo auth disabled: /auth/login does not create demo session", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    async () => {
      const server = await buildAuthServer();
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "admin@hallederiz.com",
          password: "demo"
        }
      });

      assert.equal(response.statusCode, 503);
      assert.equal(response.json().message, "Demo auth disabled. Configure real auth provider.");
      await server.close();
    }
  );
});

test("demo auth enabled in development: /auth/login creates session", async () => {
  await withDemoAuth(async () => {
    const server = await buildAuthServer();
    const response = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        tenantSlug: "hallederiz",
        email: "admin@hallederiz.com",
        password: "demo"
      }
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.json().accessToken);
    await server.close();
  });
});

test("createSession throws when demo auth is disabled", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    () => {
      assert.throws(() =>
        createSession({
          tenantSlug: "hallederiz",
          email: "admin@hallederiz.com",
          password: "demo"
        })
      );
    }
  );
});

test("mock access token is ignored when demo auth is disabled", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    () => {
      const context = buildRequestContext({
        headers: {
          authorization: "Bearer mock_access_hallederiz:admin@hallederiz.com"
        }
      } as never);

      assert.equal(context.isAuthenticated, false);
      assert.equal(context.authIssue, "expired_session");
      assert.deepEqual(context.permissions, []);
    }
  );
});

test("mock access token is accepted only in explicit demo auth mode", async () => {
  await withDemoAuth(() => {
    const context = buildRequestContext({
      headers: {
        authorization: "Bearer mock_access_hallederiz:admin@hallederiz.com"
      }
    } as never);

    assert.equal(context.isAuthenticated, true);
    assert.equal(context.tenantId, "tenant_1");
    assert.ok((context.permissions ?? []).length > 0);
  });
});

test("header permission fallback is disabled in postgres mode", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "true",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres"
    },
    () => {
      const context = buildRequestContext({
        headers: {
          "x-tenant-id": "tenant_1",
          "x-user-id": "user_admin",
          "x-user-role": "admin",
          "x-user-permissions": "orders.write,approvals.execute"
        }
      } as never);

      assert.equal(context.persistenceMode, "postgres");
      assert.equal(context.isAuthenticated, false);
      assert.equal(context.userId, "anonymous");
      assert.deepEqual(context.roles, []);
      assert.deepEqual(context.permissions, []);
    }
  );
});

test("tenant mismatch guard behavior is preserved", async () => {
  await withDemoAuth(() => {
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const context = buildRequestContext({
      headers: {
        "x-session-token": login.accessToken,
        "x-tenant-id": "tenant_other"
      }
    } as never);

    assert.equal(context.tenantMismatch, true);
    assert.equal(context.authIssue, "tenant_mismatch");
  });
});

test("production ignores local pilot auth even if enabled", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      LOCAL_PILOT_AUTH_ENABLED: "true",
      LOCAL_PILOT_AUTH_EMAIL: "pilot@hallederiz.local",
      LOCAL_PILOT_AUTH_PASSWORD: "local-pilot-password"
    },
    async () => {
      const server = await buildAuthServer();
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "pilot@hallederiz.local",
          password: "local-pilot-password"
        }
      });
      assert.equal(response.statusCode, 503);
      await server.close();
    }
  );
});

test("postgres mode keeps 503 when local pilot auth is disabled", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      DEMO_AUTH_ENABLED: "true",
      LOCAL_PILOT_AUTH_ENABLED: "false"
    },
    async () => {
      const server = await buildAuthServer();
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "pilot@hallederiz.local",
          password: "local-pilot-password"
        }
      });
      assert.equal(response.statusCode, 503);
      await server.close();
    }
  );
});

test("local pilot auth allows login in development postgres mode with explicit flag", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "true",
      LOCAL_PILOT_AUTH_EMAIL: "pilot@hallederiz.local",
      LOCAL_PILOT_AUTH_PASSWORD: "local-pilot-password",
      LOCAL_PILOT_AUTH_ROLE: "admin"
    },
    async () => {
      const server = await buildAuthServer();
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "pilot@hallederiz.local",
          password: "local-pilot-password"
        }
      });
      assert.equal(response.statusCode, 200);
      assert.ok(response.json().accessToken);
      await server.close();
    }
  );
});

test("local pilot auth rejects wrong password", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "true",
      LOCAL_PILOT_AUTH_EMAIL: "pilot@hallederiz.local",
      LOCAL_PILOT_AUTH_PASSWORD: "local-pilot-password"
    },
    async () => {
      const server = await buildAuthServer();
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "pilot@hallederiz.local",
          password: "wrong-password"
        }
      });
      assert.equal(response.statusCode, 401);
      await server.close();
    }
  );
});

test("local pilot auth does not enable mock access token or header fallback in postgres mode", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      LOCAL_PILOT_AUTH_ENABLED: "true",
      LOCAL_PILOT_AUTH_EMAIL: "pilot@hallederiz.local",
      LOCAL_PILOT_AUTH_PASSWORD: "local-pilot-password"
    },
    () => {
      const mockTokenContext = buildRequestContext({
        headers: {
          authorization: "Bearer mock_access_hallederiz:pilot@hallederiz.local"
        }
      } as never);
      assert.equal(mockTokenContext.isAuthenticated, false);
      assert.deepEqual(mockTokenContext.permissions, []);

      const headerFallbackContext = buildRequestContext({
        headers: {
          "x-tenant-id": "tenant_1",
          "x-user-id": "user_admin",
          "x-user-role": "admin",
          "x-user-permissions": "orders.write,approvals.execute"
        }
      } as never);
      assert.equal(headerFallbackContext.isAuthenticated, false);
      assert.deepEqual(headerFallbackContext.permissions, []);
    }
  );
});

test("postgres database auth: valid user credentials return login session", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "false"
    },
    async () => {
      const server = await buildAuthServer(async () => ({
        status: "success",
        tenantId: "tenant_1",
        tenantSlug: "hallederiz",
        tenantName: "Hallederiz Demo Tenant",
        userId: "user_db_admin",
        email: "admin@hallederiz.com",
        fullName: "DB Admin",
        role: "platform_admin"
      }));

      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "admin@hallederiz.com",
          password: "correct-password"
        }
      });

      assert.equal(response.statusCode, 200);
      assert.ok(response.json().accessToken);
      await server.close();
    }
  );
});

test("postgres database auth: wrong password returns 401", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "false"
    },
    async () => {
      const server = await buildAuthServer(async () => ({ status: "invalid_credentials" }));
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "admin@hallederiz.com",
          password: "wrong-password"
        }
      });

      assert.equal(response.statusCode, 401);
      await server.close();
    }
  );
});

test("postgres database auth: inactive user returns 403", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "false"
    },
    async () => {
      const server = await buildAuthServer(async () => ({ status: "inactive_user" }));
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          tenantSlug: "hallederiz",
          email: "inactive@hallederiz.com",
          password: "correct-password"
        }
      });

      assert.equal(response.statusCode, 403);
      await server.close();
    }
  );
});
