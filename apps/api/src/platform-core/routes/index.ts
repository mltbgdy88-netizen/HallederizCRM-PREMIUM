import type { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "./auth-routes";
import { registerRoleRoutes } from "./role-routes";
import { registerSettingsRoutes } from "./settings-routes";
import { registerUserRoutes } from "./user-routes";

export async function registerPlatformCoreRoutes(server: FastifyInstance) {
  await registerAuthRoutes(server);
  await registerUserRoutes(server);
  await registerRoleRoutes(server);
  await registerSettingsRoutes(server);
}
