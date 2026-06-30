import type { SessionModel } from "@hallederiz/types";

const OPERATOR_READ_KEYS = ["platform.operator.read", "platform.operator.write", "*"] as const;
const OPERATOR_WRITE_KEYS = ["platform.operator.write", "*"] as const;

function collectPermissionKeys(session: SessionModel | null): Set<string> {
  const keys = new Set<string>();
  if (!session) return keys;
  for (const permission of session.permissions ?? []) {
    keys.add(permission.key);
  }
  for (const role of session.roles ?? []) {
    for (const permission of role.permissions ?? []) {
      keys.add(permission.key);
    }
  }
  return keys;
}

export function hasOperatorConsoleAccess(session: SessionModel | null): boolean {
  const keys = collectPermissionKeys(session);
  return OPERATOR_READ_KEYS.some((key) => keys.has(key));
}

export function hasOperatorConsoleWrite(session: SessionModel | null): boolean {
  const keys = collectPermissionKeys(session);
  return OPERATOR_WRITE_KEYS.some((key) => keys.has(key));
}
