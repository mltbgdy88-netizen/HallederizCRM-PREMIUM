# UI Master Tasarım Backlog — Tüm sayfa ve katmanlar

Bu doküman **B seçeneği** çıktısıdır: her route/katman için referans şablonu, PNG durumu ve kod hedefi.  
Kanonik süreç: `UI_DESIGN_TEAM_WORKFLOW.md` (referans onayı → bire bir kod).

**Son güncelleme:** 2026-05-26

---

## Referans şablonları (A–I)

| Kod | Şablon | Ne içerir | Sprint 1 örnek |
|-----|--------|-----------|----------------|
| **A** | Liste operasyon masası | Başlık + 3 aksiyon, KPI 4–6, filtre 42–50px, liste + **AKSİYON** kolonu, sağ panel 320–350px, demo band 18–22px | `/stok`, `/teklifler` |
| **B** | Entity detay masası | Katman sekmeleri, kimlik özeti, ana kart + yan bağlam, timeline/not; büyük grafik yok | `/siparisler/{id}` (hedef) |
| **C** | Entity katman masası | **A** ile aynı şema; modül bağlamı (ör. Cari finans, Sipariş satırlar) | — (henüz yok) |
| **D** | Özel komut masası | Modüle özel düzen (onay 3 kolon, hızlı işlem workbench, dashboard+AI) | `/onaylar`, `/dashboard` |
| **E** | Form | FormPageShell / adım formu; liste masası şeması **değil** | `/cariler/yeni`, `/tahsilatlar/yeni` |
| **F** | Hub | Yönlendirme + CTA (Hızlı İşlem); tam form değil | `/teklifler/yeni`, `/siparisler/yeni` |
| **G** | Sistem / state | Login, unauthorized, offline, demo, live-empty | `/login`, `/unauthorized` |
| **H** | Çok panelli iletişim | 3 panel inbox / WA operasyon paneli | `/gelen-kutu`, `/whatsapp` |
| **I** | Catch / geçici | `ProductPageShell` veya readiness merkezi — **hedef şablona dönüşecek** | Çoğu `[...slug]` |

### PNG adlandırma (üretilecek)

`docs/design/reference/{modul}-{sayfa}-acik-mod.png` — 1920×1080, açık mod, onaylı.

---

## Kod durumu kodları

| Kod | Anlam |
|-----|--------|
| **BIREBIR** | Referans onaylı + layout bire bir (Kontrol Şefi ONAY) |
| **KISMI** | Operasyon masası var; PNG yok veya kolon/panel/yoğunluk sapması |
| **ZEMIN** | Yalnızca `#fdfcf9` canvas / token (Restore) |
| **READINESS** | `InventoryCommandCenterPage` — geçici, hedef **B** veya **C** |
| **LEGACY** | Eski `EntityListPageTemplate` / commercial entity; hedef **A** |

---

## Özet sayılar

| Metrik | Değer |
|--------|-------|
| Ana route + katman (bu tablo) | **~95** satır |
| Referans PNG repoda (`docs/design/reference/`) | **4** |
| BIREBIR (Sprint 1 + tam masa) | **~10** |
| READINESS / geçici katman | **~25** |
| ZEMIN veya KISMI (masa eksik) | **~40** |
| LEGACY / henüz masa yok | **~20** |

---

## Sprint 1 — Sidebar liste masaları ✅ (referans kilidi)

| Route | Şablon | Referans PNG | Kod | Not |
|-------|--------|--------------|-----|-----|
| `/stok` | A | `stok-operasyon-masasi-acik-mod.png` ✅ | BIREBIR | |
| `/archive` | A | `arsiv-operasyon-merkezi-acik-mod.png` ✅ | BIREBIR | |
| `/raporlar` | A | `rapor-operasyon-merkezi-acik-mod.png` ✅ | BIREBIR | |
| `/whatsapp` | H | `whatsapp-operasyon-paneli-acik-mod.png` ✅ | BIREBIR | H şeması, A yoğunluğu |

---

## P0–P4 — Çekirdek operasyon (hedef: A veya D)

| Route | Şablon | Referans PNG | Kod | Sprint | Not |
|-------|--------|--------------|-----|--------|-----|
| `/dashboard` | D | YOK | ZEMIN | P0 | AI kolon; PNG: `dashboard-operasyon-acik-mod.png` |
| `/hizli-islem` | D | YOK | ZEMIN | P0 | Workbench; PNG: `hizli-islem-satis-masasi-acik-mod.png` |
| `/hizli-islem/*` (alt) | D | YOK | KISMI | P0 | sipariş, teklif, tahsilat, teslim, iade, sonuç, etki |
| `/onaylar` | D | YOK | KISMI | P1 | 3 kolon desk; PNG onayı gerek |
| `/onaylar/[id]` | B | YOK | KISMI | P1 | Detay + karar |
| `/onaylar/bekleyenler` | A | YOK | READINESS | P1 | → **A** kuyruk masası |
| `/onaylar/inceleme` | A | YOK | READINESS | P1 | |
| `/onaylar/tamamlananlar` | A | YOK | READINESS | P1 | |
| `/onaylar/limitler` | A | YOK | READINESS | P1 | Matris / liste |
| `/onaylar/kurallar` | A | YOK | LEGACY | P1 | Rol matrisi |
| `/cariler` | A | YOK | KISMI | P2 | Liste masa; PNG: `cariler-operasyon-masasi-acik-mod.png` |
| `/cariler/liste` | A | YOK | READINESS | P3 | Alias → ana liste |
| `/siparisler` | A | YOK | KISMI | P3 | `orders-desk`; PNG: `siparisler-operasyon-masasi-acik-mod.png` |
| `/siparisler/liste` | A | YOK | READINESS | P3 | |
| `/teklifler` | A | YOK | KISMI | P4 | PNG: `teklifler-operasyon-masasi-acik-mod.png` (kullanıcı onaylı referans) |
| `/teklifler/liste` | A | YOK | READINESS | P3 | |

---

## Sprint 2 — Ticari modüller (hedef: **A** liste + **B** detay)

| Route | Şablon | Referans PNG | Kod | Not |
|-------|--------|--------------|-----|-----|
| `/tahsilatlar` | A | YOK | KISMI | En tam masa; PNG kilidi gerek |
| `/tahsilatlar/[id]` | B | YOK | LEGACY | |
| `/tahsilatlar/yeni` | E | YOK | KISMI | Form |
| `/tahsilatlar/liste` | A | YOK | LEGACY | Alias |
| `/teslimatlar` | A | YOK | KISMI | Zemin + intro; **A** bire bir bekliyor |
| `/teslimatlar/[id]` | B | YOK | LEGACY | |
| `/teslimatlar/yeni` | E | YOK | LEGACY | |
| `/teslimatlar/liste` | A | YOK | LEGACY | |
| `/teslimatlar/rota` | A | YOK | I→A | Catch; hedef rota masası |
| `/faturalar` | A | YOK | KISMI | |
| `/faturalar/[id]` | B | YOK | LEGACY | |
| `/faturalar/yeni` | E | YOK | KISMI | |
| `/faturalar/liste` | A | YOK | LEGACY | |
| `/iadeler` | A | YOK | KISMI | |
| `/iadeler/[id]` | B | YOK | LEGACY | |
| `/iadeler/yeni` | E | YOK | LEGACY | |
| `/depo` | A | YOK | KISMI | Depo hazırlık; özel KPI/chip — PNG: `depo-hazirlik-masasi-acik-mod.png` |
| `/depo/emirler/[id]` | B | YOK | KISMI | Fiş detay |
| `/fabrikalar/stoklar` | A | YOK | KISMI | |
| `/fabrikalar/siparisler` | A | YOK | KISMI | |
| `/fabrikalar/siparisler/[id]` | B | YOK | LEGACY | |

**Sprint 2 kural:** Liste satırı `KISMI` olanlar → önce PNG → sonra **BIREBIR**; `READINESS` kullanılmaz (ticari modülde).

---

## Sprint 3 — CRM entity detay + katmanlar (hedef: **B** kök + **C** alt)

### Cariler

| Route | Şablon | Referans PNG | Kod | Hedef bileşen |
|-------|--------|--------------|-----|----------------|
| `/cariler/[id]` | B | YOK | LEGACY | `CustomerDetailPage` → detay masası |
| `/cariler/[id]/ozet` | C | YOK | READINESS | Cari özet katman masası |
| `/cariler/[id]/iletisim` | C | YOK | READINESS | |
| `/cariler/[id]/finans` | C | YOK | READINESS | |
| `/cariler/[id]/teklifler` | C | YOK | READINESS | |
| `/cariler/[id]/siparisler` | C | YOK | READINESS | |
| `/cariler/[id]/tahsilatlar` | C | YOK | READINESS | |
| `/cariler/[id]/timeline` | C | YOK | READINESS | |
| `/cariler/yeni` | E | YOK | KISMI | Form |

### Siparişler

| Route | Şablon | Referans PNG | Kod | Hedef bileşen |
|-------|--------|--------------|-----|----------------|
| `/siparisler/[id]` | B | YOK | LEGACY | `OrderDetailPage` |
| `/siparisler/[id]/ozet` | C | YOK | READINESS | |
| `/siparisler/[id]/satirlar` | C | YOK | READINESS | |
| `/siparisler/[id]/odeme-tahsilat` | C | YOK | READINESS | |
| `/siparisler/[id]/teslimat` | C | YOK | READINESS | |
| `/siparisler/[id]/fatura` | C | YOK | READINESS | |
| `/siparisler/[id]/iade` | C | YOK | READINESS | |
| `/siparisler/[id]/depo-stok-etkisi` | C | YOK | READINESS | |
| `/siparisler/[id]/timeline` | C | YOK | READINESS | |
| `/siparisler/yeni` | F | YOK | KISMI | Hub |

### Teklifler

| Route | Şablon | Referans PNG | Kod | Hedef bileşen |
|-------|--------|--------------|-----|----------------|
| `/teklifler/[id]` | B | YOK | LEGACY | `OfferDetailPage` |
| `/teklifler/[id]/ozet` | C | YOK | READINESS | |
| `/teklifler/[id]/satirlar` | C | YOK | READINESS | |
| `/teklifler/[id]/musteri` | C | YOK | READINESS | |
| `/teklifler/[id]/siparise-donusturme` | C | YOK | READINESS | |
| `/teklifler/[id]/belgeler` | C | YOK | READINESS | |
| `/teklifler/[id]/timeline` | C | YOK | READINESS | |
| `/teklifler/yeni` | F | YOK | KISMI | Hub |

**Sprint 3 kural:** `READINESS` → her katman için **C** şablonunda PNG + bire bir; kök **B** için tek referans + sekmeler.

---

## Sprint 4 — İletişim, belge, görev (hedef: **A** / **H** / **B**)

| Route | Şablon | Referans PNG | Kod | Not |
|-------|--------|--------------|-----|-----|
| `/gelen-kutu` | H | YOK | KISMI | 3 panel |
| `/gelen-kutu/konusma/[id]` | B | YOK | KISMI | |
| `/belgeler` | A | YOK | LEGACY | |
| `/belgeler/[id]` | B | YOK | LEGACY | |
| `/belgeler/yeni` | E | YOK | LEGACY | |
| `/belgeler/liste` | A | YOK | LEGACY | |
| `/belgeler/arsiv` | A | YOK | LEGACY | |
| `/belgeler/sablonlar` | A | YOK | I | Catch |
| `/gorevler` | A | YOK | LEGACY | |
| `/gorevler/[id]` | B | YOK | LEGACY | |
| `/gorevler/benim-gorevlerim` | A | YOK | I | |
| `/gorevler/ekip-gorevleri` | A | YOK | I | |
| `/gorevler/gecikenler` | A | YOK | I | |
| `/gorevler/merkez` | A | YOK | I | |
| `/gorevler/otomatik-gorevler` | A | YOK | I | |
| `/ai` | D | YOK | KISMI | Hub; chat kolonu yok |
| `/ai/onaylar` | A | YOK | KISMI | Köprü |
| `/ai/icgoruler` | D | YOK | KISMI | Salt okunur kartlar |
| `/raporlar/[...]` | A | YOK | KISMI | Alt rapor catch |

---

## Sprint 5 — Ayarlar ve sistem (hedef: **G** / **A**)

| Route | Şablon | Referans PNG | Kod | Not |
|-------|--------|--------------|-----|-----|
| `/login` | G | YOK | KISMI | Split login |
| `/panel` | — | — | REDIR | → dashboard |
| `/unauthorized` | G | YOK | KISMI | |
| `/offline-api` | G | YOK | KISMI | |
| `/demo-mode` | G | YOK | KISMI | |
| `/live-empty` | G | YOK | KISMI | |
| `/ayarlar` | A | YOK | KISMI | Hub layout |
| `/ayarlar/*` | I→A | YOK | I | Catch-all |
| `/kullanicilar` | A | YOK | LEGACY | |
| `/kullanicilar/roller` | A | YOK | LEGACY | |
| `/erp` | A | YOK | KISMI | |
| `/kurulum/*` | I | YOK | I | Kurulum catch |
| `/workflow/[type]/[id]` | B | YOK | KISMI | Timeline |
| `mobile-drawer` | — | YOK | DAVRANIS | Shell katmanı |
| `print-export` | — | YOK | KISMI | Print CSS katmanı |

---

## Öncelikli PNG üretim kuyruğu (önerilen)

Sıra, kullanıcı görünürlüğü + mevcut kısmi kod:

1. `teklifler-operasyon-masasi-acik-mod.png` (P4 — referans kilit)
2. `siparisler-operasyon-masasi-acik-mod.png`
3. `cariler-operasyon-masasi-acik-mod.png`
4. `tahsilatlar-operasyon-masasi-acik-mod.png`
5. `teslimatlar-operasyon-masasi-acik-mod.png`
6. `faturalar-operasyon-masasi-acik-mod.png`
7. `iadeler-operasyon-masasi-acik-mod.png`
8. `depo-hazirlik-masasi-acik-mod.png`
9. `onaylar-komut-masasi-acik-mod.png`
10. Entity katman örnekleri: `cari-finans-katman-acik-mod.png`, `siparis-satirlar-katman-acik-mod.png`

---

## Çalışma paketi (kod — PNG onayı sonrası)

Her satır için Kontrol Şefi checklist (`ui-designer-rules.mdc` §11) +:

```text
Route: /teslimatlar
Şablon: A
Referans: docs/design/reference/teslimatlar-operasyon-masasi-acik-mod.png
Önceki kod: KISMI
Hedef kod: BIREBIR
```

---

## İlişkili dokümanlar

- `docs/development/UI_DESIGN_TEAM_WORKFLOW.md` — süreç ve sprint özeti
- `docs/product/UI_ROUTE_COVERAGE_MATRIX.md` — route var/yok teknik matrisi
- `.cursor/rules/10-reference-design-fidelity.mdc` — bire bir sadakat kuralı
