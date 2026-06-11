# Orders Desk Redesign — Sipariş Operasyon Masası

## Problem

`/siparisler` önceki `EntityListPageTemplate` düzeni Dashboard (#141) ve Onaylar Command Desk ile görsel/operasyonel dil uyumunu sağlamıyordu. Ödeme/tahsilat durumu liste ve önizlemede yeterince görünür değildi.

## Tasarım seçimi

**Sipariş Operasyon Masası** — intro + KPI şeridi + liste (1fr) + sağ önizleme (330px). (Policy band kaldırıldı.)

## Ürün kuralları

- **Manuel sipariş işlemleri onay beklemez** — ekranda “onaya gönder” dili yok.
- Tahsilat/sipariş oluşturma gerçek kullanıcı navigasyonudur (`/hizli-islem`, `/tahsilatlar/yeni`).
- Onay yalnızca AI/otomasyon/mesaj kaynaklı öneriler içindir; bu ekran kapsam dışı.

## Layout contract

| Bölüm | Ölçü |
|--------|------|
| Root | `calc(100dvh - 56px)`, padding 10px, overflow hidden |
| Üst blok | intro + policy + stats (~100–108px) |
| Grid | `minmax(0,1fr) 330px`, gap 10px |
| Tablo satır | 33px |
| Toolbar | 42px |

CSS: `apps/web/app/styles/orders-desk.css`  
Kök: `.hz-orders-desk`

## Payment badge mapping

| `paymentStatus` | Liste rozeti |
|-----------------|--------------|
| `paid` / `overpaid` | Ödendi |
| `partial` | Kısmi |
| `unpaid` | Bekliyor |
| eksik | Tahsilat bilgisi yok |

Tahsilat linki: `/tahsilatlar/yeni?order={id}` (desteklenen query).

## Preview panel

- Sipariş no, cari, tutar, durum
- Ödeme / Tahsilat kartı
- Sevkiyat kartı
- Son güncelleme
- Detayı Aç · Tahsilat Ekle/Gör · Hızlı İşlem

## Mobile behavior

`max-width: 860px`: tek kolon, stats 2 sütun, tam genişlik aksiyonlar.

## Button readiness

| Buton | Durum |
|-------|--------|
| Yeni Sipariş | `active-navigation` → `/hizli-islem` |
| Tahsilat Ekle | `active-navigation` → `/tahsilatlar/yeni` |
| İncele / Detayı Aç | `active-navigation` → `/siparisler/[id]` |
| Tahsilat (satır) | `active-navigation` + order query |
| Hızlı İşlem | `active-navigation` |

Fake create/success yok.

## Screenshot QA

`artifacts/orders-desk/` (commit dışı):

- `orders-1366x768.png`
- `orders-1920x1080.png`
- `orders-mobile.png`

## Known gaps

- Canlı API bağlı değilse demo veri bandı gösterilir.
- “Vadesi geldi” rozeti ayrı alan yok; `unpaid` → Bekliyor.
- Toplu durum/export bu ekranda kaldırıldı.

## Bileşenler

- `OrdersDeskPage`, `OrdersDeskIntro`, `OrdersPolicyBand`, `OrdersStatsStrip`
- `OrdersDeskList`, `OrdersDeskPreview`
- `orders-desk-view-model.ts`
