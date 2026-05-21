import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="hz-unauthorized-page" role="alert">
      <h1 className="hz-unauthorized-title">Bu sayfaya erişim yetkiniz yok.</h1>
      <p className="hz-unauthorized-text">
        Farklı bir hesapla devam etmeniz gerekiyorsa yöneticinizle iletişime geçin.
      </p>
      <div className="hz-unauthorized-actions">
        <Link href="/dashboard" className="hz-unauthorized-primary">
          Gösterge paneline dön
        </Link>
        <Link href="/ayarlar" className="hz-unauthorized-secondary">
          Ayarları aç
        </Link>
      </div>
    </div>
  );
}
