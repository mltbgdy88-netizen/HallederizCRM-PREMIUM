# Fallback Davranisi

Bu dokuman, canli provider baglantisi olmadiginda sistemin kontrollu davrandigini aciklar.

## AI
- Canli anahtar/model yoksa AI fallback/mock moda gecer.
- Mutation iceren oneriler dogrudan execute edilmez; approval zinciri korunur.
- UI tarafinda servis durumu `fallback` veya `misconfigured` olarak gorulur.

## WhatsApp
- Provider tanimsiz veya eksik config varsa outbound canli gonderim yapilmaz.
- Islem sonucu fallback/error olarak loglanir.
- Onay/aksiyon zinciri bozulmaz, sadece transport canliya cikmaz.

## ERP
- Canli baglanti yoksa sync/test denemeleri kontrollu fallback sonucu dondurur.
- Hata nedeni `reason` ve `details` alanlarinda gorunur.

## Factory
- Canli endpoint yoksa stok/siparis sync fallback/error kaydi uretir.
- Sistem ekranlari calismaya devam eder, yalnizca adapter canli sonucu donmez.

## Local Agent
- `LOCAL_AGENT_MODE=disabled` ise queue isleri beklemede kalir ve status `disabled` olur.
- Enabled ama eksik config varsa `misconfigured/fallback` gorulur.
- Save/print dry-run testleri ile zincir kontrol edilebilir.

## Operasyonel Risk Notu
- Fallback modu, uygulamayi durdurmadan calismayi surdurmek icindir.
- Staging/canli gecis oncesi hedef: kritik servislerin `healthy + live` olmasi.

