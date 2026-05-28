# HallederizCRM — Design tokens (Task 02)

Bu doküman, web arayüzündeki **kanonik tasarım değişkenlerini** tanımlar. Uygulama kaynağı: `apps/web/app/globals.css` içindeki `:root` / `:root[data-theme="dark"]` blokları. Tüm yeni bileşen ve sayfa stillerinde mümkün olduğunca bu token’lar kullanılmalı; ham hex/rgba ile çoğaltmadan kaçının.

**Not:** Monorepo’da `@hallederiz/web` şu an **Tailwind kullanmıyor**; shadcn/ui tam entegrasyonu ileride eklenecekse aşağıdaki **Shadcn eşleme** tablosu tema köprüsü olarak kullanılabilir.

---

## İsimlendirme

- Önek: `--hz-`
- **Semantic:** anlam taşıyan isim (`--hz-surface`, `--hz-text-muted`).
- **Accent:** marka moru / CTA vurgusu (`--hz-accent*`). **Primary** (`--hz-primary*`) lacivert marka + sidebar hattı ile hizalı kalır; ikisini karıştırmayın.

---

## Düzen ve ölçü

| Token | Açıklama |
|--------|-----------|
| `--hz-sidebar-width` | Açık sidebar genişliği |
| `--hz-sidebar-width-collapsed` | Daraltılmış sidebar |
| `--hz-header-height` | Üst bar yüksekliği |
| `--hz-layout-padding-x`, `--hz-layout-padding-y` | Ana içerik dış boşluk |
| `--hz-gap-section`, `--hz-gap-compact`, `--hz-gap-small` | Dikey/yatay ritim |
| `--hz-card-padding`, `--hz-card-padding-sm` | Kart içi padding |
| `--hz-control-height` | Form kontrol yüksekliği hedefi |
| `--hz-toolbar-btn-min-width` | Araç çubuğu buton minimum genişliği |
| `--hz-tab-content-top-padding` | Sekme içeriği üst boşluk |
| `--hz-table-row-height`, `--hz-table-header-height`, `--hz-table-cell-x` | Tablo yoğunluğu |
| `--hz-modal-padding` | Modal iç boşluk |
| `--hz-side-panel-width` | Sağ panel / split varsayılanı (liste + özet) |
| `--hz-detail-panel-width` | Detay / onay önizleme sağ sütunu (`SplitContentLayout` `sideWidth="detail"`) |
| `--hz-content-max-width` | Ana çalışma içeriği üst sınırı (1604px; `PageContent` ile ortalanır) |

---

## Köşe yuvarlaklığı ve gölge

| Token | Tipik kullanım |
|--------|------------------|
| `--hz-radius-modal` | Modal / büyük yüzey |
| `--hz-radius-card` | Kartlar |
| `--hz-radius-control` | Input, buton, chip |
| `--hz-radius-pill` | Badge, pill |
| `--hz-shadow-card` | Kart gölgesi |
| `--hz-shadow-hover` | Hover yükseltmesi |

---

## Yüzey ve sınır

| Token | Anlam |
|--------|--------|
| `--hz-bg` | Sayfa zemin |
| `--hz-surface` | Birincil kart / panel |
| `--hz-surface-soft` | İkincil yüzey |
| `--hz-surface-muted` | Ayırıcı bantlar |
| `--hz-border`, `--hz-border-strong` | Çerçeve |

---

## Metin

| Token | Anlam |
|--------|--------|
| `--hz-text-strong` | Başlık / vurgu |
| `--hz-text-default` | Gövde |
| `--hz-text-muted` | İkincil metin |
| `--hz-text-subtle` | Üçüncül metin |

---

## Tipografi ölçeği

| Token | Varsayılan (light/dark aynı px) |
|--------|----------------------------------|
| `--hz-font-sans` | Yazı ailesi yığını |
| `--hz-text-xs` … `--hz-text-xl` | Boyut kademesi |
| `--hz-leading-tight`, `--hz-leading-snug`, `--hz-leading-normal` | Satır yüksekliği |
| `--hz-font-weight-medium`, `--hz-font-weight-semibold`, `--hz-font-weight-bold` | Ağırlık |

`body` gövdesi: `font-size: var(--hz-text-sm)`, `line-height: var(--hz-leading-normal)`.

---

## Renk — semantik (durum)

| Token | Kullanım |
|--------|-----------|
| `--hz-primary`, `--hz-primary-strong`, `--hz-primary-soft` | Marka lacivert hattı |
| `--hz-info`, `--hz-info-soft` | Bilgi |
| `--hz-success`, `--hz-success-soft` | Başarı |
| `--hz-warning`, `--hz-warning-soft` | Uyarı |
| `--hz-danger`, `--hz-danger-soft` | Hata / tehlike |

---

## Accent (mor vurgu)

| Token | Kullanım |
|--------|-----------|
| `--hz-accent` | Birincil CTA, link vurgusu, AI hattı vurguları |
| `--hz-accent-strong` | Hover / pressed |
| `--hz-accent-soft` | Arka plan lekesi |
| `--hz-on-accent` | Accent üzerinde metin / ikon |

---

## Hareket (motion)

| Token | Kullanım |
|--------|-----------|
| `--hz-motion-duration-75` … `300` | Geçiş süreleri (ms) |
| `--hz-motion-ease`, `--hz-motion-ease-out`, `--hz-motion-ease-in-out` | Easing eğrileri |

Örnek:

```css
.example {
  transition:
    box-shadow var(--hz-motion-duration-200) var(--hz-motion-ease-out),
    border-color var(--hz-motion-duration-150) var(--hz-motion-ease);
}
```

---

## Erişilebilirlik — odak

| Token | Kullanım |
|--------|-----------|
| `--hz-focus-ring-color` | `focus-visible` için `box-shadow` veya `outline-color` ile birleşik halka |

Örnek (bileşen içinde):

```css
.interactive:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--hz-surface),
    0 0 0 4px var(--hz-focus-ring-color);
}
```

---

## Shadcn / Tailwind (gelecek tema köprüsü)

Projede henüz `tailwind.config` yok. Tailwind + shadcn eklendiğinde `theme.extend` veya `@theme` içinde aşağıdaki eşleme ile HZ token’ları tek kaynaktan türetilebilir:

| shadcn anlamı | Önerilen HZ kaynağı |
|----------------|---------------------|
| `background` | `--hz-bg` veya `--hz-surface` (bağlama göre) |
| `foreground` | `--hz-text-default` |
| `card` | `--hz-surface` |
| `muted` | `--hz-surface-soft` |
| `border` | `--hz-border` |
| `primary` | **Dikkat:** shadcn’de tek “primary” varsa; CRM’de lacivert ana marka için `--hz-primary`, CTA moru için `--hz-accent` ayrı tutulmalı |
| `destructive` | `--hz-danger` |
| `ring` | `--hz-focus-ring-color` |

---

## Bakım

1. Yeni token eklerken hem **light** hem **dark** blokları güncelleyin.
2. Bu dosyayı ve `globals.css` başlığını aynı PR’da tutarlı tutun.
3. UI dönüşüm görev sırası: [UI_TRANSFORMATION_TASKS.md](./UI_TRANSFORMATION_TASKS.md).
4. Primitive bileşenler ve `hz-ui-*` sınıfları: [UI_PRIMITIVES.md](./UI_PRIMITIVES.md).
5. Shell / içerik hizası: [APPSHELL_LAYOUT.md](./APPSHELL_LAYOUT.md).
