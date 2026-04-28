import type { Permission, Role, Tenant, TenantModuleCode, User } from "@hallederiz/types";

function dedupePermissions(permissions: Permission[]): Permission[] {
  const map = new Map<string, Permission>();

  for (const permission of permissions) {
    map.set(permission.key, permission);
  }

  return Array.from(map.values());
}

export function getRolePermissions(roles: Role[]): Permission[] {
  return dedupePermissions(roles.flatMap((role) => role.permissions));
}

export function getEffectivePermissions(user: User, roles: Role[]): Permission[] {
  return dedupePermissions([...user.directPermissions, ...getRolePermissions(roles)]);
}

export function hasPermission(permissionKey: string, user: User, roles: Role[]): boolean {
  return getEffectivePermissions(user, roles).some((permission) => permission.key === permissionKey);
}

export function hasAnyPermission(permissionKeys: string[], user: User, roles: Role[]): boolean {
  const effectivePermissions = new Set(getEffectivePermissions(user, roles).map((permission) => permission.key));
  return permissionKeys.some((permissionKey) => effectivePermissions.has(permissionKey));
}

export function hasRole(roleCode: string, roles: Role[]): boolean {
  return roles.some((role) => role.code === roleCode);
}

export function hasTenantModule(moduleCode: TenantModuleCode, tenant: Tenant): boolean {
  return tenant.modules.some((module) => module.code === moduleCode && module.enabled);
}
