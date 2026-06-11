# UI Tasarım Ekibi — İş Akışı



Bu doküman kalan sayfaların zümrüt/altın/krem tasarım diline geçişi için ajan ekibi rol dağılımını ve sprint sürecini tanımlar.



## Master envanter (B — önce tablo, sonra kod)



**Kanonik liste:** [`UI_MASTER_DESIGN_BACKLOG.md`](./UI_MASTER_DESIGN_BACKLOG.md)



Her route/katman için:



- Referans şablonu (**A** liste masası, **B** detay, **C** katman, **D–I** özel)

- Referans PNG durumu (`docs/design/reference/*.png`)

- Kod durumu (**BIREBIR** | **KISMI** | **ZEMIN** | **READINESS** | **LEGACY**)

- Hedef sprint



**Kural:** PNG onayı olmadan satır **BIREBIR** sayılmaz. Zemin/token veya readiness geçici çözümdür.



---



## Referans üretim ve onay (aktif süreç)

| Adım | Kim | Çıktı |
|------|-----|--------|
| 1 | **Tasarım Müdürü (AI)** | `docs/design/reference/{modul}-acik-mod.png` — Sprint 1 ile aynı görsel dil |
| 2 | **Siz (ürün sahibi)** | `ONAY` veya `REVIZYON` — [`UI_REFERENCE_APPROVAL_TRACKER.md`](./UI_REFERENCE_APPROVAL_TRACKER.md) |
| 3 | **Tasarım Uzmanı (ajan)** | Onaylı PNG’ye bire bir kod |
| 4 | **Kontrol Şefi (ajan)** | Checklist + ONAY/REVİZYON raporu |

**Kilit kural:** Onaylanmamış PNG ile `BIREBIR` kod başlamaz.

## Roller

| Rol | Sorumluluk |
|-----|------------|
| **Tasarım Müdürü (AI)** | Referans görsel üretimi, dalga kuyruğu, revizyon brief’i, sprint planı |
| **Ürün sahibi (siz)** | Referans PNG onayı veya revizyon notu |
| **Tasarım Uzmanı (ajan)** | Onaylı referansa bire bir kodlama, typecheck/smoke |
| **Kontrol Şefi (ajan)** | Referans sadakati, ölçü, scroll, koyu mod |

## Zorunlu Süreç (her sayfa)



1. **Envanter** — `UI_MASTER_DESIGN_BACKLOG.md` satırı

2. **Referans görsel** — açık mod, 1920×1080, şablona uygun PNG

3. **Onay** — kullanıcı veya tasarım müdürü referansı kilitlemeden kod yok

4. **Kodlama** — referans ile bire bir: header, KPI, filtre, liste, aksiyon kolonu, sağ bağlam paneli

5. **Kontrol** — 13 maddelik self-check (`ui-designer-rules.mdc` §11)

6. **Rapor** — kontrol şefi → tasarım müdürü; red ise revizyon görevi



## Referans Şablon (liste masaları — şablon A)



- Başlık: `{Modül} Operasyon Masası`

- Üst: başlık + 3 aksiyon (birincil zümrüt, ikincil altın çerçeve)

- KPI: 4–6 kompakt kart, 34px ikon daire

- Filtre: 42–50px bant, kesik buton yok

- Liste: tablo header 28–30px, satır 42–44px, ilk görünüm ≥5 satır

- Sağ panel: 320–350px, seçili kayıt bağlamı, uyarı, sonraki adım; büyük grafik yok

- Demo band: 18–22px

- Renk: krem zemin `#fdfcf9`, zümrüt `#047857`, altın `#d4af37`



Şablon **B** (detay) ve **C** (katman) tanımları: `UI_MASTER_DESIGN_BACKLOG.md`.



## Tamamlanan Paketler (ürün — kısmi)



| Paket | Sayfalar | Gerçek durum |

|-------|----------|----------------|

| P0 | Dashboard, Hızlı Satış Masası | Zemin / kısmi — tam PNG+bire bir backlog’ta |

| P1 | Onaylar ana + alt route | Komut masası kısmi; alt route READINESS |

| P2 | Cariler liste | KISMI masa — PNG kilidi backlog’ta |

| P3 | Siparişler operasyon masası | KISMI — PNG kilidi backlog’ta |

| P4 | Teklifler operasyon masası | KISMI — PNG kilidi backlog’ta |



## Sprint 1 — Sidebar liste masaları ✅ (bire bir + PNG)



| # | Sayfa | Route | Referans | Kod |

|---|-------|-------|----------|-----|

| 1 | Stok | `/stok` | `stok-operasyon-masasi-acik-mod.png` | BIREBIR |

| 2 | Arşiv | `/archive` | `arsiv-operasyon-merkezi-acik-mod.png` | BIREBIR |

| 3 | Raporlar | `/raporlar` | `rapor-operasyon-merkezi-acik-mod.png` | BIREBIR |

| 4 | WhatsApp | `/whatsapp` | `whatsapp-operasyon-paneli-acik-mod.png` | BIREBIR |



## Restore paketi (altyapı — tasarım tamamlanmış sayılmaz)



Tek zemin: `#fdfcf9` — `operasyon-desk-reference.css` + `restore-desk-surface.css` + koyu mod sweep.



P0–P4 ana listeler için **zemin hazır**; bire bir için master backlog’taki PNG kuyruğu gerekir.



## Koyu mod



`desk-dark-mode.css` + `desk-dark-mode-sweep.css` — her **BIREBIR** masa sonrası Tema → Koyu kontrolü.



## Sprint 2 — Ticari modüller (planlı — bire bir bekliyor)



Tahsilatlar, Teslimatlar, Faturalar, İadeler, Depo, Fabrikalar — hedef şablon **A** + detay **B**.  

Mevcut: çoğunlukla **KISMI** (zemin + intro). Detay: [`UI_MASTER_DESIGN_BACKLOG.md`](./UI_MASTER_DESIGN_BACKLOG.md#sprint-2--ticari-modüller-hedef-a-liste--b-detay).



## Sprint 3 — CRM alt katmanlar (planlı — readiness geçici)



Cariler / Siparişler / Teklifler `[id]/*` — hedef **B** kök + **C** katman.  

Mevcut: **READINESS** (`InventoryCommandCenterPage`). Detay: master backlog Sprint 3 bölümü.



## Sprint 4 — İletişim & görevler



Gelen Kutu, Belgeler, Görevler, AI — master backlog Sprint 4.



## Sprint 5 — Ayarlar & sistem



Ayarlar, Kullanıcılar, ERP, Login, Unauthorized, Offline/Demo/Live-empty — master backlog Sprint 5.



## Kontrol Şefi Checklist (özet)



- [ ] Referans görsel ile header/KPI/filtre/kolon/sağ panel eşleşiyor

- [ ] Zümrüt/altın/krem paleti (hardcoded mor/lacivert yok)

- [ ] Shell PageMeta gizli

- [ ] İlk görünüm ≥5 liste satırı

- [ ] Aksiyon kolonu satır sonunda

- [ ] Sağ panel veri varken dolu

- [ ] Body / yatay scroll yok

- [ ] **Koyu mod** kontrol listesi

- [ ] typecheck + smoke:navigation geçti



## Rapor formatı (Kontrol Şefi → Tasarım Müdürü)



```

Sayfa: /stok

Şablon: A

Referans: docs/design/reference/stok-operasyon-masasi-acik-mod.png

Kod (önceki → hedef): BIREBIR

Sonuç: ONAY | REVİZYON

Sapma: (madde madde)

Atanan revizyon: (varsa)

```


