// @ts-nocheck
import type { Metadata } from "next";
import { AppProviders } from "../src/providers/app-providers";
import "./globals.css";
import "./reference-globals.css";

export const metadata: Metadata = {
  title: "HallederizCRM PREMIUM",
  description: "Enterprise-grade CRM and operations platform bootstrap"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="ref-ui-root" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}





