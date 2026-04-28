import type { ReactNode } from "react";

export interface AppShellNavItem {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  pulse?: boolean;
}
