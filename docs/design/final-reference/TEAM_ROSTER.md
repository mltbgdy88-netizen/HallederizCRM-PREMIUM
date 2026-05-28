# Tasarım ekibi — görev dağılımı

**Müdür / Baş tasarımcı:** Design Director (ana agent)  
**Altın standart:** `dashboard-gosterge-paneli-acik-mod` ✅

## Ekip yapısı

| # | Rol | Sorumluluk | Aktif görev (Dalga 1) |
|---|-----|------------|-------------------------|
| 1 | **Design Director** | Plan, atama, REVIZE, `DONE_SCREENS` | Tüm 81 PNG kuyruğu |
| 2 | **Shell Engineer** | `AppShell`, route grupları, nav aktif | İhtiyaç halinde (ortak) |
| 3a | **Implementer — Stok** | Sprint1 stok masası | `stok-operasyon-masasi-acik-mod` → `/stok` |
| 3b | **Implementer — Hızlı İşlem** | Ek alternatif merkez | `hizli-islem-merkezi-acik-mod` → `/hizli-islem` |
| 3c | **Implementer — WhatsApp** | Sprint1 panel | `whatsapp-operasyon-paneli-acik-mod` → `/whatsapp` |
| 4 | **Design Auditor (QA)** | PNG ↔ UI, şablon rapor | W0: operasyon dashboard + ana sayfa emerald |

## Sonraki dalga (kuyrukta)

- `_ek-alternatifler`: gelen-kutu, hizli-satis
- `00-onayli-sprint1`: arşiv, raporlar
- `01-teklifler` … `21-sistem` (sıra: `UI_REFERENCE_MASTER_QUEUE.md`)

## Kalite kapısı

```
Implementer → qa-review → QA raporu → qa-pass | qa-fail
                ↑ fail: REVIZE emri
                              ↓ pass: Director → done
```

QA **yalan PASS** verirse: Director uyarısı + yeniden denetim (policy: `AGENTS.md`).
