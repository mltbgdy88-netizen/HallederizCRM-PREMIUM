import {
  createWhatsAppWebLocalMethodNotAllowedResponse,
  dispatchWhatsAppWebLocalControlRequest
} from "../../../../src/server/whatsapp-web-local-control-proxy";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ action: string }>;
};

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const { action } = await context.params;
  return dispatchWhatsAppWebLocalControlRequest(request, action);
}

function methodNotAllowed(method: string): Response {
  return createWhatsAppWebLocalMethodNotAllowedResponse("POST", method);
}

export function GET(): Response {
  return methodNotAllowed("GET");
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
