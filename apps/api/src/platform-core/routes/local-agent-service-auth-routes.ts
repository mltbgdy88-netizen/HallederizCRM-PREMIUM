import type { FastifyInstance, FastifyReply } from "fastify";
import { listOperatorTenants } from "../../operator/tenant-directory";
import {
  LOCAL_AGENT_SERVICE_CAPABILITIES,
  LocalAgentServiceRateLimiter,
  LocalAgentServiceTokenStore,
  buildLocalAgentServiceError,
  hasDisallowedLocalAgentServiceHeaders,
  localAgentServiceRateLimiter,
  localAgentServiceTokenStore,
  normalizeLoopbackRemoteAddress,
  resolveLocalAgentServiceAuthConfig,
  validateLocalAgentBootstrapCredentials
} from "../../shared/local-agent-service-auth";

interface LocalAgentServiceTokenRequest {
  clientId?: unknown;
  clientSecret?: unknown;
}
export interface LocalAgentServiceAuthRouteDeps {
  tokenStore?: LocalAgentServiceTokenStore;
  rateLimiter?: LocalAgentServiceRateLimiter;
  validateTenant?: (tenantId: string) => Promise<boolean>;
}

function applySensitiveResponseHeaders(reply: FastifyReply): void {
  reply.header("cache-control", "no-store");
  reply.header("pragma", "no-cache");
  reply.removeHeader("set-cookie");
}

function sendError(reply: FastifyReply, statusCode: number, reason: Parameters<typeof buildLocalAgentServiceError>[1]) {
  applySensitiveResponseHeaders(reply);
  return reply.status(statusCode).send(buildLocalAgentServiceError(statusCode, reason));
}

function parseCredentials(body: unknown, query: unknown): { clientId: string; clientSecret: string } | null {
  if (query && typeof query === "object" && Object.keys(query).length > 0) return null;
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const keys = Object.keys(body);
  if (keys.length !== 2 || !keys.includes("clientId") || !keys.includes("clientSecret")) return null;
  const input = body as LocalAgentServiceTokenRequest;
  if (typeof input.clientId !== "string" || typeof input.clientSecret !== "string") return null;
  return { clientId: input.clientId, clientSecret: input.clientSecret };
}

async function defaultValidateTenant(tenantId: string): Promise<boolean> {
  const tenants = await listOperatorTenants();
  return tenants.some((tenant) => tenant.id === tenantId && tenant.status.toLowerCase() === "active");
}

export async function registerLocalAgentServiceAuthRoutes(
  server: FastifyInstance,
  deps: LocalAgentServiceAuthRouteDeps = {}
) {
  const tokenStore = deps.tokenStore ?? localAgentServiceTokenStore;
  const rateLimiter = deps.rateLimiter ?? localAgentServiceRateLimiter;
  const validateTenant = deps.validateTenant ?? defaultValidateTenant;

  server.route<{ Body: LocalAgentServiceTokenRequest }>({
    method: "POST",
    url: "/auth/service/local-agent/token",
    bodyLimit: 4_096,
    logLevel: "silent",
    handler: async (request, reply) => {
      applySensitiveResponseHeaders(reply);

      const configResolution = resolveLocalAgentServiceAuthConfig();
      if (!configResolution.available) {
        return sendError(
          reply,
          configResolution.production ? 403 : 503,
          "local_agent_service_auth_unavailable"
        );
      }

      const loopback = normalizeLoopbackRemoteAddress(request.raw.socket.remoteAddress);
      if (!loopback || hasDisallowedLocalAgentServiceHeaders(request)) {
        return sendError(reply, 403, "local_agent_service_origin_denied");
      }

      const credentials = parseCredentials(request.body, request.query);
      const credentialsValid = credentials
        ? validateLocalAgentBootstrapCredentials(configResolution.config, credentials)
        : false;
      if (!credentialsValid) {
        if (!rateLimiter.consume(loopback)) {
          return sendError(reply, 429, "local_agent_service_rate_limited");
        }
        return sendError(reply, 401, "local_agent_service_credentials_invalid");
      }

      let tenantIsActive = false;
      try {
        tenantIsActive = await validateTenant(configResolution.config.tenantId);
      } catch {
        tenantIsActive = false;
      }
      if (!tenantIsActive) {
        return sendError(reply, 503, "local_agent_service_auth_unavailable");
      }

      const token = tokenStore.issue({
        tenantId: configResolution.config.tenantId,
        clientId: configResolution.config.clientId,
        capabilities: LOCAL_AGENT_SERVICE_CAPABILITIES,
        ttlSeconds: configResolution.config.tokenTtlSeconds
      });

      applySensitiveResponseHeaders(reply);
      return reply.send({
        accessToken: token.accessToken,
        tokenType: "Bearer",
        expiresIn: token.expiresIn
      });
    }
  });
}
