# P0 Operasyon Ekranları — Merge Specialist Raporu

**Tarih:** 2026-05-27  
**Kapsam:** Phase 2 P0 modülleri (`dashboard`, `hizli-islem`, `onaylar`, `cariler`, `teklifler`, `siparisler`, `tahsilatlar`, `belgeler`, `whatsapp`)  
**Agent:** P0 Operasyon Ekranları Uzmanı

---

## Özet

Ana P0 route'ları Final referans `*Page.tsx` bileşenlerine bağlı. Legacy alias ve PREMIUM alt route'lar temizlendi; P0 adapter typecheck hataları giderildi. Route link denetiminde `/arsiv` kullanımı bulunmadı (`/archive` kanonik).

---

## 1. Route → Final referans doğrulaması

| Route | Bileşen | Durum |
|-------|---------|-------|
| `/dashboard` | `DashboardReferencePage` | OK |
| `/dashboard/gosterge-paneli` | `DashboardGostergePaneliPage` | OK |
| `/hizli-islem` | `HizliIslemMerkeziPage` | OK |
| `/hizli-islem/satis-masasi` | `HizliIslemSatisMasasiPage` | OK |
| `/onaylar` | `OnaylarKomutMasasiPage` | OK |
| `/onaylar/kurallar` | `OnaylarKurallarMatrisPage` | OK |
| `/onaylar/detay` | `OnaylarDetayKararPage` | OK |
| `/cariler` | `CarilerOperasyonPage` | OK |
| `/cariler/detay` | `CarilerDetayMasasiPage` | OK |
| `/cariler/yeni` | `CarilerYeniFormPage` | OK |
| `/cariler/katman/*` | `CarilerKatman*Page` | OK |
| `/teklifler` | `TekliflerOperasyonPage` | OK |
| `/teklifler/detay` | `TekliflerDetayMasasiPage` | OK |
| `/teklifler/yeni` | `TekliflerYeniHubPage` | OK |
| `/teklifler/katman/*` | `TekliflerKatman*Page` | OK |
| `/siparisler` | `SiparislerOperasyonPage` | OK |
| `/siparisler/detay` | `SiparislerDetayMasasiPage` | OK |
| `/siparisler/yeni` | `SiparislerYeniHubPage` | OK |
| `/siparisler/katman/*` | `SiparislerKatman*Page` | OK |
| `/tahsilatlar` | `TahsilatlarOperasyonPage` | OK |
| `/tahsilatlar/detay` | `TahsilatlarDetayMasasiPage` | OK |
| `/tahsilatlar/yeni` | `TahsilatlarYeniFormPage` | OK |
| `/belgeler` | `BelgelerOperasyonPage` | OK |
| `/belgeler/detay` | `BelgelerDetayPage` | OK |
| `/belgeler/yeni` | `BelgelerYeniFormPage` | OK |
| `/whatsapp` | `WhatsAppOperasyonPaneliPage` | OK |

---

## 2. Düzeltilen legacy route'lar

| Route | Önceki | Sonraki |
|-------|--------|---------|
| `/cariler/liste` | `CustomersPage` | `redirect → /cariler` |
| `/teklifler/liste` | `OffersPage` | `redirect → /teklifler` |
| `/siparisler/liste` | `SiparislerListeCommandCenterPage` | `redirect → /siparisler` |
| `/onaylar/bekleyenler` | `ApprovalInboxPage` | `OnaylarKomutMasasiPage` |
| `/onaylar/inceleme` | `ApprovalInboxPage` | `OnaylarKomutMasasiPage` |
| `/onaylar/tamamlananlar` | `ApprovalInboxPage` | `OnaylarKomutMasasiPage` |
| `/onaylar/limitler` | `OnaylarLimitlerCommandCenterPage` | `OnaylarKurallarMatrisPage` |
| `/onaylar/[approvalId]` | `ApprovalDetailPage` + CommandCenter shell | `OnaylarDetayKararPage` |
| `/tahsilatlar/[paymentId]` | `PaymentDetailPage` | `TahsilatlarDetayMasasiPage` |
| `/belgeler/[documentId]` | `DocumentDetailPage` | `BelgelerDetayPage` |
| `/hizli-islem/tahsilat\|siparis\|teklif\|iade\|teslim\|sonuc\|etki-analizi` | `QuickOperationPage` / Readiness | `redirect → /hizli-islem` |

---

## 3. Bilinçli olarak korunan PREMIUM paralel route'lar

`docs/MERGE_ROUTE_MAP.md` uyarınca canlı API fazı için dynamic route'lar paralel tutuldu (Final mock `detay` / `katman` ile çakışmaz):

- `/cariler/[customerId]/*` — CommandCenter + `customers` feature
- `/teklifler/[offerId]/*` — CommandCenter + `offers` feature
- `/siparisler/[orderId]/*` — CommandCenter + `orders` feature

Mock navigasyon bu static route'ları kullanır; dynamic route'lar API entegrasyonu için ayrılmıştır.

---

## 4. Route link denetimi (`/arsiv` → `/archive`)

P0 feature dosyalarında (`src/features/{dashboard,...,whatsapp}/**`) `/arsiv`, `/demo`, `/empty`, `/offline` kalıbı **bulunmadı**.

- `dashboard-reference-mock.ts` sidebar: `href: "/archive"` — OK
- Katman mock'ları (`cariler`, `teklifler`, `siparisler`): static `/…/katman/…` path'leri — OK

---

## 5. Typecheck düzeltmeleri (P0 scope)

| Dosya | Sorun | Çözüm |
|-------|-------|-------|
| `cariler-reference-adapter.ts` | `taxNo`, `customerGroup` yok | `taxNumber`, `resolveCustomerDisplayType(type)` |
| `siparisler-reference-adapter.ts` | `requestedDeliveryDate`, `contactPerson` yok | `updatedAt` / `lastActionLabel`; contact `"—"` |
| `tahsilatlar-reference-adapter.ts` | `note` yok | `description` |
| `teklifler-reference-adapter.ts` | `contactPerson` yok | contact `"—"` |
| `dashboard-reference-adapter.ts` | `DashboardActivityRow.href` yok | `channel` kullanıldı |
| `OnaylarKomutMasasiPage.tsx` | `selectedItem` (örnek hata) | Zaten kullanılıyor (detay panel ikonu); hata yok |

---

## 6. Mock veri görünürlüğü

Final referans sayfalar demo snapshot'ları doğrudan mock modüllerden yüklüyor:

- Dashboard: `dashboard-reference-mock.ts`
- Cariler: `cariler-operasyon-mock.ts` (+ adapter demo fallback)
- Teklifler / Siparişler / Tahsilatlar: `*-operasyon-mock.ts`
- Onaylar: `onaylar-komut-masasi-mock.ts`, `onaylar-detay-karar-mock.ts`
- Belgeler: `belgeler-operasyon-mock.ts`
- Hızlı İşlem: `hizli-islem-merkezi-mock.ts`
- WhatsApp: operasyon mock seti

Operasyon sayfalarında ilk satır seçimi ve sağ panel dolu açılış mock getter'lar üzerinden korunuyor (`getComContext`, `getTomContext`, `getSipContext`, `getThmContext`, `getOkmDetailForId` vb.).

---

## 7. Test sonuçları

```text
pnpm --filter @hallederiz/web typecheck   → PASS
pnpm --filter @hallederiz/ui typecheck    → PASS
pnpm smoke:navigation                     → PASS (24 kritik bağlantı)
```

---

## 8. Dokunulmayan alanlar

- Shell (`platform-shell`, `ReferenceAppShell`, sidebar)
- Login / auth
- Stok, arşiv, raporlar, ayarlar ve diğer Phase 3+ modüller
- `apps/api`, `packages/database`, `packages/domain`, worker

---

## 9. Kalan risk / takip

1. **Dynamic PREMIUM route'lar** hâlâ CommandCenter kullanıyor; canlı API bağlandığında mock ID → dynamic yönlendirme planlanmalı.
2. **Hızlı İşlem workbench alt tab URL'leri** (`/hizli-islem/tahsilat` vb.) artık `/hizli-islem`'e yönleniyor; eski bookmark'lar kırılır (Final referansta karşılığı yok).
3. Görsel satır yoğunluğu (1920×1080 ≥5 satır) bu turda otomatik ölçülmedi — yerelde doğrulanmalı.

---

## Değişen dosyalar (özet)

**Route pages:** `cariler/liste`, `teklifler/liste`, `siparisler/liste`, `onaylar/{bekleyenler,inceleme,tamamlananlar,limitler,[approvalId]}`, `tahsilatlar/[paymentId]`, `belgeler/[documentId]`, `hizli-islem/{tahsilat,siparis,teklif,iade,teslim,sonuc,etki-analizi}`

**Adapters:** `cariler-reference-adapter.ts`, `siparisler-reference-adapter.ts`, `tahsilatlar-reference-adapter.ts`, `teklifler-reference-adapter.ts`, `dashboard-reference-adapter.ts`

**Rapor:** `docs/team-reports/p0-screens-specialist.md`
