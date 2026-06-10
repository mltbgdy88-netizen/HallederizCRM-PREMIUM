import { ReferenceOfflineShell } from "../../src/components/reference-offline-shell";

export default function OfflineShellLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ReferenceOfflineShell>{children}</ReferenceOfflineShell>;
}
