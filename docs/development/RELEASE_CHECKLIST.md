# Release kontrol listesi

Pilot veya release adayı merge öncesi/sonrası kontrol. Ayrıntı: `docs/pilot-go-live-checklist.md`, `docs/production-readiness-batch-1.md`, `docs/production-readiness-batch-2.md`.

## Kod ve CI

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, smoke komutları yeşil  
- [ ] Migration planı ve geri alma notu (varsa)  
- [ ] Feature flag / env değişiklikleri dokümante  

## Güvenlik

- [ ] Production’da demo/mock auth kapalı  
- [ ] Tenant isolation ve permission guard regresyonu yok  
- [ ] WhatsApp/webhook secret ve signature fail-closed  
- [ ] Raw approval token loglanmıyor  

## AI ve onay

- [ ] Proposal-only; onaysız execution yok  
- [ ] Local-first; fallback mutation yapmıyor  
- [ ] Onaylı execution audit/timeline yazıyor  

## Entegrasyon

- [ ] ERP/fabrika/WhatsApp adapter: canlı yoksa kontrollü hata (sessiz başarı yok)  
- [ ] Local agent disabled/misconfigured davranışı biliniyor  

## Ürün / UX

- [ ] Quick Operation ana operasyon yüzeyi bozulmadı  
- [ ] Dashboard KPI vitrine dönmedi  
- [ ] Kritik ekranlarda smoke/manuel pilot adımları  

## Operasyon

- [ ] Rollback planı  
- [ ] İlgili `docs/pilot-readiness-status.md` güncellemesi (gerekiyorsa)  
