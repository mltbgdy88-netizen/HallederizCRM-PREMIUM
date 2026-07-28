import { timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { WhatsAppWebLocalPairingSnapshot } from "@hallederiz/types";
import {
  StubLocalWhatsAppWebPairingEngine,
  resolveWhatsAppWebLocalFeatureFlag,
  type LocalWhatsAppWebPairingEngine,
  type LocalWhatsAppWebSafeEventSink
} from "../whatsapp-web-local";

type RuntimeEnvironment = Record<string, string | undefined>;

export const WHATSAPP_WEB_LOCAL_CONTROL_HOST = "127.0.0.1" as const;

export const WHATSAPP_WEB_LOCAL_CONTROL_PATHS = {
  status: "/whatsapp-web-local/status",
  start: "/whatsapp-web-local/start",
  refresh: "/whatsapp-web-local/refresh",
  disconnect: "/whatsapp-web-local/disconnect",
  logout: "/whatsapp-web-local/logout"
} as const;

type ControlAction = keyof typeof WHATSAPP_WEB_LOCAL_CONTROL_PATHS;
type MutationAction = Exclude<ControlAction, "status">;

export type LocalWhatsAppWebControlResponse = Pick<
  WhatsAppWebLocalPairingSnapshot,
  "state" | "reasonCode" | "generation" | "providerCallExecuted" | "checkedAt"
>;

export interface LocalWhatsAppWebControlPlaneOptions {
  controlToken: string;
  port?: number;
  runtimeEnvironment?: RuntimeEnvironment;
  now?: () => string;
  eventSink?: LocalWhatsAppWebSafeEventSink;
}

export interface StartedLocalWhatsAppWebControlPlane {
  server: Server;
  host: typeof WHATSAPP_WEB_LOCAL_CONTROL_HOST;
  port: number;
  close(): Promise<void>;
}

const MUTATION_ACTIONS = new Set<ControlAction>(["start", "refresh", "disconnect", "logout"]);
const CONTROL_ACTIONS = Object.entries(WHATSAPP_WEB_LOCAL_CONTROL_PATHS) as Array<
  [ControlAction, (typeof WHATSAPP_WEB_LOCAL_CONTROL_PATHS)[ControlAction]]
>;

function toControlResponse(snapshot: WhatsAppWebLocalPairingSnapshot): LocalWhatsAppWebControlResponse {
  return {
    state: snapshot.state,
    reasonCode: snapshot.reasonCode,
    generation: snapshot.generation,
    providerCallExecuted: false,
    checkedAt: snapshot.checkedAt
  };
}

function deniedResponse(reasonCode: string, checkedAt: string): LocalWhatsAppWebControlResponse {
  return {
    state: "disabled",
    reasonCode,
    generation: 0,
    providerCallExecuted: false,
    checkedAt
  };
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: LocalWhatsAppWebControlResponse
): void {
  response.statusCode = statusCode;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(payload));
}

export function isLoopbackRemoteAddress(address: string | undefined): boolean {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

export function isLoopbackHostHeader(hostHeader: string | undefined): boolean {
  if (!hostHeader) {
    return false;
  }

  const normalized = hostHeader.trim().toLowerCase();
  if (normalized.startsWith("[")) {
    const closingBracket = normalized.indexOf("]");
    return closingBracket > 0 && normalized.slice(1, closingBracket) === "::1";
  }

  const hostname = normalized.split(":", 1)[0];
  return hostname === "127.0.0.1" || hostname === "localhost";
}

function isAuthorized(authorization: string | undefined, controlToken: string): boolean {
  const match = /^Bearer (.+)$/i.exec(authorization ?? "");
  if (!match?.[1]) {
    return false;
  }

  const received = Buffer.from(match[1], "utf8");
  const expected = Buffer.from(controlToken, "utf8");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function resolveAction(pathname: string): ControlAction | undefined {
  return CONTROL_ACTIONS.find(([, path]) => path === pathname)?.[0];
}

function isExpectedMethod(action: ControlAction, method: string | undefined): boolean {
  return action === "status" ? method === "GET" : method === "POST";
}

async function executeMutation(
  action: MutationAction,
  engine: LocalWhatsAppWebPairingEngine
): Promise<WhatsAppWebLocalPairingSnapshot> {
  switch (action) {
    case "start":
      return engine.start();
    case "refresh":
      return engine.refresh();
    case "disconnect":
      return engine.disconnect();
    case "logout":
      return engine.logout();
  }
}

function createRequestHandler(options: {
  controlToken: string;
  runtimeEnvironment: RuntimeEnvironment;
  now: () => string;
  engine: LocalWhatsAppWebPairingEngine;
}) {
  const feature = resolveWhatsAppWebLocalFeatureFlag(options.runtimeEnvironment);

  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    if (!isLoopbackRemoteAddress(request.socket.remoteAddress)) {
      writeJson(
        response,
        403,
        deniedResponse("whatsapp_web_local_control_non_loopback_denied", options.now())
      );
      return;
    }

    if (!isLoopbackHostHeader(request.headers.host)) {
      writeJson(
        response,
        403,
        deniedResponse("whatsapp_web_local_control_host_denied", options.now())
      );
      return;
    }

    if (!isAuthorized(request.headers.authorization, options.controlToken)) {
      response.setHeader("WWW-Authenticate", "Bearer");
      writeJson(
        response,
        401,
        deniedResponse("whatsapp_web_local_control_unauthorized", options.now())
      );
      return;
    }

    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const action = resolveAction(pathname);
    if (!action) {
      writeJson(response, 404, deniedResponse("whatsapp_web_local_control_not_found", options.now()));
      return;
    }

    if (!isExpectedMethod(action, request.method)) {
      writeJson(
        response,
        405,
        deniedResponse("whatsapp_web_local_control_method_not_allowed", options.now())
      );
      return;
    }

    if (action === "status") {
      writeJson(response, 200, toControlResponse(await options.engine.getStatus()));
      return;
    }

    if (!feature.enabled) {
      const statusCode =
        feature.reasonCode === "whatsapp_web_local_production_hard_deny" ? 403 : 200;
      writeJson(response, statusCode, toControlResponse(await options.engine.getStatus()));
      return;
    }

    const snapshot = await executeMutation(action, options.engine);
    writeJson(response, 200, toControlResponse(snapshot));
  };
}

function validateOptions(options: LocalWhatsAppWebControlPlaneOptions): void {
  if (!options.controlToken.trim()) {
    throw new Error("Local WhatsApp Web control token is required.");
  }

  const port = options.port ?? 4319;
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("Local WhatsApp Web control port must be an integer between 0 and 65535.");
  }
}

export async function startLocalWhatsAppWebControlPlane(
  options: LocalWhatsAppWebControlPlaneOptions
): Promise<StartedLocalWhatsAppWebControlPlane> {
  validateOptions(options);

  const runtimeEnvironment = options.runtimeEnvironment ?? process.env;
  const now = options.now ?? (() => new Date().toISOString());
  const feature = resolveWhatsAppWebLocalFeatureFlag(runtimeEnvironment);
  const engine = new StubLocalWhatsAppWebPairingEngine({
    feature,
    eventSink: options.eventSink,
    now,
    runtimeEnvironment
  });
  const requestHandler = createRequestHandler({
    controlToken: options.controlToken,
    runtimeEnvironment,
    now,
    engine
  });
  const server = createServer((request, response) => {
    void requestHandler(request, response).catch(() => {
      if (!response.headersSent) {
        writeJson(
          response,
          500,
          deniedResponse("whatsapp_web_local_control_internal_error", now())
        );
      } else {
        response.end();
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    const handleError = (error: Error) => {
      server.off("listening", handleListening);
      reject(error);
    };
    const handleListening = () => {
      server.off("error", handleError);
      resolve();
    };
    server.once("error", handleError);
    server.once("listening", handleListening);
    server.listen(options.port ?? 4319, WHATSAPP_WEB_LOCAL_CONTROL_HOST);
  });

  const address = server.address() as AddressInfo;
  return {
    server,
    host: WHATSAPP_WEB_LOCAL_CONTROL_HOST,
    port: address.port,
    close: async () => {
      if (!server.listening) {
        return;
      }
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  };
}
