# Decision Alignment Closure Report

Tarih: 2026-04-29
Kapsam: Decision Alignment Closure Batch (karar dili sabitleme + UI helper hizalama)

## 1. Temizlenen route/dokuman uyumsuzluklari

- Canonical route seti net korundu:
  - `/gorevler`
  - `/onaylar`
  - `/ai/onaylar`
  - `/ai/icgoruler`
  - `/ayarlar/pilot-hazirlik`
  - `/ayarlar/staging-kontrol`
- Legacy route adlari dokumanlarda yalnizca alias/gecmis notu seviyesinde tutuldu.
- `docs/gap-notes.md` icine UI route ve API endpoint ayrimi notu eklendi.

## 2. Bayi self-service metin duzeltmeleri

- Ayrik dis portal/login algisini engelleyen karar metni korunup pekistirildi:
  - ana web uygulama = ic personel cockpit'i
  - harici etkileþim = WhatsApp + belge paylasimi + onayli bilgi akisi
- Bu dil, spec/architecture/module-map/pilot dokumanlarinda tutarli kaldý.

## 3. AI local-first gorunurlugu icin yapilan degisiklikler

- `/ai/onaylar` aciklamasi local-first + proposal/approval zinciri vurgusuna cekildi.
- `/ai/icgoruler` aciklamasi local-first read-only analiz diliyle hizalandi.
- Staging kontrol ekraninda dry-run/foundation testlerin canli etkiden farki daha net metinlendi.

## 4. Foundation/no-op aksiyon etiketleme standardi

- AI onay detay panelindeki backend'e bagli olmayan butonlar:
  - `Onayla (Foundation)`
  - `Reddet (Foundation)`
  - `Execution Kaydi (Foundation)`
- Staging kontrol test geri bildirimi local-agent icin acikca `dry-run` olarak ayrildi.
- Genel standard: canli etki yoksa `(Foundation)` etiketi + kisa helper metni.

## 5. Approval coverage gorunurlugu icin eklemeler

- `/ai/onaylar` sayfasina `Approval Coverage` bilgi paneli eklendi.
- `docs/local-first-ai-decision.md` icine operator aksiyonlari icin approval coverage matrisi eklendi:
  - create_offer
  - create_order
  - create_payment
  - mark_warehouse_ready
  - complete_delivery
  - create_invoice
  - create_return
  - send_document_whatsapp
  - queue_document_save
  - queue_document_print

## 6. Hala bilincli birakilan karar farklari

- Bazi modullerde foundation/no-op akisyonlar, canli provider/persistence kapsami tamamlanana kadar bilincli korunuyor.
- Demo/fallback ve live ayrimi genel olarak net, ancak moduller arasi tam davranissal parity icin kademeli iyilestirme devam ediyor.
