# Design Ops Playbook — Referans UI Fabrikası

**Design Director:** Ana Cursor agent  
**Hedef:** Zip’teki 81 PNG → `apps/web` rotalarında bire bir, kompakt, scroll’suz UI.

---

## Altın referans (kopyalanacak kalıp)

| Öğe | Örnek |
|-----|--------|
| Sayfa | `DashboardGostergePaneliPage.tsx` |
| Mock | `dashboard-gosterge-paneli-mock.ts` |
| CSS | `dashboard-gosterge-paneli.css` |
| Route | `app/(platform)/dashboard/gosterge-paneli/page.tsx` |
| PNG | `docs/design/reference/_ek-alternatifler/dashboard-gosterge-paneli-acik-mod.png` |

**Kullanıcı onayı (2026-05):** Kompakt görünüm, referansa çok yakın — bu ölçek ve yoğunluk tüm ekranlar için hedef.

---

## Dosya konvansiyonu

```
apps/web/app/(platform)/<segment>/page.tsx          # veya (emerald), (auth)
apps/web/src/features/<module>/components/<Name>Page.tsx
apps/web/src/features/<module>/data/<name>-mock.ts
apps/web/app/styles/<name>-reference.css
docs/design/reference/<zip-path>/<file>.png
docs/design/qa-reports/<slug>.md                    # QA çıktısı
```

Slug = PNG adı `.png` olmadan (ör. `stok-operasyon-masasi-acik-mod`).

---

## Implementer checklist (her ekran)

- [ ] Referans PNG’yi piksel düzeni için incele (sütun sayısı, KPI adedi, tablo kolonları)
- [ ] Route ve layout grubu seç (`platform` / `emerald` / yok)
- [ ] Mock veri: PNG’de görünen tüm metinler
- [ ] CSS: `clamp()` + `minmax(0,1fr)` + grid; **1400px’te layout’u bozan media query ekleme** (gerekmedikçe)
- [ ] `pnpm build` yeşil
- [ ] Kendi notunda “scroll yok” doğrulaması
- [ ] Queue’da durumu `qa-review` yap, QA raporu iste

---

## Design Auditor checklist

- [ ] Doğru PNG yolu
- [ ] Layout tipi (A liste / B detay+katman / C hub / D komut masası) doğru mu?
- [ ] KPI / tablo / badge / sidebar aktif menü
- [ ] Tipografi ölçeği referansa yakın (kompakt)
- [ ] Renk tonu: operasyon = açık gri canvas `#f4f6f8` veya referanstaki warm variant — **PNG’ye uy**
- [ ] Sahte veri bire bir
- [ ] Scroll yok

**FAIL kriterleri:** Eksik panel, yanlış sütun oranı, scroll, placeholder lorem, QA’sız “bitti” iddiası.

---

## Dalga planı

| Dalga | Kapsam | Öncelik |
|-------|--------|---------|
| W0 | Onaylı POC (3 ekran) | QA + Director sign-off |
| W1 | `_ek-alternatifler` (kalan) + `00-onayli-sprint1` | Yüksek |
| W2 | `01-teklifler` | Yüksek |
| W3 | `02-siparisler` | Yüksek |
| W4 | `03-cariler` | Orta |
| W5 | `04`–`08` tahsilat/teslimat/fatura/iade/depo | Orta |
| W6 | `09`–`15` fabrika, belge, görev, kullanıcı, ERP, ayar, onay | Orta |
| W7 | `17`–`21` hızlı işlem, AI, gelen kutu, workflow, sistem | Son |

Paralel çalışma: Aynı dalgada farklı modül klasörleri → farklı implementer; **aynı PNG’ye iki agent atanmaz**.

## Sürekli hattı (Director)

- QA bitince → `DIRECTOR_INBOX.md` → Director yeni dalga atar (kuyruk bitene kadar).
- Takip: `ACTIVE_AGENTS.md`, `DIRECTOR_PIPELINE.md`.

---

## Director — REVIZE emri şablonu

```markdown
## REVIZE — <slug>
Implementer: <agent>
QA raporu: docs/design/qa-reports/<slug>.md

Zorunlu düzeltmeler:
1. ...
2. ...

Referans: docs/design/reference/<path>.png
Deadline: bir sonraki QA turu
```

---

## Port ve çalıştırma

```bash
cd "c:\Users\mevlu\Desktop\hallederizcrm final"
pnpm install
pnpm dev   # http://localhost:3011
```

**Önbellek / 500:** `pnpm dev` her açılışta `.next` temizler. `pnpm build` yalnızca dev **kapalıyken**. İki terminalde aynı anda `dev`+`build` çalıştırmayın. Acil: `pnpm stop-dev` → `pnpm dev`.
