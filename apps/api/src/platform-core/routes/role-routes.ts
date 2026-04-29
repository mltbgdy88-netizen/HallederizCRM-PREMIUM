import type { FastifyInstance } from "fastify";
import { defaultPlatformSettings } from "@hallederiz/types";
import { mockRoles } from "../mock-data";

export async function registerRoleRoutes(server: FastifyInstance) {
  server.get("/roles", async () => {
    return {
      items: mockRoles,
      total: mockRoles.length
    };
  });

  server.get("/roles/presets", async () => {
    return {
      items: defaultPlatformSettings.rolePresets,
      total: defaultPlatformSettings.rolePresets.length
    };
  });
}
