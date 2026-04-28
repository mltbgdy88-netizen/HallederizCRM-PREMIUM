import { createMockLoginResponse } from "@hallederiz/domain";
import {
  defaultPlatformSettings,
  type LoginInput,
  type Permission,
  type Role,
  type Tenant,
  type User
} from "@hallederiz/types";

export const mockPermissions: Permission[] = [
  {
    id: "perm_dashboard_view",
    key: "platform.dashboard.view",
    name: "Dashboard goruntuleme",
    moduleCode: "core"
  },
  {
    id: "perm_users_read",
    key: "platform.users.read",
    name: "Kullanicilari goruntuleme",
    moduleCode: "users"
  },
  {
    id: "perm_roles_read",
    key: "platform.roles.read",
    name: "Rolleri goruntuleme",
    moduleCode: "users"
  },
  {
    id: "perm_settings_read",
    key: "platform.settings.read",
    name: "Ayarlari goruntuleme",
    moduleCode: "settings"
  }
];

export const mockTenant: Tenant = {
  id: "tenant_1",
  slug: "hallederiz",
  name: "Hallederiz Demo Tenant",
  status: "active",
  locale: "tr-TR",
  timeZone: "Europe/Istanbul",
  modules: [
    { code: "core", enabled: true, configured: true, label: "Platform Core" },
    { code: "users", enabled: true, configured: true, label: "Kullanici ve Yetki" },
    { code: "settings", enabled: true, configured: true, label: "Ayarlar" },
    { code: "whatsapp", enabled: false, configured: false, label: "WhatsApp" },
    { code: "ai", enabled: false, configured: false, label: "AI" },
    { code: "erp", enabled: false, configured: false, label: "ERP" },
    { code: "reporting", enabled: false, configured: false, label: "Raporlama" }
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

export const mockRoles: Role[] = [
  {
    id: "role_admin",
    tenantId: mockTenant.id,
    code: "platform_admin",
    name: "Platform Yoneticisi",
    description: "Platform cekirdegi tam erisim",
    isSystem: true,
    permissions: mockPermissions
  },
  {
    id: "role_operator",
    tenantId: mockTenant.id,
    code: "platform_operator",
    name: "Platform Operatoru",
    description: "Limitli operasyon erisimi",
    isSystem: false,
    permissions: mockPermissions.filter((permission) => permission.key !== "platform.settings.read")
  }
];

export const mockUsers: User[] = [
  {
    id: "user_1",
    tenantId: mockTenant.id,
    email: "admin@hallederiz.com",
    fullName: "Platform Admin",
    status: "active",
    title: "Sistem Yoneticisi",
    directPermissions: [],
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "user_2",
    tenantId: mockTenant.id,
    email: "operator@hallederiz.com",
    fullName: "Demo Operator",
    status: "invited",
    title: "Operasyon Uzmani",
    directPermissions: [],
    lastLoginAt: undefined
  }
];

const mockAdminUser: User = mockUsers[0] ?? {
  id: "user_fallback",
  tenantId: mockTenant.id,
  email: "fallback@hallederiz.com",
  fullName: "Fallback Admin",
  status: "active",
  directPermissions: []
};

const mockAdminRole: Role = mockRoles[0] ?? {
  id: "role_fallback",
  tenantId: mockTenant.id,
  code: "fallback_admin",
  name: "Fallback Admin",
  isSystem: true,
  permissions: mockPermissions
};

export function createLoginPayload(input: LoginInput) {
  return createMockLoginResponse(input, mockTenant, mockAdminUser, [mockAdminRole]);
}

export const mockSettings = defaultPlatformSettings;
