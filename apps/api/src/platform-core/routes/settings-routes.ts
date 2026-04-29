import type { FastifyInstance } from "fastify";
import type { PlatformSettings } from "@hallederiz/types";
import { platformSettingsSchema } from "@hallederiz/types";
import { buildRequestContext } from "../../shared/request-context";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { getTenantSettingsState, setTenantSettingsState } from "../settings-state";

export async function registerSettingsRoutes(server: FastifyInstance) {
  server.get("/settings", async () => {
    return {
      schema: platformSettingsSchema,
      data: getTenantSettingsState()
    };
  });

  server.patch<{ Body: Partial<PlatformSettings> }>("/settings", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["platform.settings.write", "settings.manage"])],
      async () => {
        const tenantSettingsState = getTenantSettingsState();
        const patch = request.body ?? {};
        const nextState: PlatformSettings = {
          ...tenantSettingsState,
          ...patch,
          company: {
            ...tenantSettingsState.company,
            ...(patch.company ?? {})
          },
          exchangeRate: {
            ...tenantSettingsState.exchangeRate,
            ...(patch.exchangeRate ?? {})
          },
          priceSlots: {
            ...tenantSettingsState.priceSlots,
            ...(patch.priceSlots ?? {})
          },
          categorySlots: {
            ...tenantSettingsState.categorySlots,
            ...(patch.categorySlots ?? {})
          },
          pilotSetup: {
            ...tenantSettingsState.pilotSetup,
            ...(patch.pilotSetup ?? {})
          }
        };
        setTenantSettingsState(nextState);
        return {
          item: nextState
        };
      }
    );
  });

  server.get("/settings/pilot-template", async (request) => {
    const context = buildRequestContext(request);
    return {
      tenantId: context.tenantId,
      template: {
        key: "pilot-tenant-template",
        importPlaceholdersKey: "pilot-import-placeholders",
        companyFields: [
          "sirket_adi",
          "ticari_unvan",
          "vergi_dairesi",
          "vergi_numarasi",
          "mersis_no",
          "telefon",
          "eposta",
          "adres",
          "iban"
        ],
        importModules: ["cariler", "urunler", "stoklar", "fiyatlar", "depolar"],
        integrationChecks: ["erp", "fabrika", "whatsapp", "ai", "local_output"]
      }
    };
  });
}
