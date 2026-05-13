# Production Hardening Foundation

Bu paket, production/local-first gecisi oncesi guvenli temel kontrolleri dar kapsamli olarak guclendirir.

## Degisen Temeller

- Web auth path artik access token'i `localStorage` icinde saklamaz.
- API login signed session token uretir ve HttpOnly `hz_session` cookie set eder.
- `/auth/session`, `/auth/me` ve `/auth/logout` cookie/header uyumlu calisir.
- Production'da demo/local-pilot fallback kapali kalir; session secret eksikse imzali session uretimi fail-closed davranir.
- `xlsx` bagimliligi `exceljs` ile degistirildi.
- Import parser CSV/XLSX uzantisi, dosya boyutu, sheet count ve row count guard'lari uygular.
- Workspace lint scriptleri placeholder yerine TypeScript fail/pass kapisina baglandi.
- CI quality gate main push icin de kosar ve lint/typecheck/build/test/smoke adimlarini icerir.
- Generated TypeScript build info dosyalari ignore edilir; `apps/web/tsconfig.tsbuildinfo` commit kapsamindan cikarilir.
- Local AI health smoke `--degraded-ok` modunda local-first unavailable sonucunu acik raporlar.
- Local-agent file save/print artik placeholder/no-op success uretmez; binary payload veya printer config yoksa `not_configured` sonucu verir.
- Tenant usage ledger DB-backed foundation eklendi; tenant_usage_events migration, repository adapter ve tenant-scoped API runtime resolver ile AI request, channel message, document generation ve workflow execution olaylari raporlanabilir.

## Production Zorunlu Env

- `NODE_ENV=production`
- `PERSISTENCE_MODE=postgres`
- `DATABASE_URL` veya ilgili postgres connection config
- `AUTH_SESSION_SECRET` veya `SESSION_SECRET`
- `API_CORS_ORIGINS` ve/veya `WEB_URL`

Demo/local-pilot auth env'leri production'da aktif kabul edilmez.

## Smoke Komutlari

```powershell
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
node scripts/run-web-navigation-tests.cjs
node scripts/smoke/routes.cjs
node scripts/smoke/navigation.cjs
pnpm local-ai:smoke
```

## Sonraki Fazlar

- Full ESLint rule set ve format policy ayrica eklenmeli.
- Tenant usage billing policy enforcement ayri PR ile eklenmeli; DB-backed runtime icin production POSTGRES_URL/DATABASE_URL zorunlu kalir ve demo in-memory fallback production'da kapali tutulur.
- Local-agent printer driver entegrasyonu ve PDF binary producer zinciri ayri PR ile canliya alinmali.
- Production session store icin DB/Redis backed session persistence ayri fazda sertlestirilmeli.
- Installer/auto-update/lisanslama bu paketin kapsami disinda kalir.


