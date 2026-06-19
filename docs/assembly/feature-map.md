# 1000 Özellik Birleştirme Haritası

Bu doküman, 1000 maddelik Amiral Gemisi CRM listesini doğrudan tek seferde çalışır kabul etmez; özellikleri uygulanabilir fazlara böler.

## Faz 1 — Çekirdek CRM

Durum: Başlatılacak.

Kapsam:

- Firma / workspace
- Kullanıcı
- Rol / yetki
- Müşteri kartı
- Firma kartı
- Kişiler
- Lead
- Fırsat
- Görev
- Dashboard

Kaynak:

- Atomic CRM
- Django CRM
- NocoBase

## Faz 2 — Satış Operasyonu

Durum: Sonraki aşama.

Kapsam:

- Teklif
- Teklif PDF
- Sipariş
- Sipariş durumları
- Pipeline
- Onay akışları

Kaynak:

- Krayin CRM
- OpenSource Startup CRM
- NocoBase workflow

## Faz 3 — Ürün / Stok / Bayi

Durum: Özel geliştirme gerekir.

Kapsam:

- Ürün kartı
- Stok
- Depo
- Şube
- Bayi
- Bayi fiyatı
- Katalog

Kaynak:

- OpenSource Startup CRM
- NocoBase
- Özel modül

## Faz 4 — Duvar Kağıdı Sektörü

Durum: Özel geliştirme gerekir.

Kapsam:

- Rulo hesabı
- Metraj hesabı
- Fire hesabı
- Oda/duvar ölçüsü
- Numune takibi
- Katalog defteri
- Askılı stant
- Usta / uygulama takibi

Kaynak:

- Tam özel modül: `packages/wallpaper-sector`

## Faz 5 — AI

Durum: Sonraki aşama.

Kapsam:

- AI cevap önerisi
- Lead scoring
- Konuşma özetleme
- Next best action
- AI rapor yorumlama

Kaynak:

- Multi-Agent Enterprise CRM
- Özel `apps/ai-gateway`

## Faz 6 — Omnichannel / Entegrasyon

Durum: Sonraki aşama.

Kapsam:

- WhatsApp
- Instagram
- Facebook
- Gmail / Outlook
- SMS
- Webhook
- API marketplace

Kaynak:

- `packages/integrations`
- Provider adapter pattern

## Kabul standardı

Bir özellik sadece listede yazdığı için tamamlanmış sayılmaz. Tamamlandı sayılması için:

1. Veri modeli olmalı.
2. API veya servis olmalı.
3. UI ekranı olmalı.
4. Yetki/tenant kontrolü olmalı.
5. En az smoke test veya manuel çalışma kanıtı olmalı.
