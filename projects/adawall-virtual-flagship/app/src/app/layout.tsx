import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ADAWALL Virtual Flagship',
  description: 'Fotogerçekçi sanal mağaza ve T plan wallpaper corridor pilotu.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
