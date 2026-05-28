import type { FastifyInstance } from "fastify";
import { defaultPlatformSettings } from "@hallederiz/types";
import { mockRoles } from "../mock-data";
import { withGuards } from "../../shared/auth-guards";
import { readPermissions, requireReadAccess } from "../../shared/read-guards";

export async function registerRoleRoutes(server: FastifyInstance) {
  server.get("/roles", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.roles), async () => {
    return {
      items: mockRoles,
      total: mockRoles.length
    };
  }));

  server.get("/roles/presets", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.roles), async () => {
    return {
      items: defaultPlatformSettings.rolePresets,
      total: defaultPlatformSettings.rolePresets.length
    };
  }));
}
