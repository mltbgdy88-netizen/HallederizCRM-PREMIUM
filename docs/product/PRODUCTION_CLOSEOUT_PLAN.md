# Production Closeout Plan

Bu dal, HallederizCRM-PREMIUM projesini production-ready duruma getirmek icin kapanis calismalarini toplar.

## Kapanis sirasi

1. CI/build/typecheck/test/smoke
2. Auth/session/tenant
3. PostgreSQL migration + persistence
4. Redis sessions + durable worker
5. Cari -> teklif -> siparis -> tahsilat -> belge/onay gercek veri akisi
6. Fatura/iade/urun/stok/depo/teslimat API eksikleri
7. Raporlar icin canli KPI contract
8. Render production deploy + health smoke
9. WhatsApp Cloud API production smoke
10. Local AI/Ollama production smoke
11. Backup + restore smoke
12. Gercek entity-ID detay smoke
13. 1920x1080 + 390x844 viewport QA

## Durum

- Kod tabani: ileri seviye release candidate
- Production karari: Conditional Go
- Canli sir/credential gerektiren adimlar: OPS INPUT REQUIRED
- Bu dalda fake credential veya fake success kullanilmayacak.

## Bitmis sayma kriteri

Tum production gate'leri PASS olmadan proje tamamlandi olarak isaretlenmeyecek.
