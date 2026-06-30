import type { RequestContext } from "./request-context";
import { assertAnyPermission, assertAuthenticated } from "./auth-guards";

const OPERATOR_READ_PERMISSIONS = ["platform.operator.read", "platform.operator.write"] as const;
const OPERATOR_WRITE_PERMISSIONS = ["platform.operator.write"] as const;

export function assertPlatformOperatorRead(context: RequestContext) {
  assertAuthenticated(context);
  assertAnyPermission(context, OPERATOR_READ_PERMISSIONS);
}

export function assertPlatformOperatorWrite(context: RequestContext) {
  assertAuthenticated(context);
  assertAnyPermission(context, OPERATOR_WRITE_PERMISSIONS);
}
