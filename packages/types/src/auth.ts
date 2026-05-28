import type { PermissionId, RoleId, TenantId, UserId } from "./identifiers";
import type { TenantModuleCode } from "./tenant";

export type UserStatus = "active" | "invited" | "disabled";

export interface Permission {
  id: PermissionId;
  key: string;
  name: string;
  description?: string;
  moduleCode: TenantModuleCode;
}

export interface Role {
  id: RoleId;
  tenantId: TenantId;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface User {
  id: UserId;
  tenantId: TenantId;
  email: string;
  fullName: string;
  status: UserStatus;
  title?: string;
  avatarUrl?: string;
  directPermissions: Permission[];
  lastLoginAt?: string;
}

export interface UserRole {
  userId: UserId;
  roleId: RoleId;
  tenantId: TenantId;
  assignedAt: string;
  assignedBy: UserId;
}
