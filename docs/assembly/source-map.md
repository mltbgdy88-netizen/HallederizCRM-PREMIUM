# Kaynak Repo Haritası

Bu dosya, yerelde indirilen açık kaynak CRM/ERP/AI kaynaklarının birleşik CRM ürününde hangi amaçla kullanılacağını tanımlar.

## Atomic CRM

Yerel klasör: `vendor/atomic-crm`

Kullanılacak alanlar:

- Dashboard arayüzü
- Contacts ekranı
- Companies ekranı
- Deals kanban ekranı
- React/Vite UI yapısı
- Demo data yaklaşımı

Durum: Demo çalıştı.

## Django CRM / BottleCRM

Yerel klasör: `vendor/django-crm`

Kullanılacak alanlar:

- CRM veri modeli referansı
- Multi-tenant yaklaşım
- Lead, account, contact, opportunity yapıları
- Task/case/invoice mantığı

Durum: Kaynak indirildi; birleşik ürüne doğrudan backend olarak seçilmedi.

## Krayin CRM

Yerel klasör: `vendor/laravel-crm`

Kullanılacak alanlar:

- Lead pipeline
- Satış süreçleri
- CRM modül organizasyonu
- Laravel backend referansı

Durum: Kaynak indirildi; satış/teklif/sipariş mantığı için referans.

## NocoBase

Yerel klasör: `vendor/nocobase`

Kullanılacak alanlar:

- Low-code/no-code modül üretimi
- Form/list/detail ekran üretimi
- Yetki ve plugin mimarisi
- Workflow yaklaşımı

Durum: Ana platform adayı.

## OpenSource Startup CRM

Yerel klasör: `vendor/opensource-startup-crm`

Kullanılacak alanlar:

- Modern Svelte CRM yapısı
- Product catalog / quote / organization referansları
- Multi-tenant UI referansı

Durum: Ürün/katalog/teklif referansı.

## Multi-Agent Enterprise CRM

Yerel klasör: `vendor/multi-agent-enterprise-crm`

Kullanılacak alanlar:

- AI agent tasarımı
- Vector search yaklaşımı
- Event-driven mimari
- AI destekli satış/destek akışları

Durum: AI gateway için referans.
