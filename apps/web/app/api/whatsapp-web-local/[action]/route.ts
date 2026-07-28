import { dispatchWhatsAppWebLocalControlRequest } from "../../../../src/server/whatsapp-web-local-control-proxy";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ action: string }>;
};

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const { action } = await context.params;
  return dispatchWhatsAppWebLocalControlRequest(request, action);
}
