# UI Redesign Mockup Report — 2026-05-21 (critical PR)

## Palette
- Deep Emerald `#064E3B`, Primary `#047857`, Soft `#D1FAE5`
- Gold `#D4AF37`, Warm `#F2C94C`
- Ivory `#F8F5EC`, Paper `#FFFCF4`, Soft `#F3EFE4`
- Text `#102A24` / `#5B6B63`, Border `rgba(6,78,59,0.16)`, Ruby `#B42318`

## Typography
- Body 14/20, table 13/18, page title 22–26, section 15–17, label 12–13, button 13–14 semibold

## Desktop layout
- Shell: emerald sidebar + ivory workspace + paper cards
- Dashboard: main + AI column
- QOP: segments row, actions right (no overlap)
- Tahsilat: 2-col form desktop, action band below fields

## Mobile layout
- Header: stacked; actions in `⋯` drawer; profile `details` closed by default
- QOP: column head; segments wrap; actions full width
- Tahsilat: single column; stacked full-width buttons

## Action readiness (mockup intent)
- Demo: gold band, disabled primary “Demo önizleme”
- Live empty reports: export disabled
- WhatsApp/AI not configured: pending band + disabled mutations

## Risks
- Legacy purple route CSS may still appear on unmigrated pages (deferred batches)
- Screenshot QA requires local dev + playwright capture

## Files
- `shell-dashboard.html`
- `qop-tahsilat.html`
- Capture: run `node capture-mockups.mjs` (playwright, optional)
