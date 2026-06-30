# Sprint 9 — Production Go hazırlık

**Branch:** `feature/sprint-9-production-go-prep`  
**Önceki:** Operator Postgres (`main` @ `0917ada1`)  
**Hedef:** Production Go manuel kapılarını yerelde tek komutla doğrulamak

## Kapsam

| Alan | Sprint 9 çıktısı |
|------|------------------|
| Yerel smoke paketi | `pnpm production-go:local` |
| Postgres zincir | `staging:local-chain` + migration smoke |
| Local AI | `local-ai:smoke` + API `GET /health/local-ai` (API ayaktaysa) |
| Viewport QA | Manuel checklist (otomasyon yok) |
| WhatsApp prod | Manuel — credential/webhook (kod dışı) |

## Komut

```powershell
# Tam paket (Postgres + staging zincir + navigation + local-ai)
$env:DATABASE_URL="postgres://hallederiz:hallederiz_dev@127.0.0.1:5432/hallederizcrm"
$env:AUTH_SEED_ADMIN_EMAIL="admin@hallederiz.local"
$env:AUTH_SEED_ADMIN_PASSWORD="change-me-local-only"
$env:AUTH_SESSION_SECRET="local-staging-chain-secret-min-32-chars"
pnpm production-go:local

# Staging zinciri atla (sadece hızlı kapılar)
$env:PRODUCTION_GO_SKIP_STAGING_CHAIN="1"
pnpm production-go:local

# Mevcut API (4000) üzerinde local-ai health
$env:PRODUCTION_GO_API_BASE_URL="http://127.0.0.1:4000"
$env:PRODUCTION_GO_SKIP_STAGING_CHAIN="1"
pnpm production-go:local
```

## Manuel kapılar (sprint dışı onay)

- [ ] Viewport 1920×1080 — liste sayfalarında ≥5 satır (`ui-designer-rules`)
- [ ] Viewport 390×844 — mobil kritik rotalar
- [ ] WhatsApp webhook verify + test recipient
- [ ] GitHub Actions yeşil (billing düzelince re-run)

## Referans

- `docs/product/RELEASE_PRODUCTION_GO_NO_GO.md`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md`
- `docs/development/LOCAL_STAGING_CHAIN.md`
