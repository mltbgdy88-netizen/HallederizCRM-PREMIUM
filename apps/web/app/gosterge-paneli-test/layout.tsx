import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "G\u00f6sterge Paneli \u2014 UI Referans Testi",
  description: "G\u00f6sterge paneli referans UI test ekran\u0131 (demo veri)"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function GostergePaneliTestLayout({ children }: { children: ReactNode }) {
  return children;
}
