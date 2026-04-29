# Auth and Tenant Flow

## Amaç

Web -> API zincirinde user, tenant ve permission bilgisinin tek bir request-context uzerinden guvenli tasinmasi.

## Akis

1. Kullanici `POST /auth/login` ile giris yapar.
2. API session store icinde access token -> session eslesmesi yaratir.
3. Web tarafi token'i local storage'da saklar.
4. Sonraki isteklerde SDK su headerlari gonderir:
   - `x-session-token`
   - `authorization: Bearer <token>`
   - (opsiyonel) `x-tenant-id`, `x-user-id`
5. API `buildRequestContext` ile:
   - tenantId
   - userId
   - roles
   - permissions
   - isAuthenticated
   cozumler.
6. Route guardlari:
   - `assertAuthenticated`
   - `assertTenantAccess`
   - `assertPermission` / `assertAnyPermission`
   ile endpointi korur.

## Sertlestirme Notu

- Session varsa `tenantId` ve `userId` session bilgisinden resolve edilir.
- Header'dan gelen `x-tenant-id`, session tenant ile farkliysa `tenant_mismatch` olarak isaretlenir.
- `assertAuthenticated` bu durumda 403 dondurur ve izolasyon ihlalini engeller.

## Hata Semantigi

- `401 unauthorized`: oturum yok / gecersiz token
- `403 forbidden`: yetki yok
- `403 forbidden + tenant_mismatch`: tenant izolasyon ihlali

## Notlar

- Bu batch'te token kriptografik imza dogrulamasina gecilmedi.
- Session resolver production token provider'a gecis icin tek noktadan genisletilebilir.
