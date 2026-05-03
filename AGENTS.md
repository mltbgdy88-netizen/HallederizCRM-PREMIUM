# AGENTS.md — HallederizCRM Agent Instructions

Bu repo HallederizCRM-PREMIUM projesidir.

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

- AI proposal-only çalışır.
- AI doğrudan CRM verisi değiştirmez.
- Mutation işlemleri backend policy + approval + transaction + audit + outbox zincirinden geçer.
- UI butonları başarılı işlemden sonra toast gösterir ve disabled olur.

## Komutlar

Kullanıcı özellikle istemedikçe komut çalıştırmadan önce bildir.
PowerShell komutları tek parça, kopyala-yapıştır çalışacak şekilde verilmelidir.
