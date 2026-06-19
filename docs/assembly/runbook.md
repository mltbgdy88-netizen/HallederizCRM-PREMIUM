# Kurulum ve Çalıştırma Runbook

## Kaynak klasör kontrolü

Yerel çalışma klasörü:

`C:\Users\mevlu\no-code`

Beklenen kaynak klasörler:

- atomic-crm
- django-crm
- laravel-crm
- multi-agent-enterprise-crm
- nocobase
- opensource-startup-crm

## Atomic CRM demo

Klasör:

`C:\Users\mevlu\no-code\vendor\atomic-crm`

Komutlar:

- `npm install`
- `npm run dev:demo`

Adres:

`http://localhost:5173/`

Çalışan demo sayfaları:

- Dashboard
- Contacts
- Companies
- Deals

## NocoBase kontrol

Klasör:

`C:\Users\mevlu\no-code\vendor\nocobase`

Sonraki aşamada NocoBase çalıştırma komutu, bu klasördeki package.json, docker-compose ve README yapısına göre belirlenecek.

## GitHub push notu

Bu branch GitHub üzerinden oluşturuldu. Yereldeki büyük vendor klasörleri henüz GitHub'a yüklenmedi. Vendor kaynakları büyük olduğu için ya gitignore altında tutulmalı ya da ayrı submodule/subtree stratejisi belirlenmelidir.
