# Auth Hardening - Round 1

## Amaç

Bu tur demo/mock auth davranışını açık flag'e bağlar ve production/postgres modunda sahte login ile sahte yetki üretimini kapatır.

Bu değişiklik büyük auth rewrite değildir. Gerçek DB user/password sistemi bu turda eklenmedi.

## Güvenli Hale Gelen Davranışlar

- Demo login artık yalnızca `DEMO_AUTH_ENABLED=true`, `NODE_ENV !== production` ve `PERSISTENCE_MODE=demo` iken çalışır.
- `mock_access_*` token'lar sadece explicit demo auth modunda principal üretir.
- `x-user-id`, `x-user-role`, `x-user-permissions` header fallback'i sadece explicit demo auth modunda çalışır.
- Production veya postgres modunda session yoksa kullanıcı authenticated sayılmaz.
- Production veya postgres modunda default admin/permission fallback üretilmez.
- Frontend login API başarısız olduğunda varsayılan olarak mock authenticated state üretmez.

## Demo Auth Açma

Local demo geliştirme için:

```bash
DEMO_AUTH_ENABLED=true
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
PERSISTENCE_MODE=demo
NODE_ENV=development
```

Bu modda:

- `/auth/login` demo session üretebilir.
- Frontend API login başarısızsa, sadece local/demo bayrağı açıksa mock login fallback kullanabilir.
- Mock token ve header principal fallback test/geliştirme amacıyla kullanılabilir.

## Production Davranışı

Production için:

```bash
DEMO_AUTH_ENABLED=false
NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
PERSISTENCE_MODE=postgres
NODE_ENV=production
```

Production'da:

- Demo login kapalıdır.
- `mock_access_*` token kabul edilmez.
- Header üzerinden kullanıcı/rol/yetki üretimi yapılmaz.
- Session yoksa request anonymous kabul edilir.
- Gerçek auth provider henüz yapılandırılmadıysa `/auth/login` kontrollü hata döner:
  - `Demo auth disabled. Configure real auth provider.`

## Frontend Mock Fallback

Önceki davranışta login API başarısız olursa frontend sessizce mock session oluşturabiliyordu.

Yeni davranış:

- Varsayılan olarak API login hatası kullanıcıya hata olarak döner.
- Mock fallback yalnızca `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true` ve production dışı ortamda çalışır.

Bu, pilot/production ortamında kullanıcının fark etmeden sahte authenticated state'e düşmesini engeller.

## Bu Turun Kapsam Dışı Alanları

- Commercial GET endpoint guard hardening yapılmadı.
- Gerçek DB user/password doğrulaması eklenmedi.
- Hızlı İşlem Merkezi kodu eklenmedi.
- WhatsApp workflow portu yapılmadı.
- Büyük auth provider rewrite yapılmadı.

## Sonraki İş

Bir sonraki güvenlik turu API read endpoint guard hardening olmalıdır:

- Commercial GET endpointlerinde session/tenant guard zorunluluğu
- Tenant mismatch response standardı
- Read permission coverage matrisi
- SDK request auth header davranışının production ile hizalanması
