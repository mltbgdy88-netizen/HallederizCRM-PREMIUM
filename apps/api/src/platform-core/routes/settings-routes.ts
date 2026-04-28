import type { FastifyInstance } from "fastify";
import { platformSettingsSchema } from "@hallederiz/types";
import { mockSettings } from "../mock-data";

export async function registerSettingsRoutes(server: FastifyInstance) {
  server.get("/settings", async () => {
    // TODO: Replace with persisted tenant settings and schema validation layer.
    return {
      schema: platformSettingsSchema,
      data: mockSettings
    };
  });
}
