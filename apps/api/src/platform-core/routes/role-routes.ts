import type { FastifyInstance } from "fastify";
import { mockRoles } from "../mock-data";

export async function registerRoleRoutes(server: FastifyInstance) {
  server.get("/roles", async () => {
    // TODO: Replace mock role list with role-permission service.
    return {
      items: mockRoles,
      total: mockRoles.length
    };
  });
}
