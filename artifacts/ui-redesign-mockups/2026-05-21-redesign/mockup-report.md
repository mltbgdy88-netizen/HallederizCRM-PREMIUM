# UI Redesign Mockup Report — 2026-05-21

## Palette
- Deep Emerald `#064E3B`, Primary `#047857`, Soft Emerald `#D1FAE5`
- Gold `#D4AF37`, Warm Gold `#F2C94C`
- Ivory `#F8F5EC`, Paper `#FFFCF4`, Soft Surface `#F3EFE4`
- Text `#102A24` / `#5B6B63`, Border `rgba(6,78,59,0.16)`, Ruby `#B42318`

## Typography
- Body 14/20, table 13/18, page title 22–26, section 15–17, label 12–13, button 13–14 semibold

## Groups (this PR)
1. **Shell + Dashboard + Mobile drawer** — `shell-dashboard.html`
2. **Hızlı İşlem + Tahsilat** — `quick-op-payment.html`

## Mobile layout notes
- Header: stacked meta → search → compact actions drawer + collapsed profile
- QOP: segments full-width row, actions second row (no overlay on segments)
- Tahsilat: single column form, full-width CTA band

## Action readiness (mockup intent)
- Demo: gold band, CTA “Demo önizleme”, disabled submit
- Live empty reports: export disabled, “Canlı veri bekleniyor”
- WhatsApp/AI not configured: pending band, mutation buttons disabled

## Risks
- Legacy purple QOP tokens still in `.hz-qop-page` — phased replacement in later batches
- Full CRM table polish deferred to follow-up PRs

## Screenshots
Run (local, not committed):
```powershell
$npx = "npx"
& $npx -p playwright node artifacts/ui-redesign-mockups/2026-05-21-redesign/capture-mockups.mjs
```
