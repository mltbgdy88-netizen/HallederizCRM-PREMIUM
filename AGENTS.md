# AGENTS.md — HallederizCRM Agent Instructions

Bu repo **HallederizCRM birleştirme sandbox**'ıdır (`xxxhallederizcrm`).

- PREMIUM altyapı (API, DB, SDK, worker) + Final referans UI birleşimi
- Birleştirme durumu: [`docs/MERGE_STATUS.md`](docs/MERGE_STATUS.md)
- Takım komuta yapısı: [`docs/TEAM_ORCHESTRATION.md`](docs/TEAM_ORCHESTRATION.md) — Baş mühendis görev dağıtır; uzmanlar uygular; QA doğrular
- Orijinal kaynaklar read-only: `HallederizCRM-PREMIUM-CURSOR`, `hallederizcrm final`

## Varsayılan davranış

- Önce mevcut dosyaları incele.
- Gereksiz refactor yapma.
- Kabul edilmiş tasarımları bozma.
- Sadece istenen kapsamda değişiklik yap.
- Büyük mimari değişiklikleri kullanıcının açık onayı olmadan yapma.

## UI işleri

UI işi verildiyse:
- Sadece apps/web ve gerekirse packages/ui içinde çalış.
- Backend/API/database/auth/worker dosyalarına dokunma.
- Ölçülü referans görselleri dikkate al.
- 1920x1080 hedef viewport için body scroll ve yatay scroll üretme.
- Kartları kırpma.
- Emoji ikon kullanma.
- Profesyonel CRM görünümü koru.

## AI ve onay mimarisi

- AI müşteriyle **konuşabilir** (bilgi yanıtı, taslak mesaj); **gönderim ve CRM mutation** policy + onay (+ düşük riskte otomatik onay) + dispatcher zincirinden geçer.
- AI doğrudan kritik CRM mutation veya canlı outbound mesaj **çalıştırmaz** (UI bypass yok).
- Bilgi → read-only yanıt; işlem → proposal → onay → execution.
- Mutation işlemleri: permission → policy → approval → transaction → audit → outbox.
- UI butonları başarılı işlemden sonra toast gösterir ve disabled olur; demo’da sahte canlı başarı yok.
- Tam bağlayıcı model: [`docs/AI_OMNICHANNEL_ARCHITECTURE_ALIGNMENT.md`](docs/AI_OMNICHANNEL_ARCHITECTURE_ALIGNMENT.md)

## Komutlar

Kullanıcı özellikle istemedikçe komut çalıştırmadan önce bildir.
PowerShell komutları tek parça, kopyala-yapıştır çalışacak şekilde verilmelidir.
