# UI Acceptance Guide

Use screenshots for acceptance.

## Check screens

- /hizli-islem
- /whatsapp
- /ayarlar
- /stok
- /depo
- /depo/emirler/{id}

## Accept if

- Screen is calm and focused.
- Main action is clear.
- No duplicated primary actions.
- No rainbow color usage.
- Text uses user language, not technical codes.
- Tables do not overflow or cut actions.
- Detail opens only where intended.
- Page belongs to the same visual product family.

## Reject if

- Looks like a demo KPI showcase.
- Too many badges, counters, summaries, or charts appear.
- Same action appears in top and bottom areas.
- Buttons wrap or overflow.
- Labels are technical or confusing.
- Modal or detail behavior opens accidentally.

## Follow-up rule

Only create small UI fix PRs before UI lock.

Do not start backend or engine work during acceptance.
