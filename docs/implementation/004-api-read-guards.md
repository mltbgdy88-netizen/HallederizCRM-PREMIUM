# API Read Guard Hardening

Bu tur, ticari ve operasyonel verileri döndüren `GET` endpointlerinin oturumsuz veya yetkisiz şekilde veri sızdırma riskini kapatır. Runtime response shape ve domain davranışı değiştirilmeden, hassas okuma endpointleri merkezi `assertAuthenticated` ve ilgili read/write permission guard'ları ile korunur.

## Public Endpointler

Aşağıdaki endpointler public kalabilir:

- `GET /`
- `GET /health`
- Auth endpointleri (`/auth/login`, oturum doğrulama ve çıkış akışları kendi auth davranışlarıyla)
- WhatsApp webhook verification endpointi; provider token/signature doğrulamasıyla public kalır
- Hassas veri döndürmeyen import template listeleme yüzeyleri

Bu liste dışındaki ticari veri dönen endpointler varsayılan olarak protected kabul edilir.

## Protected Endpoint Kapsamı

Okuma guard'ı eklenen ana veri alanları:

- `orders`
- `payments`
- `warehouse-orders`
- `deliveries`
- `invoices`
- `returns`
- `documents`
- `customers`
- `offers`
- `products`
- `stock/pricing`
- `workflow/tasks/approvals/audit/timeline`
- `users/roles/settings`
- `integrations/local-output`

Auth yoksa `401`, auth var ama uygun permission yoksa `403` dönmesi beklenir.

## Permission Matrix Özeti

Read endpointleri ilgili `*.read` iznini kabul eder. Operasyonel olarak write/manage yetkisine sahip kullanıcıların okuma yapabilmesi için ilgili `*.write` veya `*.manage` izinleri de kabul edilir.

| Alan | Kabul edilen izin özeti |
| --- | --- |
| Cariler | `customers.read`, `customers.write`, `customers.manage` |
| Ürün/Stok/Fiyat | `products.read`, `products.write`, `products.manage`, fiyat alanları için `pricing.write/manage` |
| Teklifler | `offers.read`, `offers.write`, `offers.manage` |
| Siparişler | `orders.read`, `orders.write`, `orders.manage` |
| Tahsilatlar | `payments.read`, `payments.write`, `payments.manage` |
| Depo | `warehouse.read`, `warehouse.write`, `warehouse.manage` |
| Teslimatlar | `deliveries.read`, `deliveries.write`, `deliveries.manage` |
| Faturalar | `invoices.read`, `invoices.write`, gerektiğinde `documents.write` |
| İadeler | `returns.read`, `returns.write`, `returns.manage` |
| Belgeler | `documents.read`, `documents.write`, `documents.render` |
| Onay/Workflow/Görev | `approvals.read/write/manage`, `workflow.read/write`, `tasks.read/write` |
| Entegrasyonlar | `integrations.read`, `integrations.write` |
| Local output | `local_output.read/write`, belge okuma/yazma izinleri |
| Platform | `platform.users.read/write`, `platform.roles.read`, `platform.settings.read/write` |

## Smoke Script Notu

Bu turda smoke scriptleri auth bypass yapacak şekilde gevşetilmedi. Route/navigation smoke kontrolleri uygulamanın route ve navigasyon bütünlüğünü doğrulamaya devam eder. Protected API davranışı için ayrı `node:test` read guard testleri eklendi.

## Sonraki İş

Bir sonraki güvenlik işi: Postgres dependency and production fallback hardening. Bu adımda production/postgres modunda sessiz demo/mock fallback davranışlarının tamamen görünür ve kontrollü hale getirilmesi hedeflenir.
