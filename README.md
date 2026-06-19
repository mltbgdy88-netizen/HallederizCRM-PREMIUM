# no-code — Birleşik Açık Kaynak CRM Platformu

Bu repo, farklı açık kaynak CRM/ERP/AI projelerini doğrudan tek bir ürün gibi kullanmak yerine, onları **referans kaynak** olarak kullanarak birleşik bir CRM platformu oluşturmak için hazırlanmıştır.

## Hedef

1000 maddelik **Amiral Gemisi CRM** özellik listesini aşamalı şekilde çalışan tek CRM ürününe dönüştürmek.

Bu hedef tek adımda tamamlanmaz. Farklı açık kaynak projeler farklı teknoloji, veri modeli ve auth yapısı kullandığı için doğru yaklaşım şudur:

1. Açık kaynak repoları `vendor/` altında referans olarak tutmak.
2. Tek ürün mimarisini `apps/` ve `packages/` altında kurmak.
3. Ortak veri modeli, API, auth, rol/yetki ve tenant izolasyonu tasarlamak.
4. Kaynak repolardan kullanılabilir UI, domain, workflow ve AI yaklaşımlarını kontrollü şekilde taşımak.
5. Eksik sektörel özellikleri özel modüller olarak geliştirmek.

## İndirilen açık kaynak kaynaklar

| Kaynak | Yerel klasör | Rol |
|---|---|---|
| Atomic CRM | `vendor/atomic-crm` | Modern CRM arayüz referansı; dashboard, contacts, companies, deals demo ekranları |
| Django CRM / BottleCRM | `vendor/django-crm` | Multi-tenant CRM/API referansı |
| Krayin CRM | `vendor/laravel-crm` | Klasik CRM/satış süreçleri referansı |
| NocoBase | `vendor/nocobase` | Low-code/no-code ana platform adayı |
| OpenSource Startup CRM | `vendor/opensource-startup-crm` | Svelte/Node CRM referansı |
| Multi-Agent Enterprise CRM | `vendor/multi-agent-enterprise-crm` | AI agent ve event-driven mimari referansı |

> Not: `vendor/` kaynakları büyük olduğu için GitHub'a doğrudan toplu kopyalamak yerine yerelde indirildi. Bu repo, birleşik ürünün ana gövdesini ve entegrasyon planını tutar.

## Birleşik ürün yapısı

```text
apps/
  web/            Tek CRM arayüzü
  api/            Tek backend API
  worker/         Queue/background jobs
  ai-gateway/     AI servis katmanı

packages/
  crm-core/       Müşteri, firma, kişi, lead, fırsat, görev
  tenant-auth/    Firma/workspace, kullanıcı, rol, yetki
  sales/          Teklif, sipariş, pipeline
  inventory/      Ürün, stok, depo, şube, bayi
  finance/        Cari, tahsilat, borç/alacak, risk limitleri
  integrations/   WhatsApp, e-posta, SMS, webhook, API adapter
  wallpaper-sector/ Duvar kağıdı, rulo, fire, metraj, numune, katalog
```

## Çalışan ilk kanıt

Atomic CRM demo başarıyla çalıştırıldı:

```powershell
Set-Location "C:\Users\mevlu\no-code\vendor\atomic-crm"
npm install
npm run dev:demo
```

Tarayıcı:

```text
http://localhost:5173/
```

Görülen çalışan sayfalar:

- Dashboard
- Contacts
- Companies
- Deals

## Önemli gerçek

Bu repo şu anda tüm 1000 özelliği çalışan nihai ürün değildir. İlk aşama, açık kaynak kaynakların toplanması ve birleşik CRM mimarisinin kurulmasıdır. Tüm özellikler aşamalı modül geliştirme ile tek ürüne taşınacaktır.

## Sonraki teknik hedef

Ana öneri: **NocoBase tabanlı birleşik CRM + Atomic CRM UI referansı + özel TypeScript paketleri**.

İlk gerçek MVP hedefi:

- Workspace / tenant
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
