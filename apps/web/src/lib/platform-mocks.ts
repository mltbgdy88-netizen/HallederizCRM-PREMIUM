import type { Permission, Role, Tenant, User } from "@hallederiz/types";

export const platformPermissions: Permission[] = [
  {
    id: "perm_dashboard_view",
    key: "platform.dashboard.view",
    name: "Gösterge paneli görüntüleme",
    moduleCode: "core"
  },
  {
    id: "perm_users_read",
    key: "platform.users.read",
    name: "Kullanıcıları görüntüleme",
    moduleCode: "users"
  },
  {
    id: "perm_roles_read",
    key: "platform.roles.read",
    name: "Rolleri görüntüleme",
    moduleCode: "users"
  },
  {
    id: "perm_settings_read",
    key: "platform.settings.read",
    name: "Ayarları görüntüleme",
    moduleCode: "settings"
  },
  {
    id: "perm_operator_read",
    key: "platform.operator.read",
    name: "SaaS operatör konsolu okuma",
    moduleCode: "core"
  },
  {
    id: "perm_operator_write",
    key: "platform.operator.write",
    name: "SaaS operatör konsolu yazma",
    moduleCode: "core"
  }
];

export const defaultTenant: Tenant = {
  id: "tenant_1",
  slug: "hallederiz",
  name: "Hallederiz Demo Tenant",
  status: "active",
  locale: "tr-TR",
  timeZone: "Europe/Istanbul",
  modules: [
    { code: "core", enabled: true, configured: true, label: "Platform Core" },
    { code: "users", enabled: true, configured: true, label: "Kullanıcı ve Yetkilendirme" },
    { code: "settings", enabled: true, configured: true, label: "Ayarlar" },
    { code: "whatsapp", enabled: false, configured: false, label: "WhatsApp" },
    { code: "ai", enabled: false, configured: false, label: "AI" },
    { code: "erp", enabled: false, configured: false, label: "ERP" },
    { code: "reporting", enabled: false, configured: false, label: "Raporlama" }
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

export const adminRole: Role = {
  id: "role_admin",
  tenantId: defaultTenant.id,
  code: "platform_admin",
  name: "Platform Yöneticisi",
  description: "Platform Core yönetim erişimleri",
  isSystem: true,
  permissions: platformPermissions
};

export const defaultUser: User = {
  id: "user_1",
  tenantId: defaultTenant.id,
  email: "admin@hallederiz.com",
  fullName: "Platform Admin",
  status: "active",
  title: "Sistem Yöneticisi",
  directPermissions: [],
  lastLoginAt: new Date().toISOString()
};
