import type { FastifyInstance } from "fastify";
import type { User } from "@hallederiz/types";
import { mockTenant, mockUsers } from "../mock-data";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { readPermissions, requireReadAccess } from "../../shared/read-guards";
import { enforcePolicyDecision, evaluateRoutePolicy } from "../../shared/policy-bridge";

export async function registerUserRoutes(server: FastifyInstance) {
  let usersState: User[] = [...mockUsers];

  server.get("/users", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.users), async () => {
    return {
      items: usersState,
      total: usersState.length
    };
  }));

  server.post<{ Body: Partial<User> & { roleCode?: string } }>("/users", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["platform.users.write", "users.manage"])],
      async (context) => {
        const decision = evaluateRoutePolicy(context, { actionKey: "platform.users.create" });
        const policyResult = enforcePolicyDecision(decision);
        if (policyResult.handled) {
          return reply.status(policyResult.statusCode).send(policyResult.body);
        }

        const body = request.body ?? {};
        if (!body.email || !body.fullName) {
          return reply.status(400).send({ message: "email ve fullName alanlari zorunludur." });
        }

        const user: User = {
          id: `user_${usersState.length + 1}`,
          tenantId: mockTenant.id,
          email: body.email,
          fullName: body.fullName,
          status: body.status ?? "active",
          title: body.title ?? "Pilot Kullanici",
          directPermissions: body.directPermissions ?? [],
          lastLoginAt: body.lastLoginAt
        };
        usersState = [user, ...usersState];
        return reply.status(201).send({ item: user });
      }
    );
  });
}
