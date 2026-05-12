# TECH_DEBT_HEALTH_REPORT

## 2026-05-12 Health Scan Notes

### 1) Lint gate is placeholder/no-op across workspace
- Hata/Bulgu: `pnpm lint` komutu teknik olarak geçiyor ancak paketlerin çoðu `TODO: configure linting...` placeholder script çalýþtýrýyor.
- Etkilenen dosya(lar): workspace `package.json` scriptleri (apps/* ve packages/* altýndaki package.json dosyalarý).
- Neden riskli: Statik kalite kontrolleri gerçek kurallarla uygulanmadýðý için style/bug sýnýfý sorunlar erken yakalanamýyor.
- Önerilen ayrý görev: Gerçek ESLint kurulumu + paylaþýmlý config + CI lint zorunluluðu.
- Önerilen sahip: Codex

### 2) Expected docs path mismatch with task standard
- Hata/Bulgu: Görevde beklenen `docs/development/CODEX_TASK_STANDARD.md`, `QUALITY_GATES.md`, `AI_SAFETY_AND_APPROVAL_RULES.md` dosyalarý mevcut deðil; kalite notlarý `docs/implementation/002-quality-gate.md` gibi farklý pathlerde bulunuyor.
- Etkilenen dosya(lar): `docs/` bilgi mimarisi.
- Neden riskli: Operasyonel görevlerde yanlýþ dosya referansý nedeniyle süreç tutarsýzlýðý ve onboarding gecikmesi oluþabilir.
- Önerilen ayrý görev: Doküman yollarýný standardize etme ve redirect/index dokümaný ekleme.
- Önerilen sahip: Cursor

### 3) Turbo build outputs warning for web package
- Hata/Bulgu: Build sonunda `WARNING no output files found for task @hallederiz/web#build. Please check your outputs key in turbo.json` uyarýsý alýndý.
- Etkilenen dosya(lar): `turbo.json` (outputs tanýmý), `apps/web` build output pathleri.
- Neden riskli: Cache/CI performansý ve deterministik artifact takibi etkilenebilir.
- Önerilen ayrý görev: Next.js output pathleriyle uyumlu turbo outputs revizyonu.
- Önerilen sahip: Codex

## Not
Bu rapor kapsamýndaki maddeler, ürün davranýþýný deðiþtirmeden saðlýk görünürlüðü amaçlý kaydedilmiþtir.
