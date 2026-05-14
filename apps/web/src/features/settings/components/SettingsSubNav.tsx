"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/ayarlar", label: "Genel" },
  { href: "/ayarlar/veri-yukleme", label: "Veri yükleme" },
  { href: "/ayarlar/staging-kontrol", label: "Hazırlık kontrolü" },
  { href: "/ayarlar/kullanim-hazirligi", label: "Kullanım hazırlığı" },
  { href: "/ayarlar/operasyon-gozlem", label: "Operasyon ve gözlem" },
  { href: "/ayarlar/canli-kullanim-hazirligi", label: "Canlıya hazırlık" }
];

function linkActive(pathname: string, href: string): boolean {
  if (href === "/ayarlar") return pathname === "/ayarlar";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <ul className="hz-settings-inner-nav">
      {NAV_ITEMS.map((item) => {
        const active = linkActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`hz-settings-inner-nav-link${active ? " hz-settings-inner-nav-link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
