# PREMIUM karar envanteri (birleştirme özeti)

Orijinal tam metin: `HallederizCRM-PREMIUM-CURSOR/docs/DECISIONS.md`, sandbox: `docs/DECISIONS.md`.

## Mimari (değişmez)

- Çok kiracılı CRM; tenant dışı veri yasak.
- AI **doğrudan kritik mutation yapmaz**; öneri + onay bileti.
- Mutation zinciri: permission → policy/onay → transaction → audit/timeline → outbox.
- Local-first AI; production fail-closed; sessiz mock başarı yok.

## UI / shell

- Sol menü sade; **AI ana kolon yalnızca Dashboard**.
- Hızlı İşlem = yeni kayıt/fiş merkezi; geçmiş işlemler Arşiv mantığında.
- Arşiv tek sol menü kalemi (alt menü yok).
- Referans PNG = **layout + palet**; iş verisi PREMIUM kaynaklarından.

## WhatsApp / omnichannel

- Webhook: imza, idempotency, token hash; secret yoksa verify geçmez.
- `ONAY` / `RED` / `INCELE` komutları: yetkili telefon + hash + audit.
- Hibrit akış: kural + AI + policy + insan veya düşük riskli otomasyon → execution.

## Birleştirme sandbox

- Kaynak UI: `hallederizcrm final` (read-only).
- Kaynak backend: `HallederizCRM-PREMIUM-CURSOR` (read-only).
- Geliştirme: `xxxhallederizcrm` — `useReferenceData` + modül adapter’ları.
