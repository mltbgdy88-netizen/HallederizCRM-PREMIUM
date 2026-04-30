import type { FastifyCorsOptions } from "@fastify/cors";

const DEFAULT_DEVELOPMENT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3010",
  "http://127.0.0.1:3010"
];

export const API_CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
export const API_CORS_HEADERS = ["content-type", "authorization", "x-session-token", "x-tenant-id"];

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
    credentials: false,
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
