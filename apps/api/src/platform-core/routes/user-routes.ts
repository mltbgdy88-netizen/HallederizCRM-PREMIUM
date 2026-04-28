import type { FastifyInstance } from "fastify";
import { mockUsers } from "../mock-data";

export async function registerUserRoutes(server: FastifyInstance) {
  server.get("/users", async () => {
    // TODO: Replace mock list with tenant-aware user repository.
    return {
      items: mockUsers,
      total: mockUsers.length
    };
  });
}
