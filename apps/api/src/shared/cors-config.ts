import type { FastifyCorsOptions } from "@fastify/cors";

/** Next.js `next dev` picks the first free port in a range when 3000 is busy; allow 3000–3005 for localhost and loopback. */
const DEFAULT_DEVELOPMENT_ORIGINS: string[] = (() => {
  const hosts = ["http://localhost", "http://127.0.0.1"] as const;
  const out: string[] = [];
  for (const host of hosts) {
    for (let port = 3000; port <= 3005; port += 1) {
      out.push(`${host}:${port}`);
    }
  }
  // Legacy local tooling / explicit tests (e.g. cors-config.test.ts uses 3010)
  out.push("http://localhost:3010", "http://127.0.0.1:3010");
  return out;
})();

export const API_CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
export const API_CORS_HEADERS = [
  "content-type",
  "authorization",
  "x-session-token",
  "x-tenant-id",
  "x-user-id",
  "idempotency-key"
];

export function parseApiCorsOrigins(input: string | undefined, nodeEnv = process.env.NODE_ENV): string[] {
  const explicitOrigins = (input ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const fallbackOrigins = nodeEnv === "production" ? [] : DEFAULT_DEVELOPMENT_ORIGINS;

  return Array.from(new Set(explicitOrigins.length > 0 ? explicitOrigins : fallbackOrigins)).filter(
    (origin) => !(nodeEnv === "production" && origin === "*")
  );
}

export function buildApiCorsOptions(env: NodeJS.ProcessEnv = process.env): FastifyCorsOptions {
  const nodeEnv = env.NODE_ENV ?? "development";
  const configuredOrigins = parseApiCorsOrigins(env.API_CORS_ORIGINS, nodeEnv);
  const webUrl = env.WEB_URL?.trim();
  const allowedOrigins = Array.from(new Set(webUrl ? [...configuredOrigins, webUrl] : configuredOrigins)).filter(
    (origin) => !(nodeEnv === "production" && origin === "*")
  );

  return {
    credentials: true,
    methods: API_CORS_METHODS,
    allowedHeaders: API_CORS_HEADERS,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      callback(null, allowedOrigins.includes(origin));
    }
  };
}
