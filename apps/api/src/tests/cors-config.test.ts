import assert from "node:assert/strict";
import test from "node:test";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { buildApiCorsOptions, parseApiCorsOrigins } from "../shared/cors-config";

async function buildCorsServer(env: NodeJS.ProcessEnv) {
  const server = Fastify();
  await server.register(cors, buildApiCorsOptions(env));
  server.post("/auth/login", async () => ({ ok: true }));
  return server;
}

test("API CORS allows configured local web origin", async () => {
  const server = await buildCorsServer({
    NODE_ENV: "development",
    API_CORS_ORIGINS: "http://localhost:3010"
  });

  const response = await server.inject({
    method: "OPTIONS",
    url: "/auth/login",
    headers: {
      origin: "http://localhost:3010",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type,authorization,x-session-token,x-tenant-id,x-user-id"
    }
  });

  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:3010");
  assert.match(String(response.headers["access-control-allow-methods"]), /POST/);
  await server.close();
});

test("API CORS allows default development origin on 127.0.0.1", async () => {
  const server = await buildCorsServer({
    NODE_ENV: "development"
  });

  const response = await server.inject({
    method: "OPTIONS",
    url: "/auth/login",
    headers: {
      origin: "http://127.0.0.1:3002",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type,authorization,x-session-token,x-tenant-id"
    }
  });

  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["access-control-allow-origin"], "http://127.0.0.1:3002");
  await server.close();
});

test("API CORS preflight OPTIONS /auth/login allows localhost:3003 (Next dynamic port)", async () => {
  const server = await buildCorsServer({ NODE_ENV: "development" });
  const response = await server.inject({
    method: "OPTIONS",
    url: "/auth/login",
    headers: {
      origin: "http://localhost:3003",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type,authorization,x-session-token,x-tenant-id,x-user-id"
    }
  });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:3003");
  await server.close();
});

test("API CORS preflight allows localhost:3005 and 127.0.0.1:3003", async () => {
  const server = await buildCorsServer({ NODE_ENV: "development" });
  for (const origin of ["http://localhost:3005", "http://127.0.0.1:3003"] as const) {
    const response = await server.inject({
      method: "OPTIONS",
      url: "/auth/login",
      headers: {
        origin,
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type"
      }
    });
    assert.equal(response.statusCode, 204, origin);
    assert.equal(response.headers["access-control-allow-origin"], origin, origin);
  }
  await server.close();
});

test("API CORS production default has no implicit localhost dev ports", async () => {
  const server = await buildCorsServer({ NODE_ENV: "production" });
  const response = await server.inject({
    method: "OPTIONS",
    url: "/auth/login",
    headers: {
      origin: "http://localhost:3003",
      "access-control-request-method": "POST"
    }
  });
  assert.equal(response.headers["access-control-allow-origin"], undefined);
  await server.close();
});

test("API CORS does not allow an unconfigured browser origin", async () => {
  const server = await buildCorsServer({
    NODE_ENV: "development",
    API_CORS_ORIGINS: "http://localhost:3010"
  });

  const response = await server.inject({
    method: "OPTIONS",
    url: "/auth/login",
    headers: {
      origin: "http://evil.local",
      "access-control-request-method": "POST"
    }
  });

  assert.equal(response.headers["access-control-allow-origin"], undefined);
  await server.close();
});

test("API CORS ignores wildcard origins in production", () => {
  assert.deepEqual(parseApiCorsOrigins("*", "production"), []);
});
