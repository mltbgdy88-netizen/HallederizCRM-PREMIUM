# Quality Gate

## Amaç

Bu kalite kapısı her pull request için temel güvence sağlar:

- Bağımlılıklar kilit dosyasına göre kurulur.
- TypeScript typecheck çalışır.
- Production build doğrulanır.
- API tarafındaki `node:test` senaryoları çalışır.
- Server gerektirmeyen route ve navigation smoke kontrolleri çalışır.

Bu tur runtime davranışı, API endpoint davranışı, domain model veya web UI davranışı değiştirmez.

## Local Komutlar

Geliştirici makinesinde önerilen sıra:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm smoke:routes
pnpm smoke:navigation
```

Tek komutla temel kapıyı çalıştırmak için:

```bash
pnpm ci:local
```

`pnpm ci:local` sırasıyla `pnpm typecheck`, `pnpm build` ve `pnpm test` çalıştırır.

## Test Scriptleri

Root scriptleri:

- `pnpm test`: API test kapısını çalıştırır.
- `pnpm test:api`: API paketinin workspace dependency build'lerini hazırlar, package entrypoint shim'lerini doğrular ve `@hallederiz/api` paketindeki testleri çalıştırır.
- `pnpm ci:local`: typecheck, build ve API testlerini sırayla çalıştırır.

API paketi:

- `pnpm --filter @hallederiz/api test`: `apps/api/scripts/run-tests.cjs` üzerinden `apps/api/src/tests/*.test.ts` altındaki `node:test` dosyalarını `ts-node/esm` loader ile çalıştırır.
- Test runner scripti wildcard/glob davranışını shell'e bırakmaz; Windows ve GitHub Actions Linux ortamında aynı dosya listesini üretir.
- API testleri mevcut extensionless ESM import stilini desteklemek için Node'un `--experimental-specifier-resolution=node` bayrağıyla çalışır.
- Root `pnpm test:api` komutu testten önce `pnpm --filter @hallederiz/api... build` çalıştırır; böylece `@hallederiz/domain`, `@hallederiz/types` ve diğer workspace dependency build çıktıları hazır olur.
- `scripts/ci/ensure-workspace-entrypoints.cjs`, mevcut build yapısında `dist/<paket>/src/index.js` altında oluşan çıktılar için `dist/index.js` ve `dist/index.d.ts` entrypoint shim'leri üretir. Bu helper source veya runtime davranışı değiştirmez; yalnızca package export'larının test runtime'da çözülebilmesini sağlar.
- Test runner, canlı WhatsApp gönderimi yapmamak için `WHATSAPP_TEST_RECIPIENT` değerini yoksa güvenli dummy değerle izole eder.

## CI Sırası

GitHub Actions workflow dosyası:

- `.github/workflows/quality-gate.yml`

Workflow şu olaylarda çalışır:

- `pull_request`
- `workflow_dispatch`

CI sırası:

1. Checkout
2. pnpm 9.12.0 kurulumu
3. Node.js 20 kurulumu ve pnpm cache
4. `pnpm install --frozen-lockfile`
5. `pnpm typecheck`
6. `pnpm build`
7. `pnpm test`
8. `pnpm smoke:routes`
9. `pnpm smoke:navigation`

Build veya test başarısız olursa `.turbo`, `.next` ve `.runtime-next` logları varsa artifact olarak yüklenir.

## Smoke Scriptleri

`smoke:routes` ve `smoke:navigation` scriptleri local server istemeyen dosya ve bağlantı pattern kontrolleridir. Bu nedenle CI kalite kapısına dahil edilmiştir.

`smoke:e2e` bu turda CI'a eklenmedi. E2E akışları gerçek browser/server yaşam döngüsü gerektirebileceği için ayrı bir pilot acceptance gate olarak ele alınmalıdır.

## Lint Notu

Mevcut lint scriptleri paketlerde TODO/no-op olabilir. Bu batch kapsamlı ESLint migration yapmaz.

Gerçek ESLint config, rule set ve CI lint zorunluluğu ayrı ve kontrollü bir takip işi olarak ele alınmalıdır.
