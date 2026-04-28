import type { FastifyInstance } from "fastify";
import type { LoginInput } from "@hallederiz/types";
import { createLoginPayload } from "../mock-data";

export async function registerAuthRoutes(server: FastifyInstance) {
  server.post<{ Body: Partial<LoginInput> }>("/auth/login", async (request, reply) => {
    const body = request.body;

    if (!body.email || !body.password || !body.tenantSlug) {
      return reply.status(400).send({
        message: "tenantSlug, email ve password alanlari zorunludur."
      });
    }

    const loginPayload = createLoginPayload({
      tenantSlug: body.tenantSlug,
      email: body.email,
      password: body.password
    });

    return reply.send(loginPayload);
  });

  server.get("/auth/me", async () => {
    // TODO: Validate access token and resolve authenticated principal.
    return createLoginPayload({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "hidden"
    }).session;
  });
}
