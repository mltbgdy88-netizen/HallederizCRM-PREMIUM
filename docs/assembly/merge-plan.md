# Birleşik CRM Teknik Planı

## Karar

Tek parça CRM ürünü için ana yaklaşım:

- Ana no-code/low-code yetenek: NocoBase referans alınacak.
- Modern UI referansı: Atomic CRM.
- CRM veri modeli referansı: Django CRM + Krayin.
- AI referansı: Multi-Agent Enterprise CRM.
- Sektörel özellikler: özel `packages/wallpaper-sector` modülü.

## Neden doğrudan kopyala-yapıştır değil?

Kaynak projeler farklı framework, database, auth ve deployment sistemleri kullanır. Bu yüzden doğrudan karıştırmak yerine ortak veri modeli, ortak API ve ortak UI kabuğu oluşturulmalıdır.

## İlk gerçek ürün hedefi — MVP-1

- Login
- Workspace
- Kullanıcı
- Rol / yetki
- Müşteri
- Firma
- Kişi
- Lead
- Fırsat
- Görev
- Dashboard
- Basit teklif
- Basit ürün listesi

## Monorepo hedef yapısı

```text
apps/
  web/
  api/
  worker/
  ai-gateway/

packages/
  crm-core/
  tenant-auth/
  sales/
  inventory/
  finance/
  integrations/
  wallpaper-sector/
```

## Sonraki PR hedefleri

1. Monorepo iskeleti.
2. CRM core veri modeli.
3. Web shell.
4. API shell.
5. Müşteri/firma/kişi modülü.
6. Lead/fırsat modülü.
7. Teklif/sipariş modülü.
8. Ürün/stok modülü.
9. Duvar kağıdı sektörel modülü.
10. AI gateway.

## Teknik prensipler

- Tenant-aware veri modeli.
- Role/permission ayrımı.
- Audit log.
- Soft delete.
- Import/export altyapısı.
- API rate limit.
- Workflow/event altyapısı.
- Modüler paket sınırları.
