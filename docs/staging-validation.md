# Staging Validation Rehberi

Bu rehber, staging ortamina gecmeden once canli servis baglantilarini guvenli sekilde dogrulamak icindir.

## Ekran
- Route: `/ayarlar/staging-kontrol`
- Amac: AI, WhatsApp, ERP, Fabrika ve Local Agent servislerinin canli/fallback durumunu tek yerden gormek.

## Kontrol Adimlari
1. Sayfayi acin ve `Saglik Durumunu Yenile` ile toplu sonucu alin.
2. Her servis satirinda `status`, `mode`, `configured` alanlarini kontrol edin.
3. `Test Et` butonu ile dry-run/ping testlerini calistirin.
4. `reason` alanindaki eksik env veya hata mesajlarini giderin.
5. Tum kritik servisler `healthy + live` olduktan sonra staging onayina gecin.

## Test Butonlari Ne Yapar
- AI: chat + STT + TTS test endpointlerini cagirir.
- WhatsApp: outbound test gonderim denemesi yapar.
- ERP: baglanti testi endpointini cagirir.
- Fabrika: senkron dry-run testini cagirir.
- Local Agent: save/print dry-run queue testlerini cagirir.

## Beklenen Sonuc
- Canliya alinacak servisler: `mode=live`, `status=healthy`
- Canli disi ama guvenli servisler: `mode=fallback|mock`, `status=fallback|degraded`
- Bilerek kapali servisler: `mode=disabled`, `status=disabled`

