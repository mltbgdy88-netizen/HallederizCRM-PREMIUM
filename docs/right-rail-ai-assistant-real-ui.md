# Production-safe Right Rail AI Assistant UI

## Amac
Dashboard sag kolonundaki AI Asistan panelini fake video/fake voice/fake success davranislarindan arindirip gercek endpoint tabanli, production-safe bir UX'e tasimak.

## Component yapisi
- `DashboardAiAssistantPanel` dashboard right-rail compact paneli olarak calisir.
- Full AI yonetimi ve knowledge CRUD icin `/ai` sayfasi korunur.

## Media panel durust davranis standardi
- Gercek video kaynagi yoksa oynatma simulasyonu yok.
- Panel, model/servis hazirlik durumunu acikca gosterir.
- `ready`, `degraded`, `not_configured`, `blocked` durumlari kullanilir.

## Chat ve quick action davranisi
- Hizli aksiyonlar gercek prompt tetikler.
- Chat sonucu endpointten donen yaniti gosterir.
- `mutationExecuted:false` ve `externalProviderCallExecuted:false` bilgisi gizlenmez.
- Asistan cevabi mutation veya canli kanal gonderimi olarak sunulmaz.

## Voice davranisi
- Voice provider hazir degilse fake transcript/audio uretilmez.
- "Son yaniti seslendir" aksiyonu yalnizca provider durumu uygunsa calisir.
- Hata/degraded/not_configured nedenleri acik metinle gosterilir.

## Health/degraded state standardi
- Health banner model, fallback, local-ai-service ve voice durumlarini birlikte verir.
- 8008 kapali ama 11434 acik senaryosu partial/degraded olarak yansitilir.

## Dashboard entegrasyonu
- Panel dashboard split side bolgesinde calisir.
- Ana grid akisi bozulmadan compact varyantta sunulur.
- Mobil/tablet duzende mevcut split davranisi korunur.

## Guvenlik kurallari
- API cagrilarinda mevcut cookie tabanli auth modeli korunur.
- localStorage/sessionStorage token kullanimi eklenmez.
- Production gate/degraded cevaplari basari gibi gosterilmez.
- Otonom kritik action veya canli auto-send acilmaz.

## Bilerek yapilmayanlar
- Gercek video stream altyapisi
- Otonom AI execution
- Full mikrofon streaming implementasyonu
- WhatsApp live auto-send
