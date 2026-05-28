# HallederizCRM-PREMIUM

HallederizCRM-PREMIUM, duvar kagidi sektorune odakli, cok kiracili (multi-tenant), operasyon motoru guclu bir CRM platformu icin olusturulmus temiz bir monorepo bootstrap iskeletidir.

Bu baslangic seti su hedefler icin zemin hazirlar:
- CRM + operasyon omurgasi
- WhatsApp otomasyonu
- ERP / fabrika entegrasyonlari
- Insan onayli lokal yapay zeka akislari
- Kurumsal, masaustu gibi kullanima uygun web arayuzu

## Teknoloji Secimi

- Monorepo: `pnpm workspace`
- Orkestrasyon: `turbo`
- Dil: `TypeScript`
- Web: `Next.js` (`apps/web`)
- API: `Fastify` tabanli TypeScript servis (`apps/api`)

## Klasor Yapisi

```text
.
|-- apps
|   |-- web
|   |-- api
|   |-- worker
|   |-- ai-service
|   `-- local-agent
|-- packages
|   |-- ui
|   |-- config
|   |-- database
|   |-- types
|   |-- utils
|   |-- domain
|   `-- sdk
|-- docs
|   |-- architecture
|   |-- database
|   |-- product
|   |-- ui
|   `-- codex-prompts
|-- package.json
|-- pnpm-workspace.yaml
|-- turbo.json
`-- tsconfig.base.json
```

## Hizli Baslangic

```bash
pnpm install
pnpm dev
```

Ayri servis calistirmak icin:

```bash
pnpm --filter @hallederiz/web dev
pnpm --filter @hallederiz/api dev
pnpm --filter @hallederiz/worker dev
```

## Bootstrap Prensipleri

- Is mantigi bilincli olarak eklenmedi.
- Kod sade, okunakli ve genislemeye acik tasarlandi.
- `@hallederiz/*` alias yapisi buyume ve domain ayrisimi icin hazirlandi.
- Her app ve package icin minimal giris noktasi olusturuldu.

## Gelistirme is akisi

Branch/PR, Codex ve Cursor gorev standardi, kalite kapilari ve AI/onay kurallari: [docs/development/WORKFLOW.md](docs/development/WORKFLOW.md). Platform cekirdegi mimarisi: [docs/architecture/PLATFORM_CORE_ARCHITECTURE.md](docs/architecture/PLATFORM_CORE_ARCHITECTURE.md). Cursor agent kurallari: [.cursor/rules/](.cursor/rules/).

## Product design docs

[docs/product/README.md](docs/product/README.md)

## Sonraki Asamalar (Oneri)

1. Tenant-aware auth ve RBAC omurgasi
2. Event-driven operasyon akislari
3. WhatsApp/ERP adapter katmani
4. Lokal AI onay-kontrol boru hatlari
5. Gozlemlenebilirlik (logs/metrics/tracing)
