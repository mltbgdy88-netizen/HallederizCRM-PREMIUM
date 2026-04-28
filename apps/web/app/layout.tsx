import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
