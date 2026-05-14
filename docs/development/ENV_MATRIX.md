# Ortam matrisi (dev / staging / prod)

Tek tabloda **API (`apps/api`)**, **Web (`apps/web`)** ve paylaşılan değişkenler. Değerler örnek; prod’da gerçek URL ve sırlar kullanılır. Ayrıntılı şablon: [../../.env.example](../../.env.example).

| Değişken | Yerel geliştirme (dev) | Staging | Production |
|-----------|-------------------------|---------|--------------|
| `NODE_ENV` | `development` | `production` önerilir* | `production` |
| `PERSISTENCE_MODE` | `demo` veya `postgres` | `postgres` | `postgres` |
| `POSTGRES_URL` / `DATABASE_URL` | Yerel Postgres URL | Yönetilen DB URL | Yönetilen DB URL |
| `ALLOW_DEMO_FALLBACK` | `false` (önerilen); geçici `true` yalnız bilinçli debug | `false` | `false` |
| `DEMO_AUTH_ENABLED` | `false` (gerçek auth testi); yerel demo için `true` yalnız dev | `false` | **`false` zorunlu** |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | Web demo giriş; prod ile uyumlu `false` | `false` | **`false` zorunlu** |
| `LOCAL_PILOT_AUTH_ENABLED` | Yerel pilot `true` olabilir | `false` | **`false` zorunlu** |
| `NEXT_PUBLIC_USE_DEMO_DATA` | `true` (mock liste); API doğrulaması için `false` | `false` önerilir | **`false` zorunlu** |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | Staging API origin | Prod API origin |
| `API_CORS_ORIGINS` | Virgülle localhost portları | Staging web origin(ler)i | Prod web origin(ler)i; **wildcard yok** |
| `NEXT_PUBLIC_SESSION_TOKEN` | İsteğe bağlı (SDK cookie/session ile değişir) | CI/session stratejisine göre | Güvenli oturum modeli |
| `REDIS_URL` | Yerel / docker | Yönetilen Redis | Yönetilen Redis |
| `WHATSAPP_WEBHOOK_*` | Mock veya boş | Staging Meta uygulaması | Prod Meta; secret zorunlu |
| `WORKER_MODE` / outbox | [production-readiness-batch-1.md](../production-readiness-batch-1.md), `apps/api/src/shared/production-readiness-runtime.ts` | Staging ile prod parity hedefi | Prod güvenlik / readiness testleri yeşil |

\*Staging’de `NODE_ENV=production` kullanmak, prod’a yakın davranışı test eder; host adı yine staging olmalıdır.

## Web + API birlikte (gerçek ürün kesimi)

Prod veya pilot “gerçek veri” için tipik kombinasyon:

- `PERSISTENCE_MODE=postgres` + geçerli `POSTGRES_URL`
- `DEMO_AUTH_ENABLED=false`, `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`, `LOCAL_PILOT_AUTH_ENABLED=false`
- `NEXT_PUBLIC_USE_DEMO_DATA=false`
- `ALLOW_DEMO_FALLBACK=false`

Doğrulama: [production-real-product-cutover.md](../production-real-product-cutover.md), API testleri `apps/api/src/tests/production-enforcement-gates.test.ts`, `production-real-product-cutover.test.ts`.

## Migration ve seed (CI / manuel)

Paket: `@hallederiz/database`

```bash
pnpm --filter @hallederiz/database build
pnpm --filter @hallederiz/database migrate:status
pnpm --filter @hallederiz/database migrate:apply
pnpm --filter @hallederiz/database seed:list
```

- **Rollback:** migration dosyaları geri alınmaz; geri dönüş için yeni bir “geri alan” migration veya DB snapshot/restore planı kullanılır. Prod kesiminden önce staging’de `migrate:apply` denenir.
- **Seed:** `demo-seed` ve auth seed komutları yalnızca bilinçli ortamlarda; prod’da genelde uygulama seed’i değil, kontrollü admin/bootstrap prosedürü tercih edilir (`docs/implementation/023-database-backed-auth.md`).

## PR / CI öncesi hızlı kapı

```bash
pnpm smoke:product-readiness
```

CI içinde eşdeğer: `pnpm typecheck` sonrası route + navigation smoke (`.github/workflows/quality-gate.yml`).
