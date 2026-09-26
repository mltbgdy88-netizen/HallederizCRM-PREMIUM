import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { FastifyRequest } from "fastify";
import { getAuthMode } from "./auth-mode";

export const LOCAL_AGENT_SERVICE_TOKEN_PREFIX = "la_svc_";
export const LOCAL_AGENT_SERVICE_CAPABILITIES = [
  "local_agent.jobs.read",
  "local_agent.jobs.transition",
  "local_agent.status.write"
] as const;

export type LocalAgentServiceCapability = (typeof LOCAL_AGENT_SERVICE_CAPABILITIES)[number];

export type LocalAgentServiceErrorReason =
  | "local_agent_service_credentials_invalid"
  | "local_agent_service_token_invalid"
  | "local_agent_service_token_expired"
  | "local_agent_service_token_unknown"
  | "local_agent_service_tenant_denied"
  | "local_agent_service_capability_denied"
  | "local_agent_service_origin_denied"
  | "local_agent_service_rate_limited"
  | "local_agent_service_auth_unavailable";

interface LocalAgentServiceTokenRecord {
  tokenDigest: string;
  tenantId: string;
  capabilities: readonly LocalAgentServiceCapability[];
  expiresAt: number;
  clientId: string;
}

export interface LocalAgentServicePrincipal {
  tenantId: string;
  capabilities: readonly LocalAgentServiceCapability[];
  expiresAt: number;
  clientId: string;
}

export interface LocalAgentServiceRuntimeConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  tokenTtlSeconds: number;
}

export type LocalAgentServiceConfigResolution =
  | { available: true; config: LocalAgentServiceRuntimeConfig }
  | { available: false; production: boolean };

export type LocalAgentServiceRequestResolution =
  | { kind: "user_session" }
  | { kind: "service"; principal: LocalAgentServicePrincipal }
  | { kind: "denied"; statusCode: number; reason: LocalAgentServiceErrorReason };

export interface LocalAgentServiceErrorPayload {
  error: "unauthorized" | "forbidden" | "service_unavailable" | "too_many_requests";
  reason: LocalAgentServiceErrorReason;
}

const TOKEN_RANDOM_BYTES = 32;
const TOKEN_BODY_LENGTH = 43;
const TOKEN_PATTERN = new RegExp(`^${LOCAL_AGENT_SERVICE_TOKEN_PREFIX}[A-Za-z0-9_-]{${TOKEN_BODY_LENGTH}}$`);
const TENANT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const CLIENT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const DEFAULT_TOKEN_TTL_SECONDS = 180;
const MIN_TOKEN_TTL_SECONDS = 120;
const MAX_TOKEN_TTL_SECONDS = 300;

function digestText(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function digestToken(value: string): string {
  return digestText(value).toString("base64url");
}

function constantTimeTextEqual(left: string, right: string): boolean {
  return timingSafeEqual(digestText(left), digestText(right));
}

function parseTokenTtl(value: string | undefined): number | null {
  if (value === undefined) return DEFAULT_TOKEN_TTL_SECONDS;
  if (!/^[0-9]+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < MIN_TOKEN_TTL_SECONDS || parsed > MAX_TOKEN_TTL_SECONDS) {
    return null;
  }
  return parsed;
}

function isValidConfiguredSecret(value: string | undefined): value is string {
  if (!value || !value.trim()) return false;
  return Buffer.byteLength(value, "utf8") >= 32 && Buffer.byteLength(value, "utf8") <= 4_096;
}

export function resolveLocalAgentServiceAuthConfig(
  env: NodeJS.ProcessEnv = process.env
): LocalAgentServiceConfigResolution {
  const production = getAuthMode().isProduction;
  if (production || env.LOCAL_AGENT_SERVICE_AUTH_ENABLED !== "true") {
    return { available: false, production };
  }

  const clientId = env.LOCAL_AGENT_SERVICE_CLIENT_ID;
  const clientSecret = env.LOCAL_AGENT_SERVICE_CLIENT_SECRET;
  const tenantId = env.LOCAL_AGENT_TENANT_ID;
  const tokenTtlSeconds = parseTokenTtl(env.LOCAL_AGENT_SERVICE_TOKEN_TTL_SECONDS);

  if (
    !clientId ||
    clientId !== clientId.trim() ||
    !CLIENT_ID_PATTERN.test(clientId) ||
    !isValidConfiguredSecret(clientSecret) ||
    !tenantId ||
    tenantId !== tenantId.trim() ||
    !TENANT_ID_PATTERN.test(tenantId) ||
    tokenTtlSeconds === null
  ) {
    return { available: false, production: false };
  }

  const controlToken = env.LOCAL_AGENT_CONTROL_TOKEN;
  if (controlToken && constantTimeTextEqual(clientSecret, controlToken)) {
    return { available: false, production: false };
  }

  return {
    available: true,
    config: {
      clientId,
      clientSecret,
      tenantId,
      tokenTtlSeconds
    }
  };
}

export function validateLocalAgentBootstrapCredentials(
  config: LocalAgentServiceRuntimeConfig,
  input: { clientId: string; clientSecret: string }
): boolean {
  const clientIdMatches = constantTimeTextEqual(input.clientId, config.clientId);
  const clientSecretMatches = constantTimeTextEqual(input.clientSecret, config.clientSecret);
  return clientIdMatches && clientSecretMatches;
}

export class LocalAgentServiceTokenStore {
  private readonly records = new Map<string, LocalAgentServiceTokenRecord>();

  constructor(
    private readonly now: () => number = () => performance.now(),
    private readonly generateRandomBytes: (size: number) => Buffer = randomBytes
  ) {}

  issue(input: {
    tenantId: string;
    clientId: string;
    capabilities: readonly LocalAgentServiceCapability[];
    ttlSeconds: number;
  }): { accessToken: string; expiresIn: number } {
    this.purgeExpired();
    const accessToken = `${LOCAL_AGENT_SERVICE_TOKEN_PREFIX}${this.generateRandomBytes(TOKEN_RANDOM_BYTES).toString("base64url")}`;
    const tokenDigest = digestToken(accessToken);
    const record: LocalAgentServiceTokenRecord = {
      tokenDigest,
      tenantId: input.tenantId,
      capabilities: [...new Set(input.capabilities)],
      expiresAt: this.now() + input.ttlSeconds * 1_000,
      clientId: input.clientId
    };
    this.records.set(tokenDigest, record);
    return { accessToken, expiresIn: input.ttlSeconds };
  }

  authenticate(input: {
    accessToken: string;
    expectedTenantId: string;
    expectedClientId: string;
    requiredCapability: LocalAgentServiceCapability;
  }):
    | { ok: true; principal: LocalAgentServicePrincipal }
    | { ok: false; reason: LocalAgentServiceErrorReason } {
    if (!TOKEN_PATTERN.test(input.accessToken)) {
      return { ok: false, reason: "local_agent_service_token_invalid" };
    }

    const now = this.now();
    const tokenDigest = digestToken(input.accessToken);
    const record = this.records.get(tokenDigest);
    if (!record) {
      this.purgeExpired(now);
      return { ok: false, reason: "local_agent_service_token_unknown" };
    }
    if (record.expiresAt <= now) {
      this.records.delete(tokenDigest);
      this.purgeExpired(now);
      return { ok: false, reason: "local_agent_service_token_expired" };
    }
    this.purgeExpired(now, tokenDigest);

    if (record.tenantId !== input.expectedTenantId || record.clientId !== input.expectedClientId) {
      return { ok: false, reason: "local_agent_service_tenant_denied" };
    }
    if (!record.capabilities.includes(input.requiredCapability)) {
      return { ok: false, reason: "local_agent_service_capability_denied" };
    }

    return {
      ok: true,
      principal: {
        tenantId: record.tenantId,
        capabilities: [...record.capabilities],
        expiresAt: record.expiresAt,
        clientId: record.clientId
      }
    };
  }

  snapshot(): readonly LocalAgentServiceTokenRecord[] {
    this.purgeExpired();
    return [...this.records.values()].map((record) => ({
      ...record,
      capabilities: [...record.capabilities]
    }));
  }

  clear(): void {
    this.records.clear();
  }

  private purgeExpired(now = this.now(), exceptDigest?: string): void {
    for (const [digest, record] of this.records) {
      if (digest !== exceptDigest && record.expiresAt <= now) {
        this.records.delete(digest);
      }
    }
  }
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export class LocalAgentServiceRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(
    private readonly options: {
      maxAttempts?: number;
      windowMs?: number;
      maxBuckets?: number;
      now?: () => number;
    } = {}
  ) {}

  consume(key: string): boolean {
    const now = (this.options.now ?? (() => performance.now()))();
    this.prune(now);
    const current = this.buckets.get(key);
    if (!current) {
      const maxBuckets = this.options.maxBuckets ?? 64;
      if (this.buckets.size >= maxBuckets) {
        const oldestKey = this.buckets.keys().next().value as string | undefined;
        if (oldestKey) this.buckets.delete(oldestKey);
      }
      this.buckets.set(key, { count: 1, resetAt: now + (this.options.windowMs ?? 60_000) });
      return true;
    }

    current.count += 1;
    return current.count <= (this.options.maxAttempts ?? 8);
  }

  clear(): void {
    this.buckets.clear();
  }

  private prune(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

export const localAgentServiceTokenStore = new LocalAgentServiceTokenStore();
export const localAgentServiceRateLimiter = new LocalAgentServiceRateLimiter();

export function normalizeLoopbackRemoteAddress(value: string | undefined): "127.0.0.1" | "::1" | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "127.0.0.1" || normalized === "::ffff:127.0.0.1") return "127.0.0.1";
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return "::1";
  return null;
}

export function hasDisallowedLocalAgentServiceHeaders(request: FastifyRequest): boolean {
  return ["forwarded", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto", "origin"].some(
    (name) => request.headers[name] !== undefined
  );
}

export function hasTenantOverride(request: FastifyRequest): boolean {
  if (request.headers["x-tenant-id"] !== undefined) return true;
  const candidates = [request.query, request.body];
  return candidates.some((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
    return Object.prototype.hasOwnProperty.call(candidate, "tenantId") || Object.prototype.hasOwnProperty.call(candidate, "tenant_id");
  });
}

export function extractLocalAgentServiceBearer(authorization: string | undefined):
  | { candidate: false }
  | { candidate: true; accessToken?: string } {
  const raw = authorization?.trim();
  if (!raw) return { candidate: false };
  const match = /^Bearer\s+(.+)$/i.exec(raw);
  if (match?.[1]?.startsWith(LOCAL_AGENT_SERVICE_TOKEN_PREFIX)) {
    return { candidate: true, accessToken: match[1] };
  }
  const credential = /^\S+\s+(.+)$/.exec(raw)?.[1];
  if (credential?.startsWith(LOCAL_AGENT_SERVICE_TOKEN_PREFIX)) {
    return { candidate: true };
  }
  if (raw.startsWith(LOCAL_AGENT_SERVICE_TOKEN_PREFIX)) {
    return { candidate: true };
  }
  return { candidate: false };
}

export function resolveLocalAgentServiceRequest(
  request: FastifyRequest,
  requiredCapability: LocalAgentServiceCapability,
  tokenStore: LocalAgentServiceTokenStore = localAgentServiceTokenStore
): LocalAgentServiceRequestResolution {
  const authorization = typeof request.headers.authorization === "string" ? request.headers.authorization : undefined;
  const bearer = extractLocalAgentServiceBearer(authorization);
  if (!bearer.candidate) return { kind: "user_session" };
  if (!bearer.accessToken) {
    return { kind: "denied", statusCode: 401, reason: "local_agent_service_token_invalid" };
  }
  if (hasTenantOverride(request)) {
    return { kind: "denied", statusCode: 403, reason: "local_agent_service_tenant_denied" };
  }

  const configResolution = resolveLocalAgentServiceAuthConfig();
  if (!configResolution.available) {
    return {
      kind: "denied",
      statusCode: configResolution.production ? 403 : 503,
      reason: "local_agent_service_auth_unavailable"
    };
  }

  const result = tokenStore.authenticate({
    accessToken: bearer.accessToken,
    expectedTenantId: configResolution.config.tenantId,
    expectedClientId: configResolution.config.clientId,
    requiredCapability
  });
  if (!result.ok) {
    const statusCode = result.reason === "local_agent_service_capability_denied" || result.reason === "local_agent_service_tenant_denied" ? 403 : 401;
    return { kind: "denied", statusCode, reason: result.reason };
  }
  return { kind: "service", principal: result.principal };
}

export function buildLocalAgentServiceError(
  statusCode: number,
  reason: LocalAgentServiceErrorReason
): LocalAgentServiceErrorPayload {
  const error = statusCode === 401 ? "unauthorized" : statusCode === 403 ? "forbidden" : statusCode === 429 ? "too_many_requests" : "service_unavailable";
  return { error, reason };
}
