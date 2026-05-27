import type { Metadata } from "next";
import { AppProviders } from "../src/providers/app-providers";
import "./globals.css";
import "./styles/ana-sayfa-emerald-gold.css";

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
    <html lang="tr" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
