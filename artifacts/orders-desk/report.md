# Orders Desk Screenshot QA Report

**Date:** 2026-05-22  
**Route:** `/siparisler`  
**Branch:** `fix/ui-crm-commercial-visual-redesign`  
**Base HEAD:** `30d5629` (includes approvals desk commit on branch)

## Capture status

| Asset | Status | Notes |
|-------|--------|-------|
| `orders-1366x768.png` | Pending local capture | Run dev server + viewport 1366×768 |
| `orders-1920x1080.png` | Pending local capture | Run dev server + viewport 1920×1080 |
| `orders-mobile.png` | Pending local capture | Viewport 390×844 |

Automated Playwright capture not wired in repo scripts for this task.

## Checklist (code review)

| Check | Result |
|-------|--------|
| Horizontal overflow guard CSS | Pass — root `overflow: hidden`, table wrap scroll |
| Header overlay | Pass — `suppressPageMeta` via `platform-route-meta` for `/siparisler` |
| Stats + list + preview same viewport | Pass — grid `1fr 330px` |
| Payment/tahsilat visible | Pass — badges + preview card + Tahsilat link |
| No «onaya gönder» | Pass — grep clean on OrdersDesk* |
| Mobile single column | Pass — `@media (max-width: 860px)` |
| Technical leakage | Pass — `pnpm ui:guard` |
| Fake success | Pass — navigation-only buttons |

## Known visual gaps

- Screenshots not yet captured in this artifact folder.
- «Vadesi geldi» badge not mapped (uses Bekliyor for unpaid).
- Viewport row count at 1366×768 not pixel-verified in CI.
