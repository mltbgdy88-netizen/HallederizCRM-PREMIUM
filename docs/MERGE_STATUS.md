# HallederizCRM Birleştirme Durumu



**Sandbox:** `c:\Users\mevlu\Desktop\xxxhallederizcrm`  

**Kaynak UI:** `hallederizcrm final` (read-only)  

**Kaynak altyapı:** `HallederizCRM-PREMIUM-CURSOR` (read-only)  

**Son güncelleme:** 2026-05-27



## Tamamlanan fazlar



| Faz | Durum | Özet |

|-----|-------|------|

| 0 — Sandbox | ✅ | PREMIUM kopyalandı, `pnpm install`, Final `docs/design` → `docs/design/final-reference` |

| 1 — Kabuk | ✅ | `ReferenceAppShell` + auth, login split, sistem state Final UI, `reference-globals.css` |

| 2 — P0 ekranlar | ✅ | dashboard, hizli-islem, onaylar, cariler, teklifler, siparisler, tahsilatlar, belgeler, whatsapp |

| 3 — Kalan ekranlar | ✅ | 81 route wired; `audit-reference-routes` 81/81; envanter [`MERGE_UI_INVENTORY.md`](./MERGE_UI_INVENTORY.md) |

| 4 — Canlı veri | 🔄 | P0 + arşiv/rapor/gelen-kutu + cariler detay/katman + sipariş/teklif detay + gösterge paneli adapter |

| 5 — Cutover | 🔄 | QA: web/ui typecheck + smoke:navigation PASS; tam monorepo gate ayrıca koşturulmalı |



## Son QA (takım)

- `pnpm --filter @hallederiz/web typecheck` — PASS (son koşum öncesi)
- `pnpm smoke:navigation` — PASS

## Navigasyon IA (2026-05-27)

- Sidebar **19 → 13** kalem: [`docs/NAVIGATION_IA.md`](./NAVIGATION_IA.md)
- Yeni hub: `/muhasebe` (Fatura, Tahsilat, İade kapıları)
- ERP sidebar’dan çıktı → **Ayarlar → Entegrasyonlar** (`/erp`)
- Siparişler sidebar’a eklendi
- Otomasyon hedefi: [`docs/OPERATION_AUTOMATION_TARGET.md`](./OPERATION_AUTOMATION_TARGET.md)

Rapor: [`docs/team-reports/qa-controller-report.md`](./team-reports/qa-controller-report.md)

## Veri bağlama (referans UI ← PREMIUM)

|-------|---------|------|

| Dashboard | `dashboard/adapters/` | `useDashboardReferenceData` |
| Dashboard gösterge (`/dashboard`) | `dashboard-gosterge-reference-adapter` | `useDashboardGostergeReferenceData` |

| Cariler liste | `cariler/adapters/` | `useCarilerReferenceData` |

| Cariler detay | `cariler-detay-reference-adapter` | `useCarilerDetayReferenceData` |

| Cariler katman (7) | `cariler-katman-reference-adapter` | `useCarilerKatmanReferenceData` |

| Teklifler liste | `teklifler/adapters/` | `useTekliflerReferenceData` |

| Teklifler detay | `teklifler-detay-reference-adapter` | `useTekliflerDetayReferenceData` |

| Siparişler liste | `siparisler/adapters/` | `useSiparislerReferenceData` |

| Siparişler detay | `siparisler-detay-reference-adapter` | `useSiparislerDetayReferenceData` |

| Tahsilatlar, Stok, Onaylar, Belgeler, WhatsApp | ✅ | ilgili `use*ReferenceData` |

| Hızlı İşlem | `hizli-islem/adapters/` + preview | `useHizliIslemReferenceData`, `useHizliIslemActionPreview` |

| Arşiv, Raporlar, Gelen Kutu | ✅ | + canlı mesaj yükleme (gelen kutu) |



**ID çözümleme:** `?customerId=`, `?orderId=`, `?offerId=` veya `REFERENCE_ROUTE_IDS` (`customer_1`, demo primary order/offer).



**İlke:** [`docs/premium-reference/DATA_BINDING_POLICY.md`](./premium-reference/DATA_BINDING_POLICY.md)



## Sıradaki modüller (ince ayar)



- Canlı KPI eşlemesi: gösterge paneli stok kartları ↔ API `cardValues` anahtarları

- Liste → katman: sipariş/teklif operasyon satırından **Katman** linki (`?orderId=` / `?offerId=`) eklendi

- Emerald ana sayfa (`/ana-sayfa`) ayrı kabuk; platform `/dashboard` = Final gösterge paneli



## Bilinen adımlar



1. Liste satırından detay linklerine ID query — P0 operasyon + belgeler/depo/görevler + sipariş/teklif katman tamam

2. Hızlı İşlem `submitQuickOperationRecord` — yalnızca onay zinciri ile

3. Eski CommandCenter temizliği

4. `turbo run typecheck --force` + `smoke:product-readiness` cutover gate



## Orijinal projeler



`HallederizCRM-PREMIUM-CURSOR` ve `hallederizcrm final` birleştirme sırasında **değiştirilmedi**.


