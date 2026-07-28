import { dispatchWhatsAppWebLocalControlRequest } from "../../../../src/server/whatsapp-web-local-control-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return dispatchWhatsAppWebLocalControlRequest(request, "status");
}
