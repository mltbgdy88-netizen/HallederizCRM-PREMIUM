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
      "access-control-request-headers": "content-type,authorization,x-session-token,x-tenant-id"
    }
  });

  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:3010");
  assert.match(String(response.headers["access-control-allow-methods"]), /POST/);
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
