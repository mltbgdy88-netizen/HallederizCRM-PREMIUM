# Director Pipeline — sürekli üretim hattı

**Hedef:** `UI_REFERENCE_MASTER_QUEUE.md` içinde `pending` / `qa-fail` kalmayana kadar durmadan çalış.

## Roller ve sıra

1. **Implementer** — `pending` veya `qa-fail` (REVIZE) satırı alır → `in-progress` → bitince `qa-review`
2. **Design Auditor** — `qa-review` satırı alır → rapor yazar → `qa-pass` | `qa-fail`
3. **Director** — `qa-pass` → final kontrol → `done` + `DONE_SCREENS.md`; `qa-fail` → REVIZE emri → tekrar implementer

## QA → Director hatırlatma (zorunlu)

Her QA turu sonunda `docs/design/DIRECTOR_INBOX.md` dosyasına **en alta** ekle:

```markdown
### YYYY-MM-DD HH:mm — <slug>
- **Sonuç:** qa-pass | qa-fail
- **Rapor:** docs/design/qa-reports/<slug>.md
- **Director aksiyon:** Sonraki pending dalga ataması / REVIZE gönder
```

Director inbox okuyunca **hemen** yeni implementer/QA görevleri dağıtır (boş kuyruk yok).

## Paralellik

- Aynı PNG’ye iki implementer **yok**
- Aynı anda en fazla **4 implementer** + **2 QA**
- `pnpm build`: dev kapalı (`pnpm stop-dev` sonra build; agent talimatı)

## Altın kalıp

`/dashboard/gosterge-paneli` — `DashboardGostergePaneliPage.tsx`, mock bire bir, `100dvh`, scroll yok.

## Route tahmini

`docs/design/ROUTE_MAP.md` — implementer route’u buradan alır.
