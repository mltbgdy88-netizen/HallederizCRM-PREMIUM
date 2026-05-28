import type { Metadata, Viewport } from "next";
import { AppProviders } from "../src/providers/app-providers";
import "./globals.css";
import "./reference-globals.css";
import "./styles/desk-dark-mode.css";
import "./styles/desk-dark-mode-sweep.css";

export const metadata: Metadata = {
  title: "HallederizCRM PREMIUM",
  description: "Enterprise-grade CRM and operations platform bootstrap"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="ref-ui-root" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
