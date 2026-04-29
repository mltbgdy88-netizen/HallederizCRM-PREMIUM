# Pilot Blocker Fix Report

Tarih: 2026-04-29
Batch: Paket A - Pilot Blocker Fix Batch

## 1. Kapatilan P0 blokajlar
- `approval -> execution` zinciri destekli aksiyonlarda status-only davranistan cikarildi.
- `/approvals/:id/execute` artik:
  - approval durumunu kontrol ediyor (`approved` degilse `approval_not_approved`)
  - aksiyonu cozumluyor
  - approval execution kaydi olusturup dispatch calistiriyor
  - sonucu approval kaydina geri yaziyor (`execution.result`, `executedAt`)
- Desteklenmeyen aksiyonlar sessiz no-op yerine `execution_action_not_active` ile acik sekilde donuyor.
- `/onaylar/[approvalId]` ekraninda `Onayla`, `Reddet`, `Icra Et` butonlari gercek backend mutation'lara baglandi.
- Belge detayinda output queue gozlenebilirligi artirildi:
  - print jobs
  - file save jobs
  - local-agent health ozeti
- Invalid detail id durumunda yanlis kayda dusme riski azaltildi (ilgili detail route/hook'lar null/not-found semantigine cekildi).

## 2. Kapatilan P1 iyilestirmeler
- `/onaylar` listesinde secili satir + sag panel senkronu guclendirildi.
- Onay tablosuna gorunur `Detay` aksiyonu eklendi.
- Staging kontrol ekraninda servis durum etiketi daha kullanici dostu hale getirildi:
  - Hazir
  - Demo / Fallback
  - Yapilandirma Eksik
  - Devre Disi
  - Hata
- Test aksiyonlari sonrasinda geri bildirim metni netlestirildi.
- Pilot readiness veri modelinde `readinessState` eklendi:
  - `go_live_blocker`
  - `demo_gap`
  - `warning`
  - `ready`

## 3. Kalan P2 UX isleri
- Bazi modullerde filtreler hala foundation seviyesinde ve etkisi sinirli.
- Bir kisim listede secili satir/side panel davranisi daha da standartlastirilabilir.
- Butun liste ekranlarinda tek tip gorunur `Detay / Ac` aksiyonu tamamlama isi devam etmeli.

## 4. Hala pilot oncesi risk tasiyan noktalar
- Approval aksiyon esleme tablosu desteklenen key setiyle calisiyor; yeni policy key'ler eklendiginde map genisletilmeli.
- Local agent tarafi staging dry-run ve queue lifecycle gorunur durumda, ancak canli yazici/surucu ortami hala ayrica sahada dogrulanmali.
- Entegrasyonlarda fallback/live/misconfigured ayrimi daha net, fakat canli secret/env yoksa dogal olarak fallback calisir.
