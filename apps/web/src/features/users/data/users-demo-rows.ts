import type { User } from "@hallederiz/types";

export const HZ_USERS_DEMO_PREFIX = "hz_demo_user_" as const;

export const USERS_DESK_DEMO_ROWS: User[] = [
  {
    id: `${HZ_USERS_DEMO_PREFIX}1`,
    tenantId: "tenant_demo",
    email: "ayse.yilmaz@ornek.local",
    fullName: "Ayşe Yılmaz",
    status: "active",
    title: "Satış Müdürü",
    directPermissions: [],
    lastLoginAt: "2026-06-08T09:12:00.000Z"
  },
  {
    id: `${HZ_USERS_DEMO_PREFIX}2`,
    tenantId: "tenant_demo",
    email: "mehmet.kaya@ornek.local",
    fullName: "Mehmet Kaya",
    status: "active",
    title: "Operasyon Uzmanı",
    directPermissions: [],
    lastLoginAt: "2026-06-07T14:30:00.000Z"
  },
  {
    id: `${HZ_USERS_DEMO_PREFIX}3`,
    tenantId: "tenant_demo",
    email: "zeynep.arslan@ornek.local",
    fullName: "Zeynep Arslan",
    status: "invited",
    title: "Muhasebe",
    directPermissions: [],
    lastLoginAt: undefined
  },
  {
    id: `${HZ_USERS_DEMO_PREFIX}4`,
    tenantId: "tenant_demo",
    email: "can.demir@ornek.local",
    fullName: "Can Demir",
    status: "active",
    title: "Depo Sorumlusu",
    directPermissions: [],
    lastLoginAt: "2026-06-06T11:05:00.000Z"
  },
  {
    id: `${HZ_USERS_DEMO_PREFIX}5`,
    tenantId: "tenant_demo",
    email: "elif.sahin@ornek.local",
    fullName: "Elif Şahin",
    status: "active",
    title: "Pazarlama",
    directPermissions: [],
    lastLoginAt: "2026-06-05T16:44:00.000Z"
  },
  {
    id: `${HZ_USERS_DEMO_PREFIX}6`,
    tenantId: "tenant_demo",
    email: "burak.ozturk@ornek.local",
    fullName: "Burak Öztürk",
    status: "disabled",
    title: "Satış Temsilcisi",
    directPermissions: [],
    lastLoginAt: "2026-03-12T08:20:00.000Z"
  },
  {
    id: `${HZ_USERS_DEMO_PREFIX}7`,
    tenantId: "tenant_demo",
    email: "deniz.koc@ornek.local",
    fullName: "Deniz Koç",
    status: "active",
    title: "Yönetici",
    directPermissions: [],
    lastLoginAt: "2026-06-08T07:55:00.000Z"
  },
  {
    id: `${HZ_USERS_DEMO_PREFIX}8`,
    tenantId: "tenant_demo",
    email: "selin.aktas@ornek.local",
    fullName: "Selin Aktaş",
    status: "disabled",
    title: "Destek",
    directPermissions: [],
    lastLoginAt: "2026-05-20T10:11:00.000Z"
  }
];
