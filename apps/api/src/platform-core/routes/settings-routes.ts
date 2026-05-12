import type { FastifyInstance } from "fastify";
import type { PlatformSettings } from "@hallederiz/types";
import { platformSettingsSchema } from "@hallederiz/types";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { getTenantSettingsState, setTenantSettingsState } from "../settings-state";
import { buildPilotReadiness } from "../pilot-readiness";
import { readPermissions, requireReadAccess } from "../../shared/read-guards";
import { enforcePolicyDecision, evaluateRoutePolicy } from "../../shared/policy-bridge";

export async function registerSettingsRoutes(server: FastifyInstance) {
  server.get("/settings", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.settings), async () => {
    return {
      schema: platformSettingsSchema,
      data: getTenantSettingsState()
    };
  }));

  server.patch<{ Body: Partial<PlatformSettings> }>("/settings", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["platform.settings.write", "settings.manage"])],
      async (context) => {
        const decision = evaluateRoutePolicy(context, { actionKey: "platform.settings.update" });
        const policyResult = enforcePolicyDecision(decision, context);
        if (policyResult.handled) {
          return reply.status(policyResult.statusCode).send(policyResult.body);
        }

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
          },
          whatsappIntentRules: patch.whatsappIntentRules ?? tenantSettingsState.whatsappIntentRules
        };
        setTenantSettingsState(nextState);
        return {
          item: nextState
        };
      }
    );
  });

  server.get("/settings/pilot-template", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.settings), async (context) => ({
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
    }));
  });

  server.get("/settings/pilot-readiness", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.settings), async (context) => {
      const settings = getTenantSettingsState();
      return {
        item: buildPilotReadiness(context.tenantId, settings)
      };
    })
  );
}
