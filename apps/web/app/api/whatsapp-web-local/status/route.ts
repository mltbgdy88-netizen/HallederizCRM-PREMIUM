import {
  createWhatsAppWebLocalMethodNotAllowedResponse,
  dispatchWhatsAppWebLocalControlRequest
} from "../../../../src/server/whatsapp-web-local-control-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return dispatchWhatsAppWebLocalControlRequest(request, "status");
}

function methodNotAllowed(method: string): Response {
  return createWhatsAppWebLocalMethodNotAllowedResponse("GET", method);
}

export function POST(): Response {
  return methodNotAllowed("POST");
}

export function PUT(): Response {
  return methodNotAllowed("PUT");
}

export function PATCH(): Response {
  return methodNotAllowed("PATCH");
}

export function DELETE(): Response {
  return methodNotAllowed("DELETE");
}

export function OPTIONS(): Response {
  return methodNotAllowed("OPTIONS");
}

export function HEAD(): Response {
  return methodNotAllowed("HEAD");
}
