# HallederizCRM Teslimat Durumu

Son güncelleme: 25 Eylül 2026

Bu dosya ürünün teslimat durumu için kanonik kaynaktır. Diğer tamamlanma raporları bu tabloyla birlikte okunur. Bir UI ekranının veya altyapı temelinin tamamlanmış olması, ilgili akışın canlı sağlayıcı ve kalıcı veriyle üretime hazır olduğu anlamına gelmez.

## Karar

**Güncel karar: Conditional Go — kontrollü pilot.**

Full Production Go için gerçek Meta WhatsApp staging kanıtı, gerekli ERP/fabrika sağlayıcı erişimleri, PostgreSQL tabanlı uçtan uca kabul ve seçilen cloud ortamında doğrulanmış rollback zorunludur. Bu dış girdiler olmadan hiçbir kayıt PASS sayılmaz.

## Durum sözlüğü

| Durum | Anlamı |
|---|---|
| UI tamam | Kabul edilmiş tasarım ve kullanıcı yüzeyi mevcut; canlı veri garantisi vermez. |
| Foundation tamam | Contract, policy veya adapter temeli mevcut; gerçek sağlayıcı/kalıcılık sertifikasyonu eksik olabilir. |
| Pilot hazır | Kontrollü tenant ve gözetimli kullanım için gerekli kapılar geçilmiş. |
| Live-ready | Gerçek sağlayıcı, production kalıcılığı, gözlemlenebilirlik ve rollback kanıtı mevcut. |

## Dalga durumu

| Dalga | Durum | Tamamlanan | Açık kapı |
|---|---|---|---|
| 0 — Güvenli başlangıç | Devam ediyor | Dal `origin/main` `e38e621` üzerinden açıldı; kullanıcı `next-env.d.ts` farkı korundu; repo teslimat becerisi oluşturuldu ve doğrulandı. | Docker daemon, env dosyaları ve bağlı deploy/security hesapları yok. Tam temiz baseline yeniden koşulacak. |
| 1 — Mutation ve worker | Uygulandı, PR bekliyor | Kanonik `approval.execution.dispatch` production handler oldu; async execution port desteği, tenant-scoped kalıcı execution doğrulaması, audit/timeline metadata ve worker testleri eklendi. | Gerçek PostgreSQL kabulü Docker/DB olmadan koşturulamadı. `notification.dispatch` canlı provider olmadığı için fail-closed kalır. |
| 2 — PostgreSQL sürekliliği | Açık | Commercial repository temelleri ve tenant guard'lar var. | Local-output/agent state, module flags ve kalan kontrollü mock/fallback yolları PostgreSQL'e taşınacak. |
| 3 — Entegrasyon ve edge | Dış bağımlılıklı | WhatsApp imza/idempotency ve adapter foundation'ları var; Ollama yerelde çalışıyor. | Gerçek Meta/ERP/fabrika hesapları, Windows spooler ve local-ai CI sertifikasyonu gerekli. |
| 4 — UI canlı veri | Açık | UI freeze ve ana CRM yüzeyleri mevcut. | Placeholder ekranlar, ortak mutation feedback ve iki viewport Playwright matrisi tamamlanacak. |
| 5 — Güvenlik/deploy | Açık | Secret scan/audit komutları ve production safety kontrolleri var. | Security taraması, OpenTelemetry, production imajları, Render servisleri, migration/release/rollback otomasyonu gerekli. |

## Değişmezler

- AI yalnız proposal üretir; CRM verisini doğrudan değiştiremez.
- Mutation zinciri policy + approval + transaction + audit + timeline + outbox sınırını korur.
- Production'da demo auth, demo data ve sessiz fallback kapalıdır.
- Her tenant-scoped repository çağrısı açık `tenantId` ister; varsayılan tenant yoktur.
- Meta Cloud API production WhatsApp kanalıdır; WhatsApp Web yalnız pilot/beta olabilir.
- Cloud uygulama çekirdeği Render hedeflidir; Ollama, local-ai ve local-agent müşteri Windows edge katmanında kalır.

## Son kanıt

- Typecheck: 13/13 paket PASS.
- Lint: 13/13 paket PASS.
- Production build: 13/13 paket PASS; mevcut bir CSS satırında non-blocking autoprefixer uyarısı var.
- API testleri: 483 toplam, 482 PASS, 1 gerçek PostgreSQL testi bağlantı olmadığı için SKIP, 0 FAIL.
- Worker testleri: 4/4 PASS.
- Secret scan: PASS.
- Dependency audit: high/critical ve moderate dahil bilinen açık yok; Next.js, Fastify, PostCSS, Sharp, fast-uri ve Nano ID güvenli patch sürümlerine yükseltildi.
- PostgreSQL entegrasyon testi: bağlantı olmadığı için SKIP; production kanıtı değildir.
- Full Go: **BLOCKED** — WhatsApp staging ve dış sağlayıcı kanıtları eksik.

## Sıradaki yürütme sırası

1. Dalga 1 tam kalite kapılarını bitir, küçük PR aç ve rollback notunu ekle.
2. Docker/PostgreSQL erişimi sağlandığında fresh/upgrade/re-apply ve worker lease/retry/DLQ testlerini çalıştır.
3. Dalga 2'yi local-output ve tenant module persistence ile başlat.
4. Dış sağlayıcı sırları gelene kadar simulator/contract testlerini geliştir; canlı sertifikasyonu NOT_RUN tut.

İlgili ayrıntılar: [Production Go açık kapıları](./PRODUCTION_GO_OPEN_GATES.md), [üretim yürütme kuyruğu](../development/PRODUCTION_EXECUTION_QUEUE.md), [persistence geçişi](../persistence-transition.md).
